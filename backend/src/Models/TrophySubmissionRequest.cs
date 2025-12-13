namespace Trophy3D.Api.Models;

/// <summary>
/// DTO for trophy submission request.
/// </summary>
public class TrophySubmissionRequest
{
    /// <summary>Gets or sets the name of the trophy recipient.</summary>
    public string RecipientName { get; set; } = string.Empty;

    /// <summary>Gets or sets the achievement text.</summary>
    public string AchievementText { get; set; } = string.Empty;

    /// <summary>Gets or sets the optional submitter name.</summary>
    public string? SubmitterName { get; set; }
}
