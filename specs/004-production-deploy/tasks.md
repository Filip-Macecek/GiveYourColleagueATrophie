---

description: "Task list for 004-production-deploy"
---

# Tasks: Production Deployment Configuration

**Input**: Design documents from `/specs/004-production-deploy/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested; omit test tasks unless later required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish production deployment scaffolding and configuration placeholders.

- [X] T001 Create production compose scaffold with service stubs in docker-compose.prod.yml
- [X] T002 [P] Add production env sample with domain/email defaults in .env.prod.example
- [X] T003 [P] Create nginx config directory and placeholder file at nginx/production.conf

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core compose wiring and container definitions that all stories depend on.

- [X] T004 Define shared docker networks and letsencrypt volume in docker-compose.prod.yml
- [X] T005 [P] Configure backend service (image/build, port 5000->internal, healthcheck) in docker-compose.prod.yml
- [X] T006 [P] Configure frontend service build and expose static output in docker-compose.prod.yml

**Checkpoint**: Foundation ready—proxy, env, and services are scaffolded for story work.

---

## Phase 3: User Story 1 - System Administrator Deploys Application to VPS (Priority: P1) 🎯 MVP

**Goal**: Serve frontend at `/` and backend at `/api` over HTTPS on ports 80/443 via Nginx reverse proxy in Docker Compose.

**Independent Test**:
- HTTPS https://giveyourcollagueatrophie.online/ returns frontend without warnings
- HTTPS https://giveyourcollagueatrophie.online/api/... proxies to backend responses
- HTTP http://giveyourcollagueatrophie.online/ redirects to HTTPS
- Certificates load from shared volume without manual steps

### Implementation for User Story 1

- [X] T007 [P] [US1] Author Nginx reverse proxy config with `/`→frontend and `/api`→backend, HTTPS redirect, and headers in nginx/production.conf
- [X] T008 [US1] Wire nginx service in docker-compose.prod.yml (ports 80/443, mounts nginx/production.conf, depends_on frontend/backend)
- [X] T009 [US1] Document production proxy run/verify steps (curl HTTPS, HTTP redirect, /api) in specs/004-production-deploy/quickstart.md

**Checkpoint**: Reverse proxy serves both frontend and backend over HTTPS with HTTP redirect.

---

## Phase 4: User Story 2 - Frontend Application Sends Requests to Production Domain (Priority: P1)

**Goal**: Frontend builds embed correct API base URL per environment using Vite env files.

**Independent Test**:
- Production build embeds https://giveyourcollagueatrophie.online in bundled API URLs
- Development build/dev server uses http://localhost:5000
- Dev server requests hit localhost backend; production bundle targets production domain

### Implementation for User Story 2

- [X] T010 [P] [US2] Add frontend/.env.production with VITE_API_BASE_URL=https://giveyourcollagueatrophie.online
- [X] T011 [P] [US2] Verify/update frontend/.env.development to ensure VITE_API_BASE_URL=http://localhost:5000
- [X] T012 [US2] Configure frontend service in docker-compose.prod.yml to consume .env.production (env_file/build args) during build
- [X] T013 [US2] Document build verification (grep dist for production URL, dev server target) in specs/004-production-deploy/quickstart.md

**Checkpoint**: Frontend builds pick correct API endpoints for prod vs dev without code changes.

---

## Phase 5: User Story 3 - Infrastructure Automatically Maintains Certificate Validity (Priority: P1)

**Goal**: ACME/certbot companion automates issuance and renewal with shared volume; Nginx reloads on renewal.

**Independent Test**:
- ACME/cert companion runs with domain/email env vars
- letsencrypt volume shared with nginx; cert files present
- Renewal logs show successful renew; Nginx reloads without downtime

### Implementation for User Story 3

- [X] T014 [P] [US3] Add acme/certbot companion service (image, env: DOMAIN, EMAIL) with letsencrypt volume in docker-compose.prod.yml
- [X] T015 [US3] Mount letsencrypt volume into nginx service and ensure cert paths match nginx/production.conf
- [X] T016 [US3] Document renewal validation and log commands (docker compose logs acme, dry-run) in specs/004-production-deploy/quickstart.md

**Checkpoint**: Certificates auto-issue/renew via companion and are reloaded by Nginx.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, docs, and validation.

- [X] T017 [P] Add TLS/security verification checklist (SSL Labs, curl -I, openssl s_client) to specs/004-production-deploy/quickstart.md
- [X] T018 Add release note and deployment steps summary to IMPLEMENTATION_SUMMARY.md for production deploy

---

## Dependencies & Execution Order

- Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) → Polish (Phase 6)
- User stories are all P1; implement sequentially for MVP stability, then parallelize US2/US3 after US1 if needed.

## Parallel Execution Examples

- Within US1: T007 and T009 can proceed in parallel with T008 once nginx service stub exists.
- Within US2: T010 and T011 can run in parallel; T012 depends on env files; T013 can follow builds.
- Within US3: T014 and T015 can proceed in parallel; T016 can run after services are defined.
- Cross-story: After Foundational, different owners can work US2 and US3 in parallel once US1 proxy baseline is stable.

## Implementation Strategy

- MVP first: Complete Setup + Foundational + US1 to deliver HTTPS reverse proxy with routing; validate independently.
- Incremental delivery: Add US2 (correct API URLs) and US3 (auto-renewal) as subsequent increments, validating each story via its independent tests.
- Keep tasks [P] parallel where files/configs do not overlap; serialize edits to docker-compose.prod.yml when needed to avoid conflicts.
