namespace Trophy3D.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Trophy3D.Api.Models;
using Trophy3D.Api.Services;

/// <summary>
/// Controller for trophy submission endpoints.
/// </summary>
[ApiController]
[Route("api/sessions/{sessionCode}/trophies")]
public class TrophiesController : ControllerBase
{
    private readonly ITrophyService _trophyService;
    private readonly ILogger<TrophiesController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TrophiesController"/> class.
    /// </summary>
    /// <param name="trophyService">The trophy service.</param>
    /// <param name="logger">The logger.</param>
    public TrophiesController(ITrophyService trophyService, ILogger<TrophiesController> logger)
    {
        _trophyService = trophyService;
        _logger = logger;
    }

    /// <summary>
    /// Submits a new trophy nomination.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <param name="request">The trophy submission request.</param>
    /// <returns>The submitted trophy response.</returns>
    [HttpPost]
    [ProduceResponseType(StatusCodes.Status201Created)]
    [ProduceResponseType(StatusCodes.Status400BadRequest)]
    [ProduceResponseType(StatusCodes.Status404NotFound)]
    [ProduceResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<TrophySubmissionResponse>> SubmitTrophy(string sessionCode, [FromBody] TrophySubmissionRequest request)
    {
        try
        {
            var response = await _trophyService.SubmitTrophyAsync(sessionCode, request);
            return CreatedAtAction(nameof(GetTrophy), new { sessionCode, trophyId = response.Id }, response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error submitting trophy in session {SessionCode}", sessionCode);
            return BadRequest(new ValidationErrorResponse
            {
                Message = ex.Message,
                StatusCode = 400,
                Errors = new Dictionary<string, string[]> { { "general", new[] { ex.Message } } }
            });
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
            _logger.LogError(ex, "Error submitting trophy in session {SessionCode}", sessionCode);
            return StatusCode(500, new ErrorResponse { Message = ex.Message, StatusCode = 500 });
        }
    }

    /// <summary>
    /// Lists all trophies for a session.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <returns>List of trophy submissions.</returns>
    [HttpGet]
    [ProduceResponseType(StatusCodes.Status200OK)]
    [ProduceResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<TrophySubmissionResponse>>> ListTrophies(string sessionCode)
    {
        try
        {
            var trophies = await _trophyService.GetTrophiesBySessionAsync(sessionCode);
            return Ok(trophies);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new ErrorResponse { Message = $"Session {sessionCode} not found", StatusCode = 404 });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving trophies for session {SessionCode}", sessionCode);
            return StatusCode(500, new ErrorResponse { Message = ex.Message, StatusCode = 500 });
        }
    }

    /// <summary>
    /// Retrieves a single trophy with presentation details.
    /// </summary>
    /// <param name="sessionCode">The session code.</param>
    /// <param name="trophyId">The trophy ID.</param>
    /// <returns>The trophy details.</returns>
    [HttpGet("{trophyId}")]
    [ProduceResponseType(StatusCodes.Status200OK)]
    [ProduceResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrophyDetailsResponse>> GetTrophy(string sessionCode, Guid trophyId)
    {
        try
        {
            var trophy = await _trophyService.GetTrophyDetailsAsync(sessionCode, trophyId);
            return Ok(trophy);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ErrorResponse { Message = ex.Message, StatusCode = 404 });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving trophy {TrophyId} in session {SessionCode}", trophyId, sessionCode);
            return StatusCode(500, new ErrorResponse { Message = ex.Message, StatusCode = 500 });
        }
    }
}
