namespace Trophy3D.Api.Models;

/// <summary>
/// DTO for detailed trophy response (used during presentation).
/// </summary>
public class TrophyDetailsResponse
{
    /// <summary>Gets or sets the trophy ID.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the recipient name.</summary>
    public string RecipientName { get; set; } = string.Empty;

    /// <summary>Gets or sets the achievement text.</summary>
    public string AchievementText { get; set; } = string.Empty;

    /// <summary>Gets or sets the submitter name.</summary>
    public string? SubmitterName { get; set; }

    /// <summary>Gets or sets the display order.</summary>
    public int DisplayOrder { get; set; }

    /// <summary>Gets or sets the ID of the next trophy (null if last).</summary>
    public Guid? NextTrophyId { get; set; }

    /// <summary>Gets or sets a value indicating whether this is the last trophy.</summary>
    public bool IsLastTrophy { get; set; }
}
