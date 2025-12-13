# Research: Trophy3D Sharing App Implementation

**Date**: December 13, 2025  
**Feature**: 001-trophy-sharing  
**Status**: Phase 0 Complete

## 1. Backend Architecture: .NET 8 + ASP.NET Core

**Decision**: Use ASP.NET Core 8 with Entity Framework Core for REST API

**Rationale**:
- .NET 8 is the latest LTS release with excellent performance characteristics
- ASP.NET Core provides built-in dependency injection, middleware pipeline, and async/await support
- Entity Framework Core simplifies session and trophy persistence without boilerplate
- Strong type safety reduces bugs in domain logic
- Rich ecosystem for validation (FluentValidation), testing (xUnit, Moq), and containerization

**Alternatives Considered**:
- Node.js/Express: Rejected - slower type safety, less opinionated structure
- Go: Rejected - overkill for MVP scope, smaller ecosystem for EF-like ORM
- Python/FastAPI: Rejected - startup not in core team expertise

**Key Patterns**:
- Domain-Driven Design: Aggregate roots (Session, Trophy Submission) with clear boundaries
- Service Layer: SessionService, TrophyService encapsulate business logic
- Repository Pattern: Abstraction for data access (in-memory for MVP, pluggable for upgrade)
- Dependency Injection: Constructor injection throughout; no service locators

## 2. Session Persistence Strategy

**Decision**: In-memory session storage for MVP with SQLite as optional persistence upgrade

**Rationale**:
- MVP scope doesn't require distributed sessions or complex durability guarantees
- In-memory reduces deployment complexity (no database connection strings)
- Session timeout (24 hours) aligns with temporary nature of trophy events
- Easy transition to SQLite or PostgreSQL if scale demands persistence
- EF Core DbContext setup identical regardless of provider (can toggle at startup)

**Alternatives Considered**:
- Redis: Rejected - adds deployment complexity, overkill for 10 concurrent sessions
- PostgreSQL immediately: Rejected - MVP doesn't need it; adds Docker Compose complexity
- Files on disk: Rejected - no concurrent access protection, slower than memory

**Implementation**:
- DbContext with IRepository<T> abstraction
- Startup configuration toggles in-memory vs SQLite provider
- Session domain events trigger cleanup (explicit closure or timeout)

## 3. Frontend Architecture: React + Vite + three.js

**Decision**: React functional components with Hooks, Vite for build tooling, three.js for 3D rendering

**Rationale**:
- React ecosystem is mature, well-documented, widely supported for UI
- Vite provides fast HMR and optimized production builds (faster than CRA)
- three.js is the industry standard for web-based 3D rendering (battle-tested)
- TypeScript ensures type safety and IDE support
- Functional components + Hooks are modern React patterns (Composition > Classes)

**Alternatives Considered**:
- Vue.js: Rejected - smaller ecosystem, learning curve for team
- Svelte: Rejected - less 3D library support, smaller community
- Babylon.js instead of three.js: Rejected - three.js has more trophy/art examples
- Canvas 2D instead of 3D: Rejected - defeats the "flamboyant" UI requirement

**Key Patterns**:
- Component-based architecture: SessionPage, SubmissionForm, PresentationView
- Custom Hooks: useSession, useTrophyList, useThreeJSScene
- API client: Centralized service for backend communication (Axios or Fetch)
- State Management: React Context for session state (no Redux for MVP scope)

## 4. 3D Trophy Rendering

**Decision**: Pre-made 3D trophy model (glTF/GLTF format) rendered via three.js, displayed with recipient name and text overlay

**Rationale**:
- glTF is the web standard for 3D models (small file size, fast loading)
- Pre-made trophy avoids procedural generation complexity
- Text overlay in DOM (not texture) allows dynamic recipient/achievement text
- Lighting and animation add flamboyance without implementation burden
- three.js has mature examples for loading, lighting, and animating models

**Alternatives Considered**:
- Procedurally generated trophies: Rejected - too complex, less visually impressive
- SVG 3D: Rejected - poor 3D rendering quality, limited animation
- Babylon.js: Rejected - three.js more mature for this use case
- Pure CSS 3D transforms: Rejected - insufficient for intricate trophy geometry

**Implementation**:
- Single trophy.gltf asset (or Sketchfab-sourced free model)
- Lighting setup: 3x lights (key, fill, back) for theatrical effect
- Camera framing: Zoom and rotation to showcase trophy
- Text overlay: HTML positioned over canvas with recipient name + achievement

## 5. Docker & Deployment

**Decision**: Docker + Docker Compose for local dev; separate containers for backend and frontend

**Rationale**:
- Consistency across dev, test, and production environments
- Docker Compose simplifies multi-container orchestration for local development
- Containers are independent, enabling future scaling (e.g., horizontal replica)
- No vendor lock-in (standard Docker)

