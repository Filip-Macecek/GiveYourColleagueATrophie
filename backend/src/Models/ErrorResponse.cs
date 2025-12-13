namespace Trophy3D.Api.Models;

/// <summary>
/// Represents an error response from the API.
/// </summary>
public class ErrorResponse
{
    /// <summary>Gets or sets the error message.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Gets or sets the HTTP status code.</summary>
    public int StatusCode { get; set; }

    /// <summary>Gets or sets a timestamp of when the error occurred.</summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Represents a validation error response with field-specific errors.
/// </summary>
public class ValidationErrorResponse : ErrorResponse
{
    /// <summary>Gets or sets the dictionary of field errors.</summary>
    public Dictionary<string, string[]> Errors { get; set; } = new();
}
