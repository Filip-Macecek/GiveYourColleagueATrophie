# Research: Trophy Refresh and Presentation Controls

**Feature**: 002-trophy-refresh-button  
**Date**: 2025-12-13  
**Status**: Complete

## Research Tasks

This document consolidates research findings for unknowns identified in the Technical Context and Constitution Check.

---

## Task 1: React Polling Patterns and Inactivity Detection

### Decision
Use React custom hook (`useTrophies`) with `setInterval` for polling, combined with separate `useInactivity` hook for activity tracking. Clean up intervals in `useEffect` cleanup function to prevent memory leaks.

### Rationale
- **Hooks-based approach** aligns with existing React 18 + TypeScript architecture in Trophy3D
- **Separation of concerns**: `useTrophies` manages data fetching/polling lifecycle, `useInactivity` tracks user activity independently
- `setInterval` is sufficient for 3-second polling (no need for WebSocket complexity)
- React's `useEffect` cleanup ensures intervals are cleared when component unmounts or dependencies change
- Custom hooks enable easy testing and reusability across components

### Alternatives Considered
- **`setTimeout` recursive pattern**: More complex to manage, no clear advantage for fixed-interval polling
- **Third-party polling libraries** (e.g., `use-interval`, `react-query`): Adds dependency overhead; simple `setInterval` in `useEffect` is idiomatic and well-understood
- **WebSockets**: Over-engineering for 3-second polling; introduces server complexity and connection management overhead
- **Single combined hook**: Mixing polling and inactivity logic in one hook reduces reusability and testability

### Implementation Notes
```typescript
// useTrophies.ts: Manages polling lifecycle
function useTrophies(sessionId: string, pollingEnabled: boolean) {
  const [trophies, setTrophies] = useState([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!pollingEnabled) return;
    
    const fetchTrophies = async () => {
      const data = await api.getTrophies(sessionId);
      setTrophies(data);
      setLastUpdated(new Date());
    };

    fetchTrophies(); // Initial fetch
    const interval = setInterval(fetchTrophies, 3000);
    
    return () => clearInterval(interval); // Cleanup
  }, [sessionId, pollingEnabled]);

  return { trophies, lastUpdated, refetch: () => fetchTrophies() };
}

// useInactivity.ts: Tracks user activity
function useInactivity(timeout: number = 300000) { // 5 minutes default
  const [isInactive, setIsInactive] = useState(false);
  
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      setIsInactive(false);
      inactivityTimer = setTimeout(() => setIsInactive(true), timeout);
    };
    
    // Activity listeners
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    
    resetTimer(); // Initialize
    
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

---

## Task 2: Visual Indicators for Polling State (Flamboyant UI)

### Decision
Implement pulsing "LIVE" badge with exaggerated animation (scale pulse, color cycling) when polling is active. When paused, display "SNOOZING" badge with sleeping emoji and gentle fade. Use bright, high-contrast colors and theatrical transitions.

### Rationale
- **Aligns with Constitution Principle II**: Flamboyant, humorous UI/UX required
- **Visual feedback is critical**: Users need to know if updates are happening automatically
- **Theatrical excess**: Pulsing animation, color cycling, and emoji create playful personality
- **Non-intrusive placement**: Fixed position (e.g., top-right of trophy list container) keeps it visible without blocking content
- **Clear state communication**: "LIVE" vs "SNOOZING" uses humor while being informative

### Alternatives Considered
- **Minimalist dot indicator**: Violates Constitution Principle II (too sterile/corporate)
- **Subtle icon only**: Insufficient personality, doesn't align with Trophy3D's absurd aesthetic
- **Toast notifications**: Too intrusive for continuous state; better for one-time events
- **Text-only status**: Lacks visual impact and whimsy

### Implementation Notes
```tsx
// PollingIndicator.tsx
function PollingIndicator({ isActive }: { isActive: boolean }) {
  return (
    <div className={`polling-indicator ${isActive ? 'live' : 'paused'}`}>
      {isActive ? (
        <span className="badge live-badge">
          ✨ LIVE ✨
        </span>
      ) : (
        <span className="badge paused-badge">
          😴 SNOOZING 😴
        </span>
      )}
    </div>
  );
}

/* CSS with theatrical animations */
.live-badge {
  animation: pulse 2s ease-in-out infinite, colorCycle 5s linear infinite;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes colorCycle {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg); }
}

.paused-badge {
  animation: gentleFade 3s ease-in-out infinite;
  background: #333;
  color: #aaa;
  padding: 8px 16px;
  border-radius: 20px;
}

