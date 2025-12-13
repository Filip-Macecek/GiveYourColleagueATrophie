namespace Trophy3D.Api.Models;

/// <summary>
/// DTO for session response data.
/// </summary>
public class SessionResponse
{
    /// <summary>Gets or sets the session ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the shareable session code.</summary>
    public string SessionCode { get; set; } = string.Empty;

    /// <summary>Gets or sets the shareable URL.</summary>
    public string ShareableUrl { get; set; } = string.Empty;

    /// <summary>Gets or sets the session status.</summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>Gets or sets the creation timestamp.</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Gets or sets the expiration timestamp.</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Gets or sets the count of trophies in the session.</summary>
    public int TrophyCount { get; set; }
}
