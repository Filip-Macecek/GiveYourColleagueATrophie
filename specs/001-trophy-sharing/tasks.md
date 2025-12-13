# Tasks: Trophy3D Sharing App

**Feature Branch**: `001-trophy-sharing`  
**Input**: Design documents from `/specs/001-trophy-sharing/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [data-model.md](data-model.md), [contracts/openapi.yaml](contracts/openapi.yaml)

**Tests**: This feature does NOT explicitly request tests. Test tasks are therefore NOT included. Add tests later if needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: ALWAYS `- [ ]` (markdown checkbox)
- **[ID]**: Sequential task number (T001, T002, T003...)
- **[P]**: Task can run in parallel (different files, no dependencies)
- **[Story]**: User story label (e.g., [US1], [US2], [US3]) - ONLY for user story tasks
- **Description**: Clear action with exact file path

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`
- **Tests**: `backend/tests/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per implementation plan

- [x] T001 Create backend directory structure: backend/src/{Models,Services,Controllers,Data,Filters}, backend/tests/{Unit,Integration}
- [x] T002 Initialize .NET 8 backend project with ASP.NET Core dependencies in backend/backend.csproj
- [x] T003 Create frontend directory structure: frontend/src/{components,pages,services,hooks,assets/models}, frontend/tests/{unit,integration}
- [x] T004 [P] Initialize React + Vite frontend project with TypeScript in frontend/package.json
- [x] T005 [P] Create docker-compose.yml at repository root with backend and frontend services
- [x] T006 [P] Create backend/Dockerfile with multi-stage build for ASP.NET Core
- [x] T007 [P] Create frontend/Dockerfile with Node.js build stage and nginx serving
- [x] T008 [P] Create .gitignore files for .NET (backend) and Node.js (frontend)
- [x] T009 [P] Create README.md at repository root with project overview

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Setup Entity Framework Core DbContext in backend/src/Data/TrophyDbContext.cs with Sessions, TrophySubmissions, Users tables
- [x] T011 [P] Configure EF Core with in-memory provider in backend/src/Program.cs for MVP
- [x] T012 [P] Implement global exception handling middleware in backend/src/Filters/GlobalExceptionFilter.cs
- [x] T013 [P] Configure CORS policy in backend/src/Program.cs to allow frontend origin
- [x] T014 [P] Setup API routing and Swagger/OpenAPI configuration in backend/src/Program.cs
- [x] T015 [P] Create base ErrorResponse DTOs in backend/src/Models/ErrorResponse.cs
- [x] T016 [P] Configure logging infrastructure (ILogger) in backend/src/Program.cs
- [x] T017 [P] Create API client service skeleton in frontend/src/services/api.ts with Axios/Fetch wrapper
- [x] T018 [P] Setup React Router configuration in frontend/src/App.tsx for session, submission, presentation pages
- [x] T019 [P] Create environment configuration for API base URL in frontend/.env and frontend/vite.config.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Session Organizer Creates Sharing Session (Priority: P1) 🎯 MVP

**Goal**: Enable organizers to create a session and receive a shareable link for team members

**Independent Test**: Open app → Click "Start Session" → Verify unique session ID and shareable link are displayed

### Implementation for User Story 1

- [x] T020 [P] [US1] Create Session entity model in backend/src/Models/Session.cs with Id, SessionCode, OrganizerId, Status, CreatedAt, ExpiresAt, Trophies
- [x] T021 [P] [US1] Create User entity model in backend/src/Models/User.cs with Id, Name, SessionId, CreatedAt (lightweight)
- [x] T022 [P] [US1] Create SessionStatus enum in backend/src/Models/SessionStatus.cs (CREATED, COLLECTING, PRESENTING, CLOSED)
- [x] T023 [US1] Configure Session entity EF Core mapping in backend/src/Data/TrophyDbContext.cs (indexes, relationships, cascade)
- [x] T024 [US1] Configure User entity EF Core mapping in backend/src/Data/TrophyDbContext.cs
- [x] T025 [P] [US1] Create SessionResponse DTO in backend/src/Models/SessionResponse.cs per OpenAPI schema
- [x] T026 [P] [US1] Create CreateSessionRequest DTO in backend/src/Models/CreateSessionRequest.cs (optional organizerName)
- [x] T027 [US1] Implement ISessionService interface in backend/src/Services/ISessionService.cs with CreateSession, GetByCode methods
- [x] T028 [US1] Implement SessionService in backend/src/Services/SessionService.cs with session creation logic (generate unique SessionCode, compute ExpiresAt)
- [x] T029 [US1] Add session code generation logic in backend/src/Services/SessionService.cs (8 alphanumeric chars, uniqueness check)
- [x] T030 [US1] Implement SessionsController in backend/src/Controllers/SessionsController.cs with POST /api/sessions endpoint
- [x] T031 [US1] Implement GET /api/sessions/{sessionCode} endpoint in backend/src/Controllers/SessionsController.cs
- [x] T032 [US1] Add validation for session expiration check in backend/src/Services/SessionService.cs (IsExpired method)
- [x] T033 [P] [US1] Create SessionPage component in frontend/src/pages/SessionPage.tsx with "Start Session" button
- [x] T034 [P] [US1] Create useSession custom hook in frontend/src/hooks/useSession.ts for session state management
- [x] T035 [US1] Implement createSession API call in frontend/src/services/api.ts
- [x] T036 [US1] Implement getSession API call in frontend/src/services/api.ts
- [x] T037 [US1] Display session code and shareable URL in SessionPage after creation
- [x] T038 [US1] Add copy-to-clipboard functionality for shareable link in frontend/src/pages/SessionPage.tsx
- [x] T039 [US1] Add error handling for session not found (404) in frontend/src/pages/SessionPage.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create sessions and share links

---

## Phase 4: User Story 2 - Team Members Submit Trophy Nominations (Priority: P1)

**Goal**: Enable team members to access session link and submit trophy nominations with recipient name and achievement text

**Independent Test**: Access session link → Fill form with recipient and text → Submit → Verify confirmation message

### Implementation for User Story 2

- [x] T040 [P] [US2] Create TrophySubmission entity model in backend/src/Models/TrophySubmission.cs with Id, SessionId, RecipientName, AchievementText, SubmitterName, SubmittedAt, DisplayOrder
- [x] T041 [US2] Configure TrophySubmission entity EF Core mapping in backend/src/Data/TrophyDbContext.cs (foreign key to Session, unique DisplayOrder constraint)
- [x] T042 [P] [US2] Create TrophySubmissionRequest DTO in backend/src/Models/TrophySubmissionRequest.cs per OpenAPI schema (validation attributes)
- [x] T043 [P] [US2] Create TrophySubmissionResponse DTO in backend/src/Models/TrophySubmissionResponse.cs per OpenAPI schema
- [x] T044 [US2] Implement ITrophyService interface in backend/src/Services/ITrophyService.cs with SubmitTrophy, GetBySession methods
- [x] T045 [US2] Implement TrophyService in backend/src/Services/TrophyService.cs with submission logic and DisplayOrder auto-increment
- [x] T046 [US2] Add validation in TrophyService for session status (must be COLLECTING to accept submissions)
- [x] T047 [US2] Implement POST /api/sessions/{sessionCode}/trophies endpoint in backend/src/Controllers/TrophiesController.cs
- [x] T048 [US2] Implement GET /api/sessions/{sessionCode}/trophies endpoint in backend/src/Controllers/TrophiesController.cs
- [x] T049 [US2] Add field validation for RecipientName (1-100 chars) and AchievementText (1-500 chars) in backend/src/Models/TrophySubmissionRequest.cs
- [x] T050 [US2] Add server-side validation error responses (400 with field errors) in backend/src/Controllers/TrophiesController.cs
- [x] T051 [P] [US2] Create TrophyForm component in frontend/src/components/TrophyForm.tsx with "For:" and "Text:" fields
- [x] T052 [P] [US2] Create SubmissionPage component in frontend/src/pages/SubmissionPage.tsx displaying TrophyForm
- [x] T053 [P] [US2] Create useTrophies custom hook in frontend/src/hooks/useTrophies.ts for trophy state management
- [x] T054 [US2] Implement submitTrophy API call in frontend/src/services/api.ts
- [x] T055 [US2] Implement listTrophies API call in frontend/src/services/api.ts
- [x] T056 [US2] Add client-side form validation in TrophyForm (required fields, max lengths, trim whitespace)
- [x] T057 [US2] Display confirmation message after successful submission in frontend/src/components/TrophyForm.tsx
- [x] T058 [US2] Clear form fields after successful submission in frontend/src/components/TrophyForm.tsx
- [x] T059 [US2] Display trophy count (number of submissions) on SubmissionPage in frontend/src/pages/SubmissionPage.tsx
- [x] T060 [US2] Add validation error display (field-specific errors from API) in frontend/src/components/TrophyForm.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - sessions can be created and trophies submitted

---

## Phase 5: User Story 3 - Organizer Presents 3D Trophy Renderings (Priority: P1)

**Goal**: Enable organizer to transition to presentation mode and view 3D rendered trophies with navigation

**Independent Test**: Click "Present" with submissions → Verify 3D trophy displays with recipient/text → Click "Next" → Verify navigation works → See "That is all." at end

### Implementation for User Story 3

- [x] T061 [US3] Implement POST /api/sessions/{sessionCode}/present endpoint in backend/src/Controllers/SessionsController.cs
- [x] T062 [US3] Add session status transition logic in SessionService (COLLECTING → PRESENTING) in backend/src/Services/SessionService.cs
- [x] T063 [US3] Add validation in SessionService to require at least 1 trophy before presenting
- [x] T064 [US3] Implement GET /api/sessions/{sessionCode}/trophies/{trophyId} endpoint in backend/src/Controllers/TrophiesController.cs
- [x] T065 [P] [US3] Create TrophyDetailsResponse DTO in backend/src/Models/TrophyDetailsResponse.cs with nextTrophyId and isLastTrophy fields
- [x] T066 [US3] Add logic in TrophyService to determine next trophy ID and last trophy flag
- [x] T067 [P] [US3] Install three.js and @react-three/fiber dependencies in frontend/package.json
- [ ] T068 [P] [US3] Create TrophyRenderer service in frontend/src/services/TrophyRenderer.ts for three.js scene setup
- [ ] T069 [US3] Download or create trophy.gltf 3D model file in frontend/src/assets/models/trophy.gltf
- [x] T070 [P] [US3] Create TrophyPresentation component in frontend/src/components/TrophyPresentation.tsx with three.js canvas
- [x] T071 [P] [US3] Create PresentationPage component in frontend/src/pages/PresentationPage.tsx
- [ ] T072 [US3] Implement 3D scene setup in TrophyRenderer (camera, lights: key, fill, back for theatrical effect)
- [ ] T073 [US3] Load trophy.gltf model in TrophyRenderer using three.js GLTFLoader
- [x] T074 [US3] Add recipient name and achievement text overlay in TrophyPresentation component (HTML positioned over canvas)
- [x] T075 [US3] Implement startPresentation API call in frontend/src/services/api.ts
- [x] T076 [US3] Implement getTrophy API call in frontend/src/services/api.ts
- [x] T077 [US3] Add "Present" button to SessionPage (visible only to organizer when trophies exist) in frontend/src/pages/SessionPage.tsx
- [x] T078 [US3] Implement navigation to PresentationPage on "Present" click in frontend/src/pages/SessionPage.tsx
- [x] T079 [US3] Display first trophy on PresentationPage load in frontend/src/pages/PresentationPage.tsx
- [x] T080 [US3] Add "Next" button in PresentationPage to navigate to next trophy
- [x] T081 [US3] Implement next trophy logic using nextTrophyId from API response in frontend/src/pages/PresentationPage.tsx
- [x] T082 [US3] Display "That is all." message when isLastTrophy is true in frontend/src/pages/PresentationPage.tsx
- [ ] T083 [US3] Add trophy animation or rotation effect in TrophyRenderer for flamboyant presentation
- [x] T084 [US3] Handle 3D rendering errors with fallback message (display text-only if model fails) in frontend/src/components/TrophyPresentation.tsx

**Checkpoint**: All three user stories should now be independently functional - complete MVP workflow works end-to-end

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and deployment readiness

- [x] T085 [P] Add POST /api/sessions/{sessionCode}/close endpoint in backend/src/Controllers/SessionsController.cs for explicit session closure
- [ ] T086 [P] Implement session auto-expiration background task in backend/src/Services/SessionCleanupService.cs (checks ExpiresAt)
- [x] T087 [P] Add HTTP status code documentation in backend/src/Controllers/ (409 for invalid state transitions, 410 for expired)
- [x] T088 [P] Add loading states and spinners in frontend components (SessionPage, SubmissionPage, PresentationPage)
- [x] T089 [P] Add responsive design CSS for mobile and desktop in frontend/src/App.css or component styles
- [x] T090 [P] Implement "Presentation in progress" message for users accessing session link during presentation in frontend/src/pages/SubmissionPage.tsx
- [ ] T091 [P] Add accessibility attributes (ARIA labels, keyboard navigation) in frontend components
- [ ] T092 [P] Optimize 3D model loading with caching in TrophyRenderer service
- [ ] T093 Build and verify Docker Compose setup: docker-compose up -d, test backend on :5000 and frontend on :3000
- [ ] T094 Validate quickstart.md instructions: follow steps and verify all commands work
- [x] T095 [P] Update README.md with feature description, setup instructions, and architecture overview
- [ ] T096 Code cleanup: Remove unused imports, format code, add JSDoc/XML comments
- [ ] T097 Security review: Ensure no SQL injection, validate all inputs, sanitize text fields
- [ ] T098 [P] Add environment-specific configuration (.env.development, .env.production) for frontend
- [ ] T099 Performance testing: Verify session creation <100ms, trophy submission <200ms, 3D rendering 60fps
- [ ] T100 Final integration test: Create session → Submit 3 trophies → Present all → Verify "That is all." message

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational (Phase 2) completion
  - User stories CAN proceed in parallel (if staffed)
  - Or sequentially in priority order (all are P1, but recommend: US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (Phase 3)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ INDEPENDENT
- **User Story 2 (Phase 4)**: Can start after Foundational (Phase 2) - Requires Session entity from US1 but independently testable (create session first, then submit)
- **User Story 3 (Phase 5)**: Can start after Foundational (Phase 2) - Requires Session and TrophySubmission from US1/US2 but independently testable (create session, submit trophy, then present)

**Recommendation**: Complete sequentially in order (US1 → US2 → US3) for simplest workflow and natural dependencies. Each story builds on the previous.

### Within Each User Story

- Models/entities before services
- Services before controllers/endpoints
- Backend endpoints before frontend API calls
- API integration before UI components
- Core functionality before error handling and polish
- Story must be complete and testable before moving to next

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T004, T005, T006, T007, T008, T009 can run in parallel (different files)

**Phase 2 (Foundational)**: Tasks T011, T012, T013, T014, T015, T016, T017, T018, T019 can run in parallel after T010 completes

**User Story 1**: 
- T020, T021, T022 (models/enums) can run in parallel
- T025, T026 (DTOs) can run in parallel after models
- T033, T034 (frontend components) can run in parallel with backend work

**User Story 2**:
- T040, T042, T043 (model and DTOs) can run in parallel
- T051, T052, T053 (frontend components) can run in parallel with backend work

**User Story 3**:
- T065, T067, T068, T070, T071 can run in parallel
- T069 (download model) can happen independently anytime

**Phase 6 (Polish)**:
- Most tasks (T085-T092, T095, T096, T098) can run in parallel
- T093, T094 should run near end for validation

---

## Parallel Execution Examples

### Phase 1 (Setup) - Launch Together:
```bash
# All file creation and initialization tasks
T004: Initialize React + Vite frontend project
T005: Create docker-compose.yml
T006: Create backend Dockerfile
T007: Create frontend Dockerfile
T008: Create .gitignore files
T009: Create README.md
```

### Phase 2 (Foundational) - Launch After T010:
```bash
# Configuration and infrastructure tasks
T011: Configure EF Core with in-memory provider
T012: Implement global exception handling middleware
T013: Configure CORS policy
T014: Setup API routing and Swagger
T015: Create ErrorResponse DTOs
T016: Configure logging
T017: Create API client service
T018: Setup React Router
T019: Create environment configuration
```

### User Story 1 - Parallel Opportunities:
```bash
# Models and enums
T020: Create Session entity
T021: Create User entity
T022: Create SessionStatus enum

