namespace Trophy3D.Api.Models;

/// <summary>
/// Represents a trophy-sharing session.
/// </summary>
public class Session
{
    /// <summary>Gets or sets the unique session identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the human-readable session code (e.g., "TROPHY-ABC123").</summary>
    public string SessionCode { get; set; } = string.Empty;

    /// <summary>Gets or sets the organizer's user ID.</summary>
    public Guid OrganizerId { get; set; }

    /// <summary>Gets or sets the current session status.</summary>
    public SessionStatus Status { get; set; } = SessionStatus.Created;

    /// <summary>Gets or sets the creation timestamp.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Gets or sets the expiration timestamp (24 hours from creation).</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Gets or sets the closure timestamp (nullable).</summary>
    public DateTime? ClosedAt { get; set; }

    /// <summary>Gets or sets the collection of trophy submissions.</summary>
    public ICollection<TrophySubmission> Trophies { get; set; } = new List<TrophySubmission>();

    /// <summary>
    /// Determines if the session has expired.
    /// </summary>
    /// <returns>True if the session has expired; otherwise false.</returns>
    public bool IsExpired() => DateTime.UtcNow > ExpiresAt;

    /// <summary>
    /// Gets the computed shareable URL.
    /// </summary>
    public string ShareableUrl => $"/share/{SessionCode}";
}
