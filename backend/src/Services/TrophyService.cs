namespace Trophy3D.Api.Services;

using Trophy3D.Api.Data;
using Trophy3D.Api.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Service for managing trophy submissions.
/// </summary>
public class TrophyService : ITrophyService
{
    private readonly TrophyDbContext _context;
    private readonly ILogger<TrophyService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TrophyService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public TrophyService(TrophyDbContext context, ILogger<TrophyService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Submits a new trophy nomination.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <param name="request">The trophy submission request.</param>
    /// <returns>The submitted trophy response.</returns>
    public async Task<TrophySubmissionResponse> SubmitTrophyAsync(string sessionCode, TrophySubmissionRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.RecipientName))
        {
            throw new ArgumentException("Recipient name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.AchievementText))
        {
            throw new ArgumentException("Achievement text is required.");
        }

        request.RecipientName = request.RecipientName.Trim();
        request.AchievementText = request.AchievementText.Trim();

        if (request.RecipientName.Length > 100)
        {
            throw new ArgumentException("Recipient name cannot exceed 100 characters.");
        }

        if (request.AchievementText.Length > 500)
        {
            throw new ArgumentException("Achievement text cannot exceed 500 characters.");
        }

        // Get the session
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.SessionCode == sessionCode);

        if (session == null)
        {
            throw new KeyNotFoundException($"Session {sessionCode} not found.");
        }

        if (session.IsExpired())
        {
            throw new InvalidOperationException($"Session {sessionCode} has expired.");
        }

        // Check if session is in collecting state
        if (session.Status != SessionStatus.Created && session.Status != SessionStatus.Collecting)
        {
            throw new InvalidOperationException($"Session is not accepting submissions. Current status: {session.Status}");
        }

        // Update session status to collecting if it's still in created state
        if (session.Status == SessionStatus.Created)
        {
            session.Status = SessionStatus.Collecting;
            _context.Sessions.Update(session);
        }

        // Get next display order
        var nextDisplayOrder = await _context.TrophySubmissions
            .Where(t => t.SessionId == session.Id)
            .MaxAsync(t => (int?)t.DisplayOrder) ?? 0;
        nextDisplayOrder++;

        // Create the trophy submission
        var trophy = new TrophySubmission
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            RecipientName = request.RecipientName,
            AchievementText = request.AchievementText,
            SubmitterName = request.SubmitterName?.Trim(),
            SubmittedAt = DateTime.UtcNow,
            DisplayOrder = nextDisplayOrder
        };

        _context.TrophySubmissions.Add(trophy);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Trophy submitted in session {SessionCode} for {RecipientName}", sessionCode, trophy.RecipientName);

        return MapTrophyToResponse(trophy);
    }

    /// <summary>
    /// Retrieves all trophies for a session.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>List of trophy submissions.</returns>
    public async Task<List<TrophySubmissionResponse>> GetTrophiesBySessionAsync(string sessionCode)
    {
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.SessionCode == sessionCode);

        if (session == null)
        {
            throw new KeyNotFoundException($"Session {sessionCode} not found.");
        }

        var trophies = await _context.TrophySubmissions
            .Where(t => t.SessionId == session.Id)
            .OrderBy(t => t.DisplayOrder)
            .ToListAsync();

        return trophies.Select(MapTrophyToResponse).ToList();
    }

    /// <summary>
    /// Retrieves a single trophy with presentation details.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <param name="trophyId">The trophy ID.</param>
    /// <returns>The trophy details response.</returns>
    public async Task<TrophyDetailsResponse> GetTrophyDetailsAsync(string sessionCode, Guid trophyId)
    {
        var session = await _context.Sessions
            .FirstOrDefaultAsync(s => s.SessionCode == sessionCode);

        if (session == null)
        {
            throw new KeyNotFoundException($"Session {sessionCode} not found.");
        }

        var trophy = await _context.TrophySubmissions
            .FirstOrDefaultAsync(t => t.Id == trophyId && t.SessionId == session.Id);

        if (trophy == null)
        {
            throw new KeyNotFoundException($"Trophy {trophyId} not found in session {sessionCode}.");
        }

        // Get the next trophy
        var nextTrophy = await _context.TrophySubmissions
            .Where(t => t.SessionId == session.Id && t.DisplayOrder > trophy.DisplayOrder)
            .OrderBy(t => t.DisplayOrder)
            .FirstOrDefaultAsync();

        var isLastTrophy = nextTrophy == null;

        return new TrophyDetailsResponse
        {
            Id = trophy.Id,
            RecipientName = trophy.RecipientName,
            AchievementText = trophy.AchievementText,
            SubmitterName = trophy.SubmitterName,
            DisplayOrder = trophy.DisplayOrder,
            NextTrophyId = nextTrophy?.Id,
            IsLastTrophy = isLastTrophy
        };
    }

    /// <summary>
    /// Maps a TrophySubmission entity to a TrophySubmissionResponse DTO.
    /// </summary>
    private TrophySubmissionResponse MapTrophyToResponse(TrophySubmission trophy)
    {
        return new TrophySubmissionResponse
        {
            Id = trophy.Id,
            RecipientName = trophy.RecipientName,
            AchievementText = trophy.AchievementText,
            SubmitterName = trophy.SubmitterName,
            SubmittedAt = trophy.SubmittedAt,
            DisplayOrder = trophy.DisplayOrder
        };
    }
}
