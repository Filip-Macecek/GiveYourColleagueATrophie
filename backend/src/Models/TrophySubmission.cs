namespace Trophy3D.Api.Models;

/// <summary>
/// Represents a trophy submission within a session.
/// </summary>
public class TrophySubmission
{
    /// <summary>Gets or sets the unique trophy identifier.</summary>
    public Guid Id { get; set; }

    /// <summary>Gets or sets the parent session ID.</summary>
    public Guid SessionId { get; set; }

    /// <summary>Gets or sets the session navigation property.</summary>
    public Session? Session { get; set; }

    /// <summary>Gets or sets the name of the trophy recipient.</summary>
    public string RecipientName { get; set; } = string.Empty;

    /// <summary>Gets or sets the achievement or recognition text.</summary>
    public string AchievementText { get; set; } = string.Empty;

    /// <summary>Gets or sets the name of the person who submitted the trophy (optional).</summary>
    public string? SubmitterName { get; set; }

    /// <summary>Gets or sets the submission timestamp.</summary>
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Gets or sets the display order in the presentation sequence.</summary>
    public int DisplayOrder { get; set; }
}
