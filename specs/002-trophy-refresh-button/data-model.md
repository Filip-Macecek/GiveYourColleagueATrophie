# Data Model: Trophy Refresh and Presentation Controls

**Feature**: 002-trophy-refresh-button  
**Date**: 2025-12-13  
**Status**: Complete

## Overview

This feature extends existing entities (Trophy, Session) with new frontend state for polling lifecycle and UI interactions. No backend data model changes required - all new state is client-side only.

---

## Entities

### Trophy (Existing - No Changes)

**Description**: Represents a 3D model submission within a session. Already exists in backend and frontend.

**Backend Model** (`backend/src/Models/TrophySubmission.cs`):
```csharp
public class TrophySubmission
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public string UserName { get; set; }
    public string ModelData { get; set; } // Base64 or URL
    public DateTime SubmittedAt { get; set; }
    
    // Navigation property
    public Session Session { get; set; }
}
```

**Frontend Model** (`frontend/src/hooks/useTrophies.ts` or API response type):
```typescript
interface Trophy {
  id: string;
  sessionId: string;
  userName: string;
  modelData: string;
  submittedAt: string; // ISO 8601 timestamp
}
```

**Validation Rules**: (Existing - unchanged)
- `id`: Required, valid UUID
- `sessionId`: Required, valid UUID, must reference existing session
- `userName`: Required, non-empty string, max 100 characters
- `modelData`: Required, non-empty string (base64 or URL format)
- `submittedAt`: Required, valid ISO 8601 timestamp

**State Transitions**: None (trophies are immutable once submitted)

---

### Session (Existing - No Changes)

**Description**: Container for trophies. Already exists in backend and frontend.

**Backend Model** (`backend/src/Models/Session.cs`):
```csharp
public class Session
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public SessionStatus Status { get; set; }
    
    // Navigation property
    public ICollection<TrophySubmission> Trophies { get; set; }
}

public enum SessionStatus
{
    Active,
    Closed
}
```

**Frontend Model** (`frontend/src/hooks/useSession.ts`):
```typescript
interface Session {
  id: string;
  name: string;
  createdAt: string;
  status: 'Active' | 'Closed';
}
```

**Validation Rules**: (Existing - unchanged)
- `id`: Required, valid UUID
- `name`: Required, non-empty string, max 200 characters
- `createdAt`: Required, valid ISO 8601 timestamp
- `status`: Required, must be 'Active' or 'Closed'

**State Transitions**: (Existing - unchanged)
- `Active` → `Closed` (when session is manually closed)

---

## Frontend-Only State (New)

### PollingState (New)

**Description**: Client-side state for managing automatic trophy refresh polling lifecycle.

**Location**: `frontend/src/hooks/useTrophies.ts` (internal hook state)

**State Shape**:
```typescript
interface PollingState {
  isPolling: boolean;        // Whether polling is currently active
  isInactive: boolean;       // Whether user has been inactive for 5+ minutes
  lastUpdated: Date | null;  // Timestamp of last successful trophy fetch
  isRefreshing: boolean;     // Whether a fetch operation is in progress
  error: string | null;      // Error message from last failed fetch (null if success)
}
```

**Validation Rules**:
- `isPolling`: Boolean, default `true` when component mounts, `false` on unmount
- `isInactive`: Boolean, default `false`, set to `true` after 5 minutes of no user activity
- `lastUpdated`: Nullable Date, set to current time after each successful fetch
- `isRefreshing`: Boolean, `true` during fetch, `false` otherwise
- `error`: Nullable string, set to error message on fetch failure, cleared on success

**State Transitions**:
```
Initial state: { isPolling: true, isInactive: false, lastUpdated: null, isRefreshing: false, error: null }

On mount → Start polling (isPolling: true)
On unmount → Stop polling (isPolling: false)
On 5 min inactivity → Pause polling (isInactive: true, isPolling: false)
On user activity after pause → Resume polling (isInactive: false, isPolling: true)
On fetch start → Set isRefreshing: true
On fetch success → Set isRefreshing: false, lastUpdated: new Date(), error: null
On fetch error → Set isRefreshing: false, error: <message>
On manual refresh → Trigger fetch (same transitions as automatic fetch)
```

**Lifecycle Diagram**:
```
┌─────────────┐
│   Mounted   │
│ (polling)   │
└──────┬──────┘
       │
       │ Fetch every 3s
       ├────────────────┐
       │                │
       ▼                ▼
  ┌─────────┐      ┌──────────┐
  │ Success │      │  Error   │
  │ (update)│      │ (retry)  │
  └────┬────┘      └────┬─────┘
       │                │
       │                └──────┐
       │                       │
       │ 5 min no activity     │
       ▼                       │
  ┌──────────┐                 │
  │  Paused  │                 │
  │(inactive)│                 │
  └────┬─────┘                 │
       │                       │
       │ User activity         │
       ▼                       │
  ┌──────────┐                 │
  │ Resumed  │◄────────────────┘
  │(polling) │
  └──────────┘
       │
       │ Unmount
       ▼
  ┌──────────┐
  │ Stopped  │
  └──────────┘
```

