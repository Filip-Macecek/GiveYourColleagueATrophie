# Data Model: Trophy3D Sharing App

**Date**: December 13, 2025  
**Feature**: 001-trophy-sharing  
**Status**: Phase 1 Design

## Domain Entities

### Entity: Session

**Purpose**: Represents a unique trophy-sharing event with organizer control and collection/presentation modes

**Fields**:
- `Id` (Guid): Unique session identifier
- `SessionCode` (string): Human-readable URL-safe code (e.g., "TROPHY-ABC123")
- `OrganizerId` (Guid): Reference to organizer user (can be anonymous)
- `Status` (enum): CREATED | COLLECTING | PRESENTING | CLOSED
- `ShareableUrl` (string, computed): `{baseUrl}/share/{SessionCode}`
- `CreatedAt` (DateTime): Session creation timestamp
- `ExpiresAt` (DateTime): Automatic expiration (24 hours from creation)
- `ClosedAt` (DateTime, nullable): Explicit closure timestamp by organizer
- `Trophies` (List<TrophySubmission>): Related submissions (0..*)

**Validation Rules**:
- `Id` and `SessionCode` must be unique (uniqueness constraint)
- `ExpiresAt` = `CreatedAt` + 24 hours (immutable, computed on creation)
- `Status` transitions only valid in order: CREATED → COLLECTING → PRESENTING → CLOSED
- `SessionCode` format: 8 alphanumeric characters (no special chars)
- Only valid during COLLECTING state to accept new trophy submissions
- Only valid during PRESENTING state to view presentations

**State Transitions**:
```
CREATED ──→ COLLECTING (on first form view OR explicit transition)
             │
             ├─→ PRESENTING (organizer clicks "Present" with Trophies.Count > 0)
             │
             └─→ CLOSED (explicit closure OR timeout reached)
```

**Relationships**:
- 1 organizer (anonymous is allowed)
- 1..* trophy submissions (0..* at creation, 1..* required to present)

---

### Entity: TrophySubmission

**Purpose**: Represents a single trophy nomination within a session

**Fields**:
- `Id` (Guid): Unique trophy identifier
- `SessionId` (Guid, FK): Foreign key to parent Session
- `RecipientName` (string): Name of person being honored
- `AchievementText` (string): Description of achievement or reason for nomination
- `SubmittedAt` (DateTime): Submission timestamp
- `SubmitterName` (string, nullable): Name of person who submitted (optional, for context)
- `DisplayOrder` (int): Position in presentation sequence (auto-assigned on submit)

