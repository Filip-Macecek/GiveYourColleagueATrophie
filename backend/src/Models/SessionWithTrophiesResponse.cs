namespace Trophy3D.Api.Models;

/// <summary>
/// DTO for session response with trophies.
/// </summary>
public class SessionWithTrophiesResponse
{
    /// <summary>Gets or sets the session details.</summary>
    public SessionResponse Session { get; set; } = new();

    /// <summary>Gets or sets the list of trophies.</summary>
    public List<TrophySubmissionResponse> Trophies { get; set; } = new();
}
