# Quickstart: Trophy Rizz Presentation

## Prerequisites
- Frontend dependencies installed
- Add `canvas-confetti` to frontend

```bash
cd frontend
npm install canvas-confetti
```

## Implement
- Use `TrophyPresentation` component to render 2D spinning trophy with overlay text.
- Trigger confetti via IntersectionObserver when component enters viewport.
- Respect `prefers-reduced-motion`.
- Use Next control to advance trophies using session hooks.

## Verify
- Load a session with multiple trophies.
- Scroll into the presentation; confetti bursts once per trophy.
- Names and achievement render legibly; "From: {giverName}" displays.
- Click Next; see subsequent trophy, confetti resets.
- On final trophy, Next is disabled.