# After models complete, DTOs:
T025: Create SessionResponse DTO
T026: Create CreateSessionRequest DTO

# Frontend (parallel with backend):
T033: Create SessionPage component
T034: Create useSession hook
```

---

## Implementation Strategy

### MVP First (All Three P1 Stories)

Since all three user stories are P1 priority and interdependent (you need all three for the complete workflow), the MVP is:

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational
3. ✅ Complete Phase 3: User Story 1 (Session Creation)
4. ✅ Complete Phase 4: User Story 2 (Trophy Submission)
5. ✅ Complete Phase 5: User Story 3 (Presentation)
6. **STOP and VALIDATE**: Test complete workflow end-to-end
7. Deploy/demo MVP

**Minimum Viable Feature**: All 3 user stories must work together for the feature to be useful.

### Incremental Validation Strategy

1. **After Phase 2**: Verify foundation - server starts, API accessible, React app loads
2. **After US1**: Manually test session creation via Swagger or curl
3. **After US2**: Manually test trophy submission via Swagger or curl
4. **After US3**: Test complete workflow: Create → Submit → Present
5. **After Phase 6**: Final validation with Docker Compose

### Parallel Team Strategy

With 3 developers:

1. **Together**: Complete Setup (Phase 1) + Foundational (Phase 2)
2. **Developer A**: User Story 1 (T020-T039)
3. **Developer B**: User Story 2 (T040-T060) - starts after Developer A completes Session entity
4. **Developer C**: User Story 3 (T061-T084) - starts after Developer B completes TrophySubmission entity
5. **Together**: Polish (Phase 6) and integration testing

**Reality Check**: For solo developer, estimate ~40-60 hours for MVP (100 tasks). For small team, ~20-30 hours with parallelization.

---

## Summary

- ✅ **Total Tasks**: 100 tasks
- ✅ **User Story Breakdown**:
  - Setup: 9 tasks
  - Foundational: 10 tasks (BLOCKS all stories)
  - User Story 1: 20 tasks
  - User Story 2: 21 tasks
  - User Story 3: 24 tasks
  - Polish: 16 tasks
- ✅ **Parallel Opportunities**: ~35 tasks marked [P] can run in parallel within their phases
- ✅ **Independent Tests**: Each user story has clear independent test criteria
- ✅ **MVP Scope**: All 3 P1 user stories required for minimum viable feature
- ✅ **Format Validation**: All tasks follow `- [ ] [ID] [P?] [Story?] Description with path` format

**Ready for Implementation**: Each task is specific enough for an LLM to execute without additional context.
