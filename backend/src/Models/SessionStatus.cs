namespace Trophy3D.Api.Models;

/// <summary>
/// Enum representing the lifecycle states of a trophy-sharing session.
/// </summary>
public enum SessionStatus
{
    /// <summary>Session created, awaiting collection mode or first participant.</summary>
    Created,

    /// <summary>Session accepting trophy submissions.</summary>
    Collecting,

    /// <summary>Session in presentation mode, no new submissions accepted.</summary>
    Presenting,

    /// <summary>Session closed, no submissions or presentations allowed.</summary>
    Closed
}
