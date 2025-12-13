namespace Trophy3D.Api.Services;

using Trophy3D.Api.Models;

/// <summary>
/// Service interface for trophy-related operations.
/// </summary>
public interface ITrophyService
{
    /// <summary>
    /// Submits a new trophy nomination.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <param name="request">The trophy submission request.</param>
    /// <returns>The submitted trophy response.</returns>
    Task<TrophySubmissionResponse> SubmitTrophyAsync(string sessionCode, TrophySubmissionRequest request);

    /// <summary>
    /// Retrieves all trophies for a session.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>List of trophy submissions.</returns>
    Task<List<TrophySubmissionResponse>> GetTrophiesBySessionAsync(string sessionCode);

    /// <summary>
    /// Retrieves a single trophy with presentation details.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <param name="trophyId">The trophy ID.</param>
    /// <returns>The trophy details response.</returns>
    Task<TrophyDetailsResponse> GetTrophyDetailsAsync(string sessionCode, Guid trophyId);
}
