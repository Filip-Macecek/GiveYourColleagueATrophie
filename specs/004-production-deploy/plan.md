# Implementation Plan: Production Deployment Configuration

**Branch**: `004-production-deploy` | **Date**: 2025-12-13 | **Spec**: [specs/004-production-deploy/spec.md](specs/004-production-deploy/spec.md)
**Input**: Feature specification from `/specs/004-production-deploy/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable HTTPS on the production domain with automated certificate renewal. Serve frontend at `/` and backend at `/api` behind a containerized Nginx reverse proxy. Certificates are managed by an ACME/certbot companion and stored in a named Docker volume mounted at `/etc/letsencrypt`.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Backend: .NET 8 (ASP.NET Core); Frontend: Node.js/Vite + TypeScript
**Primary Dependencies**: Nginx (container), ACME/certbot companion (container), Docker Compose, ASP.NET Core, Vite
**Storage**: N/A (certificates stored in Docker volume at `/etc/letsencrypt`)
**Testing**: Backend: xUnit/NUnit (Unit/Integration folders exist); Frontend: Vitest (configured)
**Target Platform**: Linux VPS (Docker Engine); local dev on Windows
**Project Type**: Web application (frontend + backend containers)
**Performance Goals**: TLS termination with negligible overhead; stable proxying at typical VPS scale
**Constraints**: HTTPS only in production; path-based routing `/api` on single domain; automated renewal
**Scale/Scope**: Single VPS, single domain, two app containers + proxy + cert companion

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Correctness**: Requires end-to-end tests verifying HTTPS redirect and `/api` routing; plan adds quickstart and proxy configs to support.
**Code Quality**: Compose changes minimal and documented; avoid dead code.
**Documentation**: Quickstart and contracts will be produced; non-obvious proxy logic documented.
**UI Compliance**: Not a UI feature; N/A.

Gate status: PASS (no violations introduced). Re-evaluate post-design.

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: Web application structure with existing `backend/` and `frontend/` directories. Add `nginx` and `acme` services in root `docker-compose.yml`; use named volume `letsencrypt` mounted at `/etc/letsencrypt`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Containerized cert management | Unified compose orchestration | Host systemd/cron adds external dependency and manual setup |
