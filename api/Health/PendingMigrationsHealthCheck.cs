using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using ReferenceArchitecture.Api.Data;

namespace ReferenceArchitecture.Api.Health;

public class PendingMigrationsHealthCheck : IHealthCheck
{
    private readonly IServiceScopeFactory _scopeFactory;

    public PendingMigrationsHealthCheck(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(15));

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var pending = (await db.Database.GetPendingMigrationsAsync(cts.Token)).ToList();

            return pending.Count > 0
                ? HealthCheckResult.Unhealthy(
                    $"{pending.Count} pending migration(s): {string.Join(", ", pending)}")
                : HealthCheckResult.Healthy();
        }
        catch (OperationCanceledException)
        {
            return HealthCheckResult.Unhealthy("Database schema check timed out.");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Unable to verify database schema.", ex);
        }
    }
}
