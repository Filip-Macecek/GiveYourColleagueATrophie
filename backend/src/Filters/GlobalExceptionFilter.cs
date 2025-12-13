namespace Trophy3D.Api.Filters;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Trophy3D.Api.Models;

/// <summary>
/// Global exception handling middleware for the Trophy3D API.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="GlobalExceptionMiddleware"/> class.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="logger">The logger.</param>
    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Invokes the middleware to handle exceptions.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    /// <summary>
    /// Handles the exception and writes the error response.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    /// <param name="exception">The exception that occurred.</param>
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            Message = exception.Message,
            StatusCode = StatusCodes.Status500InternalServerError,
            Timestamp = DateTime.UtcNow
        };

        context.Response.StatusCode = response.StatusCode;
        return context.Response.WriteAsJsonAsync(response);
    }
}

/// <summary>
/// Exception filter attribute for handling exceptions in controllers.
/// </summary>
public class GlobalExceptionFilter : IAsyncExceptionFilter
{
    private readonly ILogger<GlobalExceptionFilter> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="GlobalExceptionFilter"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    public GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Executes when an exception is thrown.
    /// </summary>
    /// <param name="context">The exception context.</param>
    public Task OnExceptionAsync(ExceptionContext context)
    {
        _logger.LogError(context.Exception, "An unhandled exception occurred");

        var response = new ErrorResponse
        {
            Message = context.Exception.Message,
            StatusCode = StatusCodes.Status500InternalServerError,
            Timestamp = DateTime.UtcNow
        };

        context.Result = new ObjectResult(response)
        {
            StatusCode = response.StatusCode
        };

        context.ExceptionHandled = true;
        return Task.CompletedTask;
    }
}
