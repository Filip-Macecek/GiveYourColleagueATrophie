namespace Trophy3D.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Trophy3D.Api.Models;
using Trophy3D.Api.Services;

/// <summary>
/// Controller for session-related endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;
    private readonly ILogger<SessionsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="SessionsController"/> class.
    /// </summary>
    /// <param name="sessionService">The session service.</param>
    /// <param name="logger">The logger.</param>
    public SessionsController(ISessionService sessionService, ILogger<SessionsController> logger)
    {
        _sessionService = sessionService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new trophy-sharing session.
    /// </summary>
    /// <param name="request">The session creation request.</param>
    /// <returns>The created session response.</returns>
    [HttpPost]
    public async Task<ActionResult<SessionResponse>> CreateSession([FromBody] CreateSessionRequest? request = null)
    {
        try
        {
            var sessionResponse = await _sessionService.CreateSessionAsync(request?.OrganizerName);
            return CreatedAtAction(nameof(GetSession), new { sessionCode = sessionResponse.SessionCode }, sessionResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating session");
            return BadRequest(new ErrorResponse { Message = ex.Message, StatusCode = 400 });
        }
    }

    /// <summary>
    /// Retrieves session details and trophies by session code.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The session with trophies.</returns>
    [HttpGet("{sessionCode}")]
    public async Task<ActionResult<SessionWithTrophiesResponse>> GetSession(string sessionCode)
    {
        try
        {
            var response = await _sessionService.GetSessionWithTrophiesAsync(sessionCode);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ErrorResponse { Message = $"Session {sessionCode} not found", StatusCode = 404 });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("expired"))
        {
            return StatusCode(410, new ErrorResponse { Message = ex.Message, StatusCode = 410 });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving session {SessionCode}", sessionCode);
            return StatusCode(500, new ErrorResponse { Message = ex.Message, StatusCode = 500 });
        }
    }

    /// <summary>
    /// Transitions a session to presentation mode.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The updated session response.</returns>
    [HttpPost("{sessionCode}/present")]
    public async Task<ActionResult<SessionResponse>> StartPresentation(string sessionCode)
    {
        try
        {
            var response = await _sessionService.StartPresentationAsync(sessionCode);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ErrorResponse { Message = $"Session {sessionCode} not found", StatusCode = 404 });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(409, new ErrorResponse { Message = ex.Message, StatusCode = 409 });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting presentation for session {SessionCode}", sessionCode);
            return StatusCode(500, new ErrorResponse { Message = ex.Message, StatusCode = 500 });
        }
    }

    /// <summary>
    /// Closes a session explicitly.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>The closed session response.</returns>
    [HttpPost("{sessionCode}/close")]
    public async Task<ActionResult<SessionResponse>> CloseSession(string sessionCode)
    {
        try
        {
            var response = await _sessionService.CloseSessionAsync(sessionCode);
            return Ok(response);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ErrorResponse { Message = $"Session {sessionCode} not found", StatusCode = 404 });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error closing session {SessionCode}", sessionCode);
            return StatusCode(500, new ErrorResponse { Message = ex.Message, StatusCode = 500 });
        }
    }
}