---

### NewTrophyTracking (New)

**Description**: Client-side state for tracking which trophies are new (for highlight animation).

**Location**: `frontend/src/pages/SessionPage.tsx` (component state)

**State Shape**:
```typescript
interface NewTrophyTracking {
  previousTrophyIds: Set<string>;  // Trophy IDs from previous fetch
  newTrophyIds: Set<string>;       // Trophy IDs not in previousTrophyIds
}
```

**Validation Rules**:
- `previousTrophyIds`: Set of valid UUID strings, updated after each fetch
- `newTrophyIds`: Set of valid UUID strings, calculated as `currentIds - previousTrophyIds`

**State Transitions**:
```
Initial state: { previousTrophyIds: new Set(), newTrophyIds: new Set() }

On first fetch → previousTrophyIds: Set(allTrophyIds), newTrophyIds: Set() (no highlights)
On subsequent fetch → newTrophyIds: currentIds - previousTrophyIds
After 3 seconds → newTrophyIds: Set() (clear highlights)
Update previousTrophyIds → currentIds for next comparison
```

---

## API Response DTOs (Existing - Reference)

### SessionWithTrophiesResponse (Existing)

**Description**: API response containing session metadata and associated trophies.

**Backend DTO** (`backend/src/Models/SessionWithTrophiesResponse.cs`):
```csharp
public class SessionWithTrophiesResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public DateTime CreatedAt { get; set; }
    public SessionStatus Status { get; set; }
    public List<TrophySubmissionResponse> Trophies { get; set; }
}

public class TrophySubmissionResponse
{
    public Guid Id { get; set; }
    public string UserName { get; set; }
    public string ModelData { get; set; }
    public DateTime SubmittedAt { get; set; }
}
```

**Usage**: Returned by `GET /api/sessions/{id}` endpoint (existing or new endpoint for trophy fetch).

---

## Relationships

### Trophy → Session (Existing)
- **Type**: Many-to-One
- **Description**: Each trophy belongs to exactly one session
- **Backend**: Foreign key `TrophySubmission.SessionId` references `Session.Id`
- **Frontend**: Trophy object includes `sessionId` field

### Session → Trophies (Existing)
- **Type**: One-to-Many
- **Description**: Each session can have zero or more trophies
- **Backend**: Navigation property `Session.Trophies` (collection)
- **Frontend**: Session fetched with trophies via API response

---

## Data Flow

### Manual Refresh Flow
```
User clicks "Refresh Trophies" button
  ↓
SessionPage sets isRefreshing: true
  ↓
useTrophies.refetch() called
  ↓
API GET /api/sessions/{id} or /api/sessions/{id}/trophies
  ↓
Backend returns SessionWithTrophiesResponse
  ↓
Frontend updates trophies state, lastUpdated: new Date(), isRefreshing: false
  ↓
UI re-renders with new trophy list and "Updated X seconds ago" timestamp
  ↓
NewTrophyTracking calculates newTrophyIds
  ↓
New trophies render with 'new-trophy' CSS class (highlight animation)
```

### Automatic Polling Flow
```
Component mounts / User becomes active after pause
  ↓
useTrophies starts polling (setInterval, 3s)
  ↓
Every 3 seconds: fetch trophies (same API call as manual refresh)
  ↓
Update state (trophies, lastUpdated)
  ↓
If new trophies detected → Apply highlight animation
  ↓
Continue polling until:
  - User inactive for 5 min (pause)
  - Component unmounts (stop)
```

### Inactivity Detection Flow
```
Component mounts
  ↓
useInactivity hook starts listening (mousemove, keydown, click)
  ↓
User inactive for 5 minutes
  ↓
isInactive: true → useTrophies pauses polling
  ↓
PollingIndicator shows "SNOOZING" badge
  ↓
User moves mouse / clicks / types
  ↓
isInactive: false → useTrophies resumes polling
  ↓
PollingIndicator shows "LIVE" badge
```

---

## Summary

- **No backend data model changes**: Existing Trophy and Session entities are sufficient
- **Frontend state additions**: PollingState and NewTrophyTracking manage UI behavior
- **API usage**: Reuse existing `GET /api/sessions/{id}` or create new `GET /api/sessions/{id}/trophies` endpoint
- **State management**: React hooks (`useTrophies`, `useInactivity`, `useRelativeTime`) encapsulate all polling and tracking logic
