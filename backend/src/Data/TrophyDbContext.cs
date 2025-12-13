namespace Trophy3D.Api.Data;

using Microsoft.EntityFrameworkCore;
using Trophy3D.Api.Models;

/// <summary>
/// Entity Framework Core DbContext for Trophy3D application.
/// Manages Sessions, TrophySubmissions, and Users.
/// </summary>
public class TrophyDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the <see cref="TrophyDbContext"/> class.
    /// </summary>
    /// <param name="options">DbContext options.</param>
    public TrophyDbContext(DbContextOptions<TrophyDbContext> options)
        : base(options)
    {
    }

    /// <summary>Gets or sets the Sessions table.</summary>
    public DbSet<Session> Sessions { get; set; }

    /// <summary>Gets or sets the TrophySubmissions table.</summary>
    public DbSet<TrophySubmission> TrophySubmissions { get; set; }

    /// <summary>Gets or sets the Users table.</summary>
    public DbSet<User> Users { get; set; }

    /// <summary>
    /// Configures the EF Core model.
    /// </summary>
    /// <param name="modelBuilder">The model builder.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Session configuration
        modelBuilder.Entity<Session>()
            .HasKey(s => s.Id);

        modelBuilder.Entity<Session>()
            .HasIndex(s => s.SessionCode)
            .IsUnique();

        modelBuilder.Entity<Session>()
            .Property(s => s.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Session>()
            .HasMany(s => s.Trophies)
            .WithOne(t => t.Session)
            .HasForeignKey(t => t.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // TrophySubmission configuration
        modelBuilder.Entity<TrophySubmission>()
            .HasKey(t => t.Id);

        modelBuilder.Entity<TrophySubmission>()
            .HasOne(t => t.Session)
            .WithMany(s => s.Trophies)
            .HasForeignKey(t => t.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // User configuration
        modelBuilder.Entity<User>()
            .HasKey(u => u.Id);
    }
}
