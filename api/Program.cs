using Microsoft.EntityFrameworkCore;
using ReferenceArchitecture.Api.Data;
using Scalar.AspNetCore;
using Serilog;
using Serilog.Events;

// Configure Serilog before building the host so we capture startup logs
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .Enrich.WithEnvironmentName()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting ReferenceArchitecture.Api");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console(
            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
            .Filter.ByExcluding(logEvent => 
                logEvent.Properties.TryGetValue("RequestPath", out var path) 
                && path.ToString().Contains("/health"))
        .WriteTo.ApplicationInsights(
            services.GetRequiredService<Microsoft.ApplicationInsights.Extensibility.TelemetryConfiguration>(),
            new Serilog.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter()));
    
    // Application Insights (this also enables automatic request/dependency tracking)
    builder.Services.AddApplicationInsightsTelemetry();
    // builder.Services.AddApplicationInsightsTelemetry(options =>
    // {
    //     options.ConnectionString = 
    //         builder.Configuration["ApplicationInsights:ConnectionString"]
    //             ?? builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"];
    // });
    
    builder.Services.AddControllers();
    builder.Services.AddOpenApi();
    builder.Services.AddHealthChecks();
    
    const string AllowedOriginsPolicy = "AllowedOrigins";
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(AllowedOriginsPolicy, policy =>
        {
            var allowedOrigins = builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? Array.Empty<string>();

            policy.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
    });

    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("DefaultConnection connection string is not configured.");

    builder.Services.AddDbContext<AppDbContext>(options =>
    {
        options.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        });
    });

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var pending = db.Database.GetPendingMigrations().ToList();
        if (pending.Count > 0)
        {
            Log.Fatal("Database schema is out of date. {Count} pending migration(s): {Migrations}. " +
                      "Run the migrate workflow before deploying.",
                pending.Count, pending);
            return 1;
        }
    }

    // var telemetryConfig = app.Services.GetRequiredService<Microsoft.ApplicationInsights.Extensibility.TelemetryConfiguration>();
    // Log.Information("App Insights connection string in use: {ConnectionString}", 
    //     string.IsNullOrEmpty(telemetryConfig.ConnectionString) 
    //         ? "EMPTY" 
    //         : telemetryConfig.ConnectionString.Substring(0, Math.Min(60, telemetryConfig.ConnectionString.Length)) + "...");

    
    // Serilog request logging — replaces ASP.NET Core's default
    app.UseSerilogRequestLogging();

    app.UseCors(AllowedOriginsPolicy);

    app.MapOpenApi();
    app.MapScalarApiReference();
    app.MapControllers();
    app.MapHealthChecks("/health");
    
    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "ReferenceArchitecture.Api terminated unexpectedly");
    return 1;
}
finally
{
    Log.CloseAndFlush();
}

return 0;