**Validation Rules**:
- `RecipientName` required, 1-100 characters, trimmed
- `AchievementText` required, 1-500 characters, trimmed
- `SubmitterName` optional, 0-100 characters if provided
- `SessionId` must reference existing session in COLLECTING or PRESENTING state
- `DisplayOrder` auto-assigned: = max(existing DisplayOrder) + 1
- No duplicate submissions (but duplicates are allowed; system doesn't prevent re-nomination)

**Relationships**:
- Belongs to exactly 1 Session
- Child entities; deletion follows session cascade rule

---

### Entity: User (Lightweight)

**Purpose**: Represents a participant (organizer or submitter); lightweight for MVP

**Fields**:
- `Id` (Guid): Unique user identifier
- `Name` (string, optional): User-provided name (can be anonymous)
- `SessionId` (Guid, nullable, FK): References session organizer is managing (null for submitters)
- `CreatedAt` (DateTime): User record creation

**Validation Rules**:
- `Name` optional, 0-100 characters if provided
- `SessionId` present only if user is organizer
- Anonymous users have null Name and SessionId

**Relationships**:
- 0..1 sessions as organizer
- 0..* trophy submissions as contributor

**MVP Note**: User entity is minimal. Authentication/passwords not required for MVP. Users identified by session code or anonymously.

---

## Data Relationships

```
User (Organizer)
  │
  ├─ organizes ──→ Session
                     │
                     └─ contains ──→ TrophySubmission (0..*)
                                      │
                                      └─ references ──→ User (Submitter, optional)
```

**Cardinality**:
- 1 Session : 0..* TrophySubmissions
- 1 User : 0..1 Sessions (organizer role)
- 1 User : 0..* TrophySubmissions (contributor role)

---

## State Management

### Session Status Lifecycle

| Status | Can Accept Submissions | Can Present | Can Transition To |
|--------|------------------------|-------------|-------------------|
| CREATED | No | No | COLLECTING |
| COLLECTING | Yes | No (requires 1+ trophy) | PRESENTING, CLOSED |
| PRESENTING | No | Yes | CLOSED |
| CLOSED | No | No | — |

**Rules**:
- Session moves to COLLECTING on first access to submission form (implicit) OR manual start
- Session can only move to PRESENTING if Trophies.Count >= 1
- PRESENTING state locks submissions (no new trophies accepted)
- CLOSED state is terminal; session is read-only (view-only access)
- Session auto-closes if ExpiresAt timestamp is reached

---

## Validation Constraints (Domain Rules)

### Session-Level Constraints

1. **Uniqueness**: Each session must have unique `SessionCode` and `Id`
2. **State Coherence**: Status must follow defined transition rules
3. **Timeout**: Sessions automatically transition to CLOSED if ExpiresAt < now()
4. **Immutability**: OrganizerId and ShareableUrl cannot change after creation

### Trophy-Level Constraints

1. **Required Fields**: RecipientName and AchievementText are mandatory, non-empty
2. **Length Bounds**: See field definitions above
3. **Orphan Prevention**: TrophySubmission must always reference valid Session
4. **DisplayOrder**: Auto-incremented per session, no gaps allowed
5. **Scope**: Trophy cannot be moved between sessions

### Submission Rules (FR-007)

- Both RecipientName and AchievementText must be provided
- Whitespace-only values are invalid (trim and re-validate)
- Client-side validation provides immediate feedback
- Server-side validation prevents bypass

---

## Persistence Design

### Database Schema (Entity Framework Core)

```sql
-- Sessions Table
CREATE TABLE Sessions (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    SessionCode NVARCHAR(8) UNIQUE NOT NULL,
    OrganizerId UNIQUEIDENTIFIER NULL,
    Status INT NOT NULL, -- 0=CREATED, 1=COLLECTING, 2=PRESENTING, 3=CLOSED
    CreatedAt DATETIMEOFFSET NOT NULL,
    ExpiresAt DATETIMEOFFSET NOT NULL,
    ClosedAt DATETIMEOFFSET NULL
);

-- TrophySubmissions Table
CREATE TABLE TrophySubmissions (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    SessionId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Sessions(Id) ON DELETE CASCADE,
    RecipientName NVARCHAR(100) NOT NULL,
    AchievementText NVARCHAR(500) NOT NULL,
    SubmitterName NVARCHAR(100) NULL,
    SubmittedAt DATETIMEOFFSET NOT NULL,
    DisplayOrder INT NOT NULL,
    CONSTRAINT UQ_DisplayOrder UNIQUE (SessionId, DisplayOrder)
);

-- Users Table
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Name NVARCHAR(100) NULL,
    SessionId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Sessions(Id) ON DELETE SET NULL,
    CreatedAt DATETIMEOFFSET NOT NULL
);

CREATE INDEX IX_Sessions_ExpiresAt ON Sessions(ExpiresAt);
CREATE INDEX IX_TrophySubmissions_SessionId ON TrophySubmissions(SessionId);
CREATE INDEX IX_Users_SessionId ON Users(SessionId);
```

### Repository Pattern

**ISessionRepository**:
- `CreateAsync(session)`: Insert new session
- `GetByCodeAsync(code)`: Fetch session by URL code
- `GetByIdAsync(id)`: Fetch session by ID
- `UpdateAsync(session)`: Persist status changes
- `DeleteAsync(id)`: Hard delete (or soft delete with flag)
- `GetExpiredSessionsAsync()`: Background cleanup query

**ITrophyRepository**:
- `CreateAsync(trophy)`: Insert trophy submission
- `GetByIdAsync(id)`: Fetch single trophy
- `GetBySessionAsync(sessionId)`: Fetch all trophies in session, ordered by DisplayOrder
- `UpdateAsync(trophy)`: Update (rarely needed)
- `DeleteBySessionAsync(sessionId)`: Cascade delete on session close

**IUserRepository**:
- `CreateAsync(user)`: Insert user
- `GetByIdAsync(id)`: Fetch user
- `UpdateAsync(user)`: Update

### EF Core Configuration

```csharp
// Session configuration
modelBuilder.Entity<Session>()
    .HasKey(s => s.Id);
modelBuilder.Entity<Session>()
    .HasIndex(s => s.SessionCode).IsUnique();
modelBuilder.Entity<Session>()
    .HasIndex(s => s.ExpiresAt);
modelBuilder.Entity<Session>()
    .Property(s => s.Status)
    .HasConversion<int>();
modelBuilder.Entity<Session>()
    .HasMany(s => s.Trophies)
    .WithOne()
    .HasForeignKey(t => t.SessionId)
    .OnDelete(DeleteBehavior.Cascade);

// TrophySubmission configuration
modelBuilder.Entity<TrophySubmission>()
    .HasKey(t => t.Id);
modelBuilder.Entity<TrophySubmission>()
    .HasIndex(t => new { t.SessionId, t.DisplayOrder }).IsUnique();
```

---

## Computed Fields & Methods

### Session Methods

- `IsExpired()`: Returns true if DateTimeOffset.UtcNow > ExpiresAt
- `CanAcceptSubmissions()`: Returns true if Status == COLLECTING && !IsExpired()
- `CanPresent()`: Returns true if Status == PRESENTING
- `GetShareableUrl(baseUrl)`: Constructs full share URL from code

### TrophySubmission Methods

- `IsValid()`: Returns true if RecipientName and AchievementText are non-empty
- `Normalize()`: Trims whitespace from text fields

---

## Eventual Enhancements (Out of MVP Scope)

- User authentication & session ownership verification
- Trophy deletion per submission (right now all-or-nothing)
- Rich text/markdown support for achievement text
- Image uploads for trophies
- Session sharing logs (who viewed, who submitted)
- Analytics (sessions created, avg trophies per session)
- Session templating (reusable trophy prompts)

---

## Summary

The data model is **simple but complete**:
- ✅ Supports all three P1 user stories
- ✅ Enforces business rules via domain validation
- ✅ Clear state transitions prevent invalid operations
- ✅ Relationships are explicit and enforced
- ✅ Persistence layer abstracted via repositories
- ✅ Extensible without breaking current design
