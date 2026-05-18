using Microsoft.EntityFrameworkCore;
using ReferenceArchitecture.Api.Entities;

namespace ReferenceArchitecture.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Note> Notes => Set<Note>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Note>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Title).HasMaxLength(200).IsRequired();
            entity.Property(n => n.Body).HasMaxLength(4000);
            entity.Property(n => n.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        });
    }
}