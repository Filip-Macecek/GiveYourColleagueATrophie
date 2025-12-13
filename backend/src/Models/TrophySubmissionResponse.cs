namespace Trophy3D.Api.Models;

/// <summary>
/// DTO for trophy submission response.
/// </summary>
public class TrophySubmissionResponse
{
    /// <summary>Gets or sets the trophy ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the recipient name.</summary>
    public string RecipientName { get; set; } = string.Empty;

    /// <summary>Gets or sets the achievement text.</summary>
    public string AchievementText { get; set; } = string.Empty;

    /// <summary>Gets or sets the submitter name.</summary>
    public string? SubmitterName { get; set; }

    /// <summary>Gets or sets the submission timestamp.</summary>
    public DateTime SubmittedAt { get; set; }

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }
}
