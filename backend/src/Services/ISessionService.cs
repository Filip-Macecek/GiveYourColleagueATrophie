namespace Trophy3D.Api.Services;

using Trophy3D.Api.Models;

/// <summary>
/// Service interface for session-related operations.
/// </summary>
public interface ISessionService
{
    /// <summary>
    /// Creates a new session with organizer details.
    /// </summary>
    /// <param name="organizerName">Optional name of the organizer.</param>
    /// <returns>The created session response.</returns>
    Task<SessionResponse> CreateSessionAsync(string? organizerName = null);

    /// <summary>
    /// Retrieves a session by its code.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The session, or null if not found.</returns>
    Task<Session?> GetSessionByCodeAsync(string sessionCode);

    /// <summary>
    /// Retrieves a session with all trophies.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The session with trophies response.</returns>
    Task<SessionWithTrophiesResponse> GetSessionWithTrophiesAsync(string sessionCode);

    /// <summary>
    /// Transitions a session to presentation mode.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The updated session response.</returns>
    Task<SessionResponse> StartPresentationAsync(string sessionCode);

    /// <summary>
    /// Closes a session explicitly.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The closed session response.</returns>
    Task<SessionResponse> CloseSessionAsync(string sessionCode);
}
