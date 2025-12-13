# Implementation Plan: Trophy Refresh and Presentation Controls

**Branch**: `002-trophy-refresh-button` | **Date**: 2025-12-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-trophy-refresh-button/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add automatic trophy refresh with 3-second polling interval and manual refresh button to session page. Display "Present Trophies" button when 2+ trophies exist. Implement inactivity detection (5-minute pause), visual indicators for polling state, "last updated" timestamps, and highlight animations for new trophies. Maintains existing .NET 8.0 Web API backend and React 18 + TypeScript frontend with Three.js visualization capabilities.

## Technical Context

**Language/Version**: Backend: C# .NET 8.0, Frontend: TypeScript 5.3 + React 18  
**Primary Dependencies**: Backend: ASP.NET Core, Entity Framework Core, Serilog; Frontend: Vite, Axios, React Router, Three.js, @react-three/fiber  
**Storage**: Entity Framework Core InMemory (development/current implementation)  
**Testing**: Backend: xUnit/NUnit (via Trophy3D.Tests), Frontend: Vitest + @testing-library/react  
**Target Platform**: Web application (browser-based), containerized deployment (Docker)
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: <3s trophy refresh latency under normal conditions, 3-second polling interval, <2s navigation to presentation mode  
**Constraints**: <200ms API response time for trophy fetch (95th percentile), maintain UI state during refresh (scroll position), pause polling after 5 minutes inactivity  
**Scale/Scope**: Session-based application, small-to-medium user groups (10-100 concurrent users per session), real-time collaboration features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate (Initial)

#### I. Correctness Above All
✅ **PASS** - Feature has clear acceptance scenarios (15 for refresh/polling, 5 for presentation button). Happy path tests will be written for primary workflow (manual refresh + automatic polling + button visibility). Error handling specified for network failures and edge cases.

#### II. Flamboyant, Humorous UI/UX
⚠️ **REVIEW REQUIRED** - Feature spec focuses on functional requirements (polling, refresh, timestamps). No specific flamboyant or humorous UI elements mentioned. **ACTION**: Research and design phase must incorporate playful visual indicators, absurd animations for new trophy highlights, and theatrical "Present Trophies" button styling to maintain Trophy3D's personality.

#### III. Test-First Happy Path (MANDATORY)
✅ **PASS** - Acceptance scenarios provide testable criteria. Happy path: (1) manual refresh updates list, (2) automatic polling fetches trophies every 3s, (3) "Present Trophies" appears when count >= 2. Tests will be written before/during implementation.

#### IV. Code Clarity & Documentation
✅ **PASS** - Feature requires clear inactivity detection logic, polling lifecycle management, and timestamp formatting. Implementation will include comments for complex logic (debouncing, cleanup) and meaningful function names.

#### V. Simplicity & Restraint in Scope
✅ **PASS** - Feature adds necessary real-time updates without over-engineering. Uses simple polling (not WebSockets) appropriate for 3-second intervals. Inactivity pause prevents server load. Scope is well-defined with clear acceptance criteria.

**Pre-Research Gate**: ⚠️ **CONDITIONAL PASS** - Proceed to Phase 0 with requirement to address UI personality in research/design phase.

---

### Post-Design Gate (Re-evaluation)

#### I. Correctness Above All
✅ **PASS** - Design includes comprehensive error handling (try/catch in fetch, preserve data on failure, auto-retry). Happy path tests defined in quickstart.md (Tasks 4.1-4.3) cover hooks, components, and integration scenarios. Data flow documented in data-model.md ensures correctness.

#### II. Flamboyant, Humorous UI/UX
✅ **PASS** - Research Task 2: Pulsing "✨ LIVE ✨" badge with color cycling and scale animation; "😴 SNOOZING 😴" badge with gentle fade. Research Task 4: Gold background flash with fade-in animation for new trophies. Research Task 5: "🎭 PRESENT TROPHIES! 🎭" button with gradient background, dramatic shadow, exaggerated hover effects (scale, rotation, glow). All UI elements embrace theatrical excess and playful personality per Constitution Principle II.

#### III. Test-First Happy Path (MANDATORY)
✅ **PASS** - Quickstart Phase 4 (Testing) defines explicit test tasks: unit tests for `useInactivity`, `useRelativeTime`, `useTrophies` hooks; component tests for `RefreshButton`, `PollingIndicator`, `SessionPage`; integration tests for polling lifecycle, new trophy highlights, button visibility. Tests cover happy path before implementation per TDD workflow.

#### IV. Code Clarity & Documentation
✅ **PASS** - Research.md provides implementation examples with clear comments (e.g., "Cleanup" in useEffect, "Prevent concurrent fetches" in fetchTrophies). Quickstart.md documents all file changes, key constants, and API endpoints. Data-model.md explains state transitions and lifecycle diagrams. Code examples use meaningful names (`isRefreshing`, `resetTimer`, `updateRelativeTime`).

#### V. Simplicity & Restraint in Scope
✅ **PASS** - Design uses simple React patterns (custom hooks, useEffect with setInterval, CSS animations). No external polling libraries or WebSocket complexity. Backend requires minimal or no changes (reuse existing endpoint). Frontend state is local to components (no global state manager). Meets YAGNI principle.

**Post-Design Gate**: ✅ **FULL PASS** - All constitution principles satisfied. Feature is ready for implementation (Phase 2: Tasks).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── Controllers/
│   │   ├── SessionsController.cs     # GET /sessions/{id}/trophies endpoint (existing)
│   │   └── TrophiesController.cs     # Trophy CRUD endpoints (existing)
│   ├── Services/
│   │   ├── ISessionService.cs        # Existing session interface
│   │   ├── SessionService.cs         # Existing session service
│   │   ├── ITrophyService.cs         # Existing trophy interface
│   │   └── TrophyService.cs          # Existing trophy service
│   └── Models/
│       ├── Session.cs                # Existing session model
│       ├── TrophySubmission.cs       # Existing trophy model
│       └── SessionWithTrophiesResponse.cs  # Response DTO (existing or new)
└── tests/
    ├── Unit/                         # Unit tests for services
    └── Integration/                  # API integration tests

frontend/
├── src/
│   ├── components/
│   │   ├── TrophyForm.tsx           # Existing trophy submission form
│   │   ├── TrophyPresentation.tsx   # Existing presentation component
│   │   └── RefreshButton.tsx        # NEW: Refresh button with loading state
│   ├── pages/
│   │   ├── SessionPage.tsx          # MODIFY: Add refresh + auto-polling + button logic
│   │   ├── SubmissionPage.tsx       # Existing submission page
│   │   └── PresentationPage.tsx     # Existing presentation page
│   ├── hooks/
│   │   ├── useTrophies.ts           # MODIFY: Add auto-polling and inactivity detection
│   │   ├── useSession.ts            # Existing session hook
│   │   └── useInactivity.ts         # NEW: Inactivity detection hook
│   └── services/
│       └── api.ts                   # MODIFY: Add trophy fetch function if needed
└── tests/
    ├── unit/                         # Component unit tests (Vitest)
    └── integration/                  # End-to-end tests
```

**Structure Decision**: Web application structure (backend + frontend). Backend is ASP.NET Core Web API with layered architecture (Controllers → Services → Models). Frontend is React SPA with component-based structure using hooks for state management. Feature will extend existing SessionPage component and useTrophies hook, add new RefreshButton component and useInactivity hook for polling lifecycle.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
No violations requiring justification. The ⚠️ REVIEW REQUIRED flag for UI personality is an enhancement requirement, not a violation - the feature must incorporate flamboyant/humorous elements in the design phase to comply with Constitution Principle II.