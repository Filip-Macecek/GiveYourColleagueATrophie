# Data Model: Trophy Rizz Presentation

## Entities

### TrophyPresentation
- receiverName: string (max 60, default "Recipient")
- achievementTitle: string (max 60, default "Achievement")
- giverName: string (max 60, default "Anonymous")
- sessionId: string
- trophyId: string
- displayOrder: number

### PresentationSession
- sessionId: string
- trophies: TrophyPresentation[] (ordered by `displayOrder`)
- currentIndex: number

## Relationships
- PresentationSession has many TrophyPresentation.
- TrophyPresentation belongs to PresentationSession.

## Validation Rules
- All names trimmed; empty -> set to defaults.
- Max length 60 enforced; overflow handled via UI wrap/tooltip, not error.

## State Transitions
- `currentIndex` advances on Next, capped at `trophies.length - 1`.
- Confetti trigger resets when `currentIndex` changes.