@keyframes gentleFade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
```

---

## Task 3: Timestamp Formatting and Relative Time Updates

### Decision
Use a custom `useRelativeTime` hook that recalculates relative time every second using human-friendly strings ("just now", "5 seconds ago", "2 minutes ago"). Store absolute timestamp, display relative format.

### Rationale
- **User-friendly**: Relative time is more intuitive than absolute timestamps for recent updates
- **Lightweight**: No need for external library (e.g., Moment.js, date-fns) for simple relative time
- **Dynamic updates**: Hook re-renders component every second to keep "X seconds ago" accurate
- **Performance**: Single `setInterval` per component instance, cleanup on unmount

### Alternatives Considered
- **Static timestamp**: Less user-friendly, doesn't convey recency intuitively
- **External library (date-fns)**: Adds 10-20KB bundle size for simple logic; overkill
- **Manual calculation in component**: Less reusable, violates DRY principle
- **Server-side relative time**: Requires frequent re-fetch or becomes stale

### Implementation Notes
```typescript
// useRelativeTime.ts
function useRelativeTime(timestamp: Date | null): string {
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

      if (diffSec < 5) {
        setRelativeTime('just now');
      } else if (diffSec < 60) {
        setRelativeTime(`${diffSec} seconds ago`);
      } else if (diffSec < 3600) {
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

// Usage in SessionPage.tsx
const relativeTime = useRelativeTime(lastUpdated);
<p className="last-updated">Updated {relativeTime}</p>
```

---

## Task 4: Highlighting New Trophies (Animation Design)

### Decision
Use CSS-based fade-in animation combined with temporary background highlight for new trophies. Track previous trophy IDs, apply `new-trophy` CSS class to items not in previous set, remove class after 3 seconds.

### Rationale
- **Aligns with Constitution Principle II**: Theatrical animations enhance whimsy
- **Non-disruptive**: Fade-in is smooth, doesn't jar the user
- **Performant**: CSS animations use GPU acceleration, no JavaScript animation loop
- **Clear feedback**: Temporary background flash draws attention without permanent visual clutter
- **Customizable**: Can exaggerate animation duration/intensity for more flamboyant effect

### Alternatives Considered
- **Permanent highlight**: Creates visual clutter as more trophies arrive
- **Shake/bounce animation**: More disruptive, could be annoying with frequent updates
- **Toast notification per trophy**: Too intrusive for auto-polling updates
- **No highlight**: Violates FR-020 requirement and misses opportunity for personality

### Implementation Notes
```tsx
// SessionPage.tsx: Track previous trophy IDs
const [previousTrophyIds, setPreviousTrophyIds] = useState<Set<string>>(new Set());

useEffect(() => {
  const currentIds = new Set(trophies.map(t => t.id));
  const newIds = trophies.filter(t => !previousTrophyIds.has(t.id)).map(t => t.id);
  
  if (newIds.length > 0) {
    // Apply 'new-trophy' class, remove after 3s
    setTimeout(() => {
      // Class removal handled by re-render or manual DOM manipulation
    }, 3000);
  }
  
  setPreviousTrophyIds(currentIds);
}, [trophies]);

// Render with conditional class
{trophies.map(trophy => (
  <div 
    key={trophy.id} 
    className={`trophy-item ${!previousTrophyIds.has(trophy.id) ? 'new-trophy' : ''}`}
  >
    {/* Trophy content */}
  </div>
))}

/* CSS */
.trophy-item {
  transition: background-color 0.5s ease, transform 0.5s ease;
}

.new-trophy {
  animation: fadeInHighlight 3s ease forwards;
}

@keyframes fadeInHighlight {
  0% {
    opacity: 0;
    transform: scale(0.95);
    background-color: rgba(255, 215, 0, 0.4); /* Gold flash */
  }
  20% {
    opacity: 1;
    transform: scale(1.05);
    background-color: rgba(255, 215, 0, 0.4);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    background-color: transparent;
  }
}
```

---

## Task 5: "Present Trophies" Button Design (Flamboyant UI)

### Decision
Design oversized, pulsing button with gradient background, dramatic shadow, and bold typography. Use exaggerated hover effects (scale, rotation, glow) and triumphant copy (e.g., "🎭 PRESENT TROPHIES! 🎭"). Button appears with slide-in animation when condition is met.

### Rationale
- **Aligns with Constitution Principle II**: Over-the-top, theatrical design
- **High visual priority**: Presentation mode is a key feature; button should demand attention
- **Playful personality**: Emojis, bold text, and dramatic effects create delight
- **Clear affordance**: Exaggerated size and animation communicate importance
- **Consistent with Trophy3D aesthetic**: Matches existing flamboyant UI patterns (if any)

### Alternatives Considered
- **Standard button**: Too boring, violates constitution requirement
- **Minimalist design**: Fails to communicate personality and importance
- **Subtle conditional display**: Button should make a grand entrance when it appears

### Implementation Notes
```tsx
// SessionPage.tsx
{trophies.length >= 2 && (
  <button className="present-trophies-btn" onClick={handlePresentClick}>
    🎭 PRESENT TROPHIES! 🎭
  </button>
)}

/* CSS */
.present-trophies-btn {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 20px 40px;
  background: linear-gradient(135deg, #ff006e, #8338ec, #3a86ff);
  color: white;
  border: none;
  border-radius: 50px;
  box-shadow: 0 10px 30px rgba(131, 56, 236, 0.5);
  cursor: pointer;
  animation: buttonPulse 2s ease-in-out infinite, slideIn 0.5s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.present-trophies-btn:hover {
  transform: scale(1.1) rotate(2deg);
  box-shadow: 0 15px 40px rgba(131, 56, 236, 0.8);
}

@keyframes buttonPulse {
  0%, 100% { box-shadow: 0 10px 30px rgba(131, 56, 236, 0.5); }
  50% { box-shadow: 0 10px 50px rgba(131, 56, 236, 0.9); }
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
```

---

## Task 6: Handling Concurrent Refresh Operations

### Decision
Use a `isRefreshing` boolean state flag to disable the refresh button during active fetch operations. Ignore manual refresh clicks if automatic polling is mid-fetch (single-source-of-truth for loading state).

### Rationale
- **Prevents duplicate requests**: Avoids server load and UI inconsistencies
- **Clear UX**: Disabled button communicates that operation is in progress
- **Simple implementation**: Boolean flag is straightforward and reliable
- **Works for both manual and automatic**: Same loading state controls both refresh paths

### Alternatives Considered
- **Request queue**: Over-engineering; 3-second interval makes queue unnecessary
- **Debouncing**: Complicates logic; disabled button is clearer UX
- **Allow concurrent requests**: Risks race conditions and inconsistent state

### Implementation Notes
```typescript
// useTrophies.ts
const [isRefreshing, setIsRefreshing] = useState(false);

const fetchTrophies = async () => {
  if (isRefreshing) return; // Prevent concurrent fetches
  
  setIsRefreshing(true);
  try {
    const data = await api.getTrophies(sessionId);
    setTrophies(data);
    setLastUpdated(new Date());
  } catch (error) {
    // Handle error
  } finally {
    setIsRefreshing(false);
  }
};

// In SessionPage.tsx
<button 
  onClick={handleRefresh} 
  disabled={isRefreshing}
  className={isRefreshing ? 'refreshing' : ''}
>
  {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh Trophies'}
</button>
```

---

## Task 7: Error Handling for Failed Refresh Operations

### Decision
Display non-modal error message (toast or inline alert) below refresh button when fetch fails. Preserve existing trophy list. Retry automatically on next polling interval (don't pause polling on transient errors). Log errors to console for debugging.

### Rationale
- **Resilient UX**: Transient network errors shouldn't break the experience
- **Non-blocking**: Error message doesn't prevent user from continuing to view trophies
- **Automatic recovery**: Polling retries naturally resolve temporary issues
- **Visibility**: Inline error message keeps user informed without intrusive modal

### Alternatives Considered
- **Modal error dialog**: Too disruptive for non-critical polling failures
- **Stop polling on error**: Over-aggressive; most errors are transient
- **Silent failure**: Poor UX, user doesn't know why updates stopped
- **Exponential backoff**: Over-engineering for simple polling; 3s interval is already gentle

### Implementation Notes
```tsx
// useTrophies.ts
const [error, setError] = useState<string | null>(null);

const fetchTrophies = async () => {
  try {
    const data = await api.getTrophies(sessionId);
    setTrophies(data);
    setLastUpdated(new Date());
    setError(null); // Clear previous errors
  } catch (err) {
    console.error('Trophy fetch failed:', err);
    setError('Failed to refresh trophies. Retrying...');
    // Don't clear trophies - preserve existing data
  }
};

// SessionPage.tsx
{error && (
  <div className="error-message">
    ⚠️ {error}
  </div>
)}
```

---

## Summary

All research tasks complete. Key decisions:
1. **Polling**: React hooks with `setInterval`, separate `useInactivity` hook
2. **Visual indicators**: Pulsing "LIVE" badge with theatrical animations
3. **Timestamps**: Custom `useRelativeTime` hook with 1-second updates
4. **New trophy highlights**: Fade-in animation with gold background flash
5. **Present button**: Oversized, gradient, pulsing design with emojis
6. **Concurrent operations**: `isRefreshing` flag prevents duplicate requests
7. **Error handling**: Inline error messages, preserve data, auto-retry

All decisions align with Trophy3D's technical stack (React 18, TypeScript, Vite) and Constitution requirements (correctness, flamboyant UI, test-first, clarity, simplicity).
