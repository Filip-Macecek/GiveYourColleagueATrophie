namespace Trophy3D.Api.Models;

/// <summary>
/// DTO for creating a new session.
/// </summary>
public class CreateSessionRequest
{
    /// <summary>Gets or sets the optional organizer name.</summary>
    public string? OrganizerName { get; set; }
}
