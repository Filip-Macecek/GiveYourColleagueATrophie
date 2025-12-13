namespace Trophy3D.Api.Models;

/// <summary>
/// Represents a lightweight user entity.
/// </summary>
public class User
{
    /// <summary>Gets or sets the unique user identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the user's name (optional, can be anonymous).</summary>
    public string? Name { get; set; }

    /// <summary>Gets or sets the session ID if user is an organizer (optional).</summary>
    public Guid? SessionId { get; set; }

    /// <summary>Gets or sets the creation timestamp.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
