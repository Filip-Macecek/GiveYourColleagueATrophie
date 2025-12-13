namespace Trophy3D.Api.Services;

using Trophy3D.Api.Data;
using Trophy3D.Api.Models;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Service for managing trophy-sharing sessions.
/// </summary>
public class SessionService : ISessionService
{
    private readonly TrophyDbContext _context;
    private readonly ILogger<SessionService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SessionService"/> class.
    /// </summary>
    /// <param name="context">The database context.</param>
    /// <param name="logger">The logger.</param>
    public SessionService(TrophyDbContext context, ILogger<SessionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new session with organizer details.
    /// </summary>
    /// <param name="organizerName">Optional name of the organizer.</param>
    /// <returns>The created session response.</returns>
    public async Task<SessionResponse> CreateSessionAsync(string? organizerName = null)
    {
        var session = new Session
        {
            Id = Guid.NewGuid(),
            SessionCode = GenerateSessionCode(),
            OrganizerId = Guid.NewGuid(),
            Status = SessionStatus.Created,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        // Create organizer user if name provided
        if (!string.IsNullOrWhiteSpace(organizerName))
        {
            var organizer = new User
            {
                Id = session.OrganizerId,
                Name = organizerName,
                SessionId = session.Id,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(organizer);
        }

        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Session created with code: {SessionCode}", session.SessionCode);

        return MapSessionToResponse(session);
    }

    /// <summary>
    /// Retrieves a session by its code.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The session, or null if not found.</returns>
    public async Task<Session?> GetSessionByCodeAsync(string sessionCode)
    {
        return await _context.Sessions
            .FirstOrDefaultAsync(s => s.SessionCode == sessionCode);
    }

    /// <summary>
    /// Retrieves a session with all trophies.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The session with trophies response.</returns>
    public async Task<SessionWithTrophiesResponse> GetSessionWithTrophiesAsync(string sessionCode)
    {
        var session = await _context.Sessions
            .Include(s => s.Trophies)
            .FirstOrDefaultAsync(s => s.SessionCode == sessionCode);

        if (session == null)
        {
            throw new KeyNotFoundException($"Session {sessionCode} not found.");
        }

        if (session.IsExpired())
        {
            throw new InvalidOperationException($"Session {sessionCode} has expired.");
        }

        return new SessionWithTrophiesResponse
        {
            Session = MapSessionToResponse(session),
            Trophies = session.Trophies
                .OrderBy(t => t.DisplayOrder)
                .Select(MapTrophyToResponse)
                .ToList()
        };
    }

    /// <summary>
    /// Transitions a session to presentation mode.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The updated session response.</returns>
    public async Task<SessionResponse> StartPresentationAsync(string sessionCode)
    {
        var session = await GetSessionByCodeAsync(sessionCode);
        if (session == null)
        {
            throw new KeyNotFoundException($"Session {sessionCode} not found.");
        }

        if (session.IsExpired())
        {
            throw new InvalidOperationException($"Session {sessionCode} has expired.");
        }

        var trophyCount = await _context.TrophySubmissions
            .CountAsync(t => t.SessionId == session.Id);

        if (trophyCount == 0)
        {
            throw new InvalidOperationException("Cannot start presentation without trophies.");
        }

        session.Status = SessionStatus.Presenting;
        _context.Sessions.Update(session);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Session {SessionCode} transitioned to presentation mode", sessionCode);

        return MapSessionToResponse(session);
    }

    /// <summary>
    /// Closes a session explicitly.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The closed session response.</returns>
    public async Task<SessionResponse> CloseSessionAsync(string sessionCode)
    {
        var session = await GetSessionByCodeAsync(sessionCode);
        if (session == null)
        {
            throw new KeyNotFoundException($"Session {sessionCode} not found.");
        }

        session.Status = SessionStatus.Closed;
        session.ClosedAt = DateTime.UtcNow;
        _context.Sessions.Update(session);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Session {SessionCode} closed", sessionCode);

        return MapSessionToResponse(session);
    }

    /// <summary>
    /// Generates a unique session code.
    /// </summary>
    /// <returns>An 8-character alphanumeric session code.</returns>
    private string GenerateSessionCode()
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        var code = new System.Text.StringBuilder();

        for (int i = 0; i < 8; i++)
        {
            code.Append(chars[random.Next(chars.Length)]);
        }

        return code.ToString();
    }

    /// <summary>
    /// Maps a Session entity to a SessionResponse DTO.
    /// </summary>
    private SessionResponse MapSessionToResponse(Session session)
    {
        return new SessionResponse
        {
            Id = session.Id,
            SessionCode = session.SessionCode,
            ShareableUrl = $"/share/{session.SessionCode}",
            Status = session.Status.ToString(),
            CreatedAt = session.CreatedAt,
            ExpiresAt = session.ExpiresAt,
            TrophyCount = session.Trophies?.Count ?? 0
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