**Alternatives Considered**:
- Kubernetes: Rejected - overkill for MVP; add later if scale demands
- Single monolithic container: Rejected - reduces flexibility, harder to update services independently

**Implementation**:
- Backend Dockerfile: Multi-stage build, optimized ASP.NET Core image
- Frontend Dockerfile: Node.js build stage → nginx serving SPA
- docker-compose.yml: Defines services, volumes, network, env vars
- .dockerignore: Excludes node_modules, test folders to reduce image size

## 6. API Contract & Communication

**Decision**: RESTful API with JSON payloads, OpenAPI 3.0 specification

**Rationale**:
- REST is simple, stateless, and cacheable
- JSON is universal, lightweight, and human-readable
- OpenAPI enables auto-generated SDK docs and client code generation
- No need for GraphQL (queries are simple, no complex nested fetching)
- No WebSockets needed (MVP scope: no real-time updates)

**Endpoints** (conceptual):
- POST `/api/sessions` → Create session, return session ID + link
- GET `/api/sessions/{id}` → Fetch session + trophy list
- POST `/api/sessions/{id}/trophies` → Submit trophy nomination
- POST `/api/sessions/{id}/present` → Toggle presentation mode
- GET `/api/sessions/{id}/trophies/{trophyId}` → Fetch individual trophy for rendering

## 7. Testing Strategy

**Decision**: Happy path E2E testing required; unit + integration coverage for services

**Rationale**:
- Constitution mandates test-first happy path before feature completion
- Happy path proves core workflow works end-to-end
- Unit tests validate business logic (session lifecycle, trophy validation)
- Integration tests verify API contract and database interactions
- Frontend tests confirm component rendering and user interactions

**Happy Path Test Cases**:
1. Create session → Get shareable link
2. Access link → See submission form
3. Submit trophy → Confirm message
4. Transition to present mode → See first 3D trophy
5. Navigate to next trophy → See new trophy
6. Complete all trophies → See "That is all." message

**Testing Stack**:
- Backend: xUnit + Moq (mocking external dependencies)
- Frontend: Vitest + React Testing Library (component testing)
- Integration: Postman/Newman or custom client tests

## 8. Session Lifecycle & State Management

**Decision**: Session has three explicit states: CREATED, COLLECTING, PRESENTING; explicit state transitions

**Rationale**:
- Clear state machine prevents invalid transitions (e.g., can't present without collecting)
- State determines which UI and endpoints are available
- Organizer controls transitions (not automatic)
- Session data is immutable once locked into presentation mode

**Alternatives Considered**:
- Implicit state via presence of field: Rejected - ambiguous, harder to test
- Time-based auto-transition: Rejected - organizer controls timing

**Implementation**:
- Session.Status enum: CREATED → COLLECTING → PRESENTING → CLOSED
- Service enforces valid transitions or throws DomainException
- UI disables buttons based on current state

## 9. Error Handling & Validation

**Decision**: Input validation at API layer; domain validation in services; clear error responses with HTTP status codes

**Rationale**:
- Constitution demands correctness and clear error handling
- Validation happens early to fail fast
- HTTP status codes signal problem category to client (400 bad request, 404 not found, 500 server error)
- Informative error messages guide users to fix issues

**Key Validations**:
- FR-007: Trophy form requires both recipient name and text (validation rule at submission time)
- Session URL validity: Return 404 if session not found
- Form field lengths: Recipient name 1-100 chars, text 1-500 chars
- Duplicate prevention: Each submission is unique (no dedupe logic needed, all are valid)

## 10. Naming & Domain Language

**Decision**: Use ubiquitous language from domain (Session, Trophy Submission, Organizer, Recipient)

**Rationale**:
- Aligns code with feature spec terminology
- Clear intent in method names (CreateSession, SubmitTrophy, PresentTrophy)
- Reduces mental translation between spec and code

**Key Terms**:
- **Session**: A unique trophy-sharing event (domain aggregate root)
- **Trophy Submission**: A single nomination (recipient + text)
- **Organizer**: The user who created the session
- **Recipient**: The team member being honored with the trophy
- **Presentation Mode**: UI state where trophies are displayed 3D-rendered

---

## Summary

All technical decisions align with:
- ✅ **Constitution principles**: Type safety (C#), testing required, clear code
- ✅ **Specification requirements**: Three P1 stories implementable with chosen stack
- ✅ **MVP scope**: No over-engineering; simple session persistence, REST API, React UI
- ✅ **Flamboyant UI**: 3D trophies with animations, theatrical presentation ready
- ✅ **Deployment**: Docker enables shipping as specified

**Ready for Phase 1**: Data model design can now proceed with confidence in technical approach.
