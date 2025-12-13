# Quickstart: Trophy Refresh and Presentation Controls

**Feature**: 002-trophy-refresh-button  
**Date**: 2025-12-13  
**Audience**: Developers implementing this feature

## Overview

This quickstart provides step-by-step instructions for implementing automatic trophy refresh, manual refresh button, and conditional "Present Trophies" button on the session page.

---

## Prerequisites

- Trophy3D development environment set up (backend + frontend)
- Familiarity with React 18, TypeScript, and custom hooks
- Understanding of ASP.NET Core Web API (C# .NET 8.0)
- Access to the codebase at `d:\dev\trophy3d`

---

## Implementation Checklist

### Phase 1: Backend API (Optional - if endpoint doesn't exist)

**Note**: If `GET /api/sessions/{id}` already returns trophies, you can skip backend work and proceed to Phase 2.

- [ ] **Task 1.1**: Verify existing trophy fetch endpoint
  - Check if `SessionsController.cs` has a `GET /api/sessions/{id}/trophies` or `GET /api/sessions/{id}` endpoint that returns trophies
  - If yes, confirm response includes `TrophySubmission[]` with `id`, `userName`, `modelData`, `submittedAt`
  - If no, proceed to Task 1.2

- [ ] **Task 1.2**: Add trophy fetch endpoint (if needed)
  - Open `backend/src/Controllers/SessionsController.cs`
  - Add new endpoint:
    ```csharp
    [HttpGet("{id}/trophies")]
    public async Task<IActionResult> GetSessionTrophies(Guid id)
    {
        var session = await _sessionService.GetSessionWithTrophiesAsync(id);
        if (session == null) return NotFound(new { error = "Session not found" });
        
        return Ok(new { 
            sessionId = session.Id, 
            count = session.Trophies.Count, 
            trophies = session.Trophies 
        });
    }
    ```
  - Ensure `SessionService.GetSessionWithTrophiesAsync()` includes trophies (use `.Include(s => s.Trophies)` in EF query)

- [ ] **Task 1.3**: Test endpoint manually
  - Start backend: `dotnet run` from `backend/` directory
  - Use Postman or curl: `GET http://localhost:5000/api/sessions/{id}/trophies`
  - Verify response matches OpenAPI contract in `contracts/openapi.yaml`

---

### Phase 2: Frontend Custom Hooks

- [ ] **Task 2.1**: Create `useInactivity` hook
  - Create file: `frontend/src/hooks/useInactivity.ts`
  - Implement inactivity detection:
    ```typescript
    import { useEffect, useState } from 'react';

    export function useInactivity(timeout: number = 300000): boolean {
      const [isInactive, setIsInactive] = useState(false);

      useEffect(() => {
        let inactivityTimer: NodeJS.Timeout;

        const resetTimer = () => {
          clearTimeout(inactivityTimer);
          setIsInactive(false);
          inactivityTimer = setTimeout(() => setIsInactive(true), timeout);
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);

        resetTimer(); // Initialize timer

        return () => {
          window.removeEventListener('mousemove', resetTimer);
          window.removeEventListener('keydown', resetTimer);
          window.removeEventListener('click', resetTimer);
          clearTimeout(inactivityTimer);
        };
      }, [timeout]);

      return isInactive;
    }
    ```

- [ ] **Task 2.2**: Create `useRelativeTime` hook
  - Create file: `frontend/src/hooks/useRelativeTime.ts`
  - Implement relative time formatting:
    ```typescript
    import { useEffect, useState } from 'react';

    export function useRelativeTime(timestamp: Date | null): string {
      const [relativeTime, setRelativeTime] = useState('');

      useEffect(() => {
        if (!timestamp) {
          setRelativeTime('Never');
          return;
        }

        const updateRelativeTime = () => {
          const now = new Date();
          const diffMs = now.getTime() - timestamp.getTime();
          const diffSec = Math.floor(diffMs / 1000);

          if (diffSec < 5) setRelativeTime('just now');
          else if (diffSec < 60) setRelativeTime(`${diffSec} seconds ago`);
          else if (diffSec < 3600) {
            const minutes = Math.floor(diffSec / 60);
            setRelativeTime(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
          } else {
            const hours = Math.floor(diffSec / 3600);
            setRelativeTime(`${hours} hour${hours > 1 ? 's' : ''} ago`);
          }
        };

        updateRelativeTime();
        const interval = setInterval(updateRelativeTime, 1000);
        return () => clearInterval(interval);
      }, [timestamp]);

      return relativeTime;
    }
    ```

- [ ] **Task 2.3**: Extend `useTrophies` hook with polling
  - Open `frontend/src/hooks/useTrophies.ts`
  - Add state for polling:
    ```typescript
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    ```
  - Add `pollingEnabled` parameter to hook signature
  - Implement `useEffect` for polling:
    ```typescript
    useEffect(() => {
      if (!pollingEnabled) return;

      const fetchTrophies = async () => {
        if (isRefreshing) return; // Prevent concurrent fetches
        
        setIsRefreshing(true);
        try {
          const response = await api.get(`/sessions/${sessionId}/trophies`);
          setTrophies(response.data.trophies);
          setLastUpdated(new Date());
          setError(null);
        } catch (err) {
          console.error('Trophy fetch failed:', err);
          setError('Failed to refresh trophies. Retrying...');
        } finally {
          setIsRefreshing(false);
        }
      };

      fetchTrophies(); // Initial fetch
      const interval = setInterval(fetchTrophies, 3000);
      return () => clearInterval(interval);
    }, [sessionId, pollingEnabled, isRefreshing]);
    ```
  - Return `{ trophies, lastUpdated, isRefreshing, error, refetch: fetchTrophies }`

---

### Phase 3: Frontend Components

- [ ] **Task 3.1**: Create `RefreshButton` component
  - Create file: `frontend/src/components/RefreshButton.tsx`
  - Implement button with loading state:
    ```tsx
    import React from 'react';
    import './RefreshButton.css';

    interface RefreshButtonProps {
      onClick: () => void;
      isRefreshing: boolean;
    }

    export function RefreshButton({ onClick, isRefreshing }: RefreshButtonProps) {
      return (
        <button
          className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={onClick}
          disabled={isRefreshing}
        >
          {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh Trophies'}
        </button>
      );
    }
    ```
  - Add CSS in `RefreshButton.css` (see research.md Task 6 for styles)

- [ ] **Task 3.2**: Create `PollingIndicator` component
  - Create file: `frontend/src/components/PollingIndicator.tsx`
  - Implement live/paused badge:
    ```tsx
    import React from 'react';
    import './PollingIndicator.css';

    interface PollingIndicatorProps {
      isActive: boolean;
    }

    export function PollingIndicator({ isActive }: PollingIndicatorProps) {
      return (
        <div className={`polling-indicator ${isActive ? 'live' : 'paused'}`}>
          {isActive ? (
            <span className="badge live-badge">✨ LIVE ✨</span>
          ) : (
            <span className="badge paused-badge">😴 SNOOZING 😴</span>
          )}
        </div>
      );
    }
    ```
  - Add CSS with animations (see research.md Task 2 for styles)

- [ ] **Task 3.3**: Update `SessionPage` component
  - Open `frontend/src/pages/SessionPage.tsx`
  - Import hooks: `useInactivity`, `useRelativeTime`, `useTrophies`
  - Add state:
    ```tsx
    const isInactive = useInactivity(300000); // 5 minutes
    const { trophies, lastUpdated, isRefreshing, error, refetch } = useTrophies(sessionId, !isInactive);
    const relativeTime = useRelativeTime(lastUpdated);
    const [previousTrophyIds, setPreviousTrophyIds] = useState<Set<string>>(new Set());
    ```
  - Add UI elements:
    ```tsx
    <PollingIndicator isActive={!isInactive} />
    <RefreshButton onClick={refetch} isRefreshing={isRefreshing} />
    {lastUpdated && <p className="last-updated">Updated {relativeTime}</p>}
    {error && <div className="error-message">⚠️ {error}</div>}
    {trophies.length >= 2 && (
      <button className="present-trophies-btn" onClick={handlePresentClick}>
        🎭 PRESENT TROPHIES! 🎭
      </button>
    )}
    ```
  - Implement new trophy tracking:
    ```tsx
    useEffect(() => {
      const currentIds = new Set(trophies.map(t => t.id));
      const newIds = trophies.filter(t => !previousTrophyIds.has(t.id)).map(t => t.id);
      
      if (newIds.length > 0) {
        setTimeout(() => setPreviousTrophyIds(currentIds), 3000);
      } else {
        setPreviousTrophyIds(currentIds);
      }
    }, [trophies]);
    ```
  - Update trophy list rendering:
    ```tsx
    {trophies.map(trophy => (
      <div
        key={trophy.id}
        className={`trophy-item ${!previousTrophyIds.has(trophy.id) ? 'new-trophy' : ''}`}
      >
        {/* Trophy content */}
      </div>
    ))}
    ```

- [ ] **Task 3.4**: Add CSS for new trophy animations and Present button
  - Open `frontend/src/pages/SessionPage.css`
  - Add styles (see research.md Tasks 4 and 5 for CSS)

---

### Phase 4: Testing

- [ ] **Task 4.1**: Write unit tests for custom hooks
  - Create `frontend/tests/unit/useInactivity.test.ts`
  - Test inactivity detection: triggers after 5 min, resets on activity
  - Create `frontend/tests/unit/useRelativeTime.test.ts`
  - Test relative time formatting: "just now", "X seconds ago", etc.
  - Create `frontend/tests/unit/useTrophies.test.ts`
  - Test polling lifecycle: starts on mount, stops on unmount, pauses when disabled

- [ ] **Task 4.2**: Write component tests
  - Create `frontend/tests/unit/RefreshButton.test.tsx`
  - Test button disabled state, loading indicator, onClick handler
  - Create `frontend/tests/unit/PollingIndicator.test.tsx`
  - Test live/paused state rendering
  - Create `frontend/tests/unit/SessionPage.test.tsx`
  - Test "Present Trophies" button visibility (0, 1, 2+ trophies)
  - Test new trophy highlight class application

- [ ] **Task 4.3**: Integration testing
  - Start backend and frontend: `docker-compose up`
  - Open session page in browser
  - Verify automatic polling (check Network tab, should see requests every 3s)
  - Verify manual refresh button works
  - Submit a new trophy from another tab/browser, verify it appears with highlight within 3s
  - Wait 5 minutes idle, verify polling pauses ("SNOOZING" badge appears)
  - Move mouse, verify polling resumes ("LIVE" badge returns)
  - Verify "Present Trophies" button appears when 2+ trophies exist
  - Click "Present Trophies", verify navigation to presentation page

---

## Quick Reference

### File Changes Summary

**New Files**:
- `frontend/src/hooks/useInactivity.ts`
- `frontend/src/hooks/useRelativeTime.ts`
- `frontend/src/components/RefreshButton.tsx`
- `frontend/src/components/RefreshButton.css`
- `frontend/src/components/PollingIndicator.tsx`
- `frontend/src/components/PollingIndicator.css`

**Modified Files**:
- `frontend/src/hooks/useTrophies.ts` (add polling, state)
- `frontend/src/pages/SessionPage.tsx` (integrate all new hooks and components)
- `frontend/src/pages/SessionPage.css` (add new trophy animation, present button styles)
- `backend/src/Controllers/SessionsController.cs` (optional: add endpoint if needed)

### Key Constants

- Polling interval: `3000ms` (3 seconds)
- Inactivity timeout: `300000ms` (5 minutes)
- New trophy highlight duration: `3000ms` (3 seconds)
- Relative time update interval: `1000ms` (1 second)

### API Endpoints

- `GET /api/sessions/{id}/trophies` - Fetch all trophies in a session
- Alternative: `GET /api/sessions/{id}` - Fetch session with trophies (if already exists)

### Acceptance Criteria

Refer to [spec.md](spec.md) for full acceptance scenarios. Key success criteria:
- ✅ Automatic polling fetches trophies every 3s when user is active
- ✅ Polling pauses after 5 minutes of inactivity
- ✅ Manual refresh button updates trophy list
- ✅ "Present Trophies" button appears when `trophies.length >= 2`
- ✅ New trophies are highlighted with fade-in animation
- ✅ "Last updated" timestamp displays and updates dynamically
- ✅ Polling indicator shows "LIVE" (active) or "SNOOZING" (paused)

---

## Troubleshooting

### Polling doesn't start
- Check `pollingEnabled` is `true` in `useTrophies` call
- Verify `useInactivity` is not immediately returning `true`
- Check browser console for errors

### "Present Trophies" button doesn't appear
- Verify `trophies.length >= 2` condition
- Check React DevTools to confirm `trophies` state is populated
- Ensure button is not hidden by CSS

### New trophy highlights don't work
- Verify `previousTrophyIds` state is updating correctly
- Check `new-trophy` class is applied to new items in DOM
- Confirm CSS animation is defined and not overridden

### Inactivity detection doesn't trigger
- Check timeout value is correct (300000ms = 5 minutes)
- Verify event listeners are attached (`mousemove`, `click`, `keydown`)
- Test with shorter timeout (e.g., 10000ms) for debugging

---

## Next Steps

After implementing this feature:
1. Run full test suite: `npm test` in `frontend/`, `dotnet test` in `backend/`
2. Perform manual QA against all acceptance scenarios in spec.md
3. Review code against Constitution principles (correctness, humor, test-first, clarity)
4. Submit PR for review, ensure CI/CD passes
5. Deploy to staging, perform smoke tests
6. Merge to main branch `002-trophy-refresh-button`

For detailed research and design decisions, see:
- [research.md](research.md) - Implementation patterns and UI design
- [data-model.md](data-model.md) - State management and data flow
- [contracts/openapi.yaml](contracts/openapi.yaml) - API contract
