# Implementation Plan: Production Deployment Configuration

**Branch**: `004-production-deploy` | **Date**: December 13, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-production-deploy/spec.md`

## Summary

Enable HTTPS on a VPS deployment with automatic certificate renewal via Certbot. Configure environment-specific API endpoints for the frontend using build-time environment variables (VITE_API_BASE_URL). Run frontend and backend in a single application container, with Nginx as a reverse proxy handling HTTPS termination, HTTP-to-HTTPS redirects, and SSL/TLS certificate management. Production domain: https://giveyourcollagueatrophie.online. Development uses localhost:5000 with Vite dev server configuration.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), C# .NET 8.0 (backend)  
**Primary Dependencies**: 
- Frontend: Vite, React, TypeScript, vitest (existing)
- Backend: ASP.NET Core 8.0 (existing)
- Infrastructure: Nginx, Certbot, Let's Encrypt, Docker

**Storage**: N/A (configuration-only feature)  
**Testing**: 
- Frontend: vitest (existing) - verify VITE_API_BASE_URL configuration in builds
- Backend: xUnit (existing) - verify API endpoints accessible on correct paths
- Integration: Manual HTTPS validation, certificate renewal testing

**Target Platform**: Linux VPS (production); local development machine (dev)
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Zero downtime during certificate renewal; instant HTTP-to-HTTPS redirect; <100ms API response time (no change)  
**Constraints**: 
- Zero downtime deployment requirement
- Certificate auto-renewal must complete before expiration
- Production domain must be accessible within 24 hours of deployment

**Scale/Scope**: 
- Single domain deployment
- ~2 containers (Nginx reverse proxy on host + 1 app container)
- ~500 lines of infrastructure code (Nginx config, docker-compose updates, Certbot setup scripts)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **Correctness Gate**: 
- Primary workflow: Deploy application, access via HTTPS, certificate auto-renews → TESTABLE
- Tests required: SSL/TLS connectivity test, HTTP redirect test, certificate renewal verification
- Error handling: Certificate renewal failures logged with admin alert; existing cert continues serving

✅ **Code Quality Gate**: 
- Nginx configs will be clear, documented, follow best practices
- Docker setup will be organized and maintainable
- No dead code or magic values

✅ **Documentation Gate**: 
- Deployment guide required (quickstart.md)
- Nginx configuration documented
- Certificate renewal process documented
- Environment variable setup documented

✅ **UI Compliance Gate**: 
- N/A for infrastructure feature (no user-facing UI changes)
- Backend/frontend API remains humorous/over-the-top; no changes needed

✅ **All gates passable** - Feature is infrastructural and does not conflict with any constitution principles

## Project Structure

### Documentation (this feature)

```text
specs/004-production-deploy/
├── plan.md                      # This file
├── spec.md                      # Feature specification
├── research.md                  # Phase 0 output - Research findings ✅ COMPLETE
├── data-model.md                # Phase 1 output - Entity & config definitions ✅ COMPLETE
├── quickstart.md                # Phase 1 output - Step-by-step deployment guide ✅ COMPLETE
├── contracts/                   # Phase 1 output - Interface contracts ✅ COMPLETE
│   ├── environment-variables.md # VITE_API_BASE_URL and .env files
│   ├── infrastructure.md        # VPS setup, Nginx, Certbot, Docker
│   └── api-endpoints.md         # Routing, CORS, API contract
└── tasks.md                     # Phase 2 output (generated later) - PENDING
```

### Source Code (repository root)

```text
# Existing structure (no changes to file organization)
backend/
├── src/
│   ├── Program.cs              # MODIFY: Configure static file serving for frontend
│   ├── Controllers/
│   │   └── [existing controllers]
│   ├── Services/
│   └── Models/
└── Dockerfile                  # MODIFY: Ensure build includes frontend static files

frontend/
├── src/                        # Existing React source
├── Dockerfile                  # REVIEW: May need adjustments for single-container build
├── .env.production             # ADD: Production environment file with VITE_API_BASE_URL
├── .env.development            # ADD: Development environment file with VITE_API_BASE_URL
└── vite.config.ts             # REVIEW: Ensure env variables are loaded

# New infrastructure files (root level)
docker-compose.prod.yml         # ADD: Production docker-compose configuration
nginx.prod.conf                 # ADD: Production Nginx configuration (template)
certbot-renewal.sh              # ADD: Certbot renewal script for systemd timer
README.deploy.md                # ADD: Production deployment guide (alias for quickstart.md)
```

**Structure Decision**: The existing two-service architecture (frontend + backend) will be unified into a single container deployment where:
1. Backend (ASP.NET Core) serves its `/api/` endpoints 
2. Backend also serves frontend static files from a configured static directory
3. Nginx reverse proxy (host-level) handles HTTPS termination and forwarding
4. Certbot (host-level) handles automatic certificate renewal

This keeps existing source code structure intact while adding infrastructure configuration files at the repository root level.

## Phase 0: Research ✅ COMPLETE

**Output**: `research.md`

Research completed covering all 10 critical unknowns:
1. ✅ Frontend configuration (Vite VITE_API_BASE_URL environment variables)
2. ✅ Certificate renewal (Certbot with systemd timer)
3. ✅ Reverse proxy (Nginx on VPS host)
4. ✅ Application architecture (Single container, frontend + backend)
5. ✅ Development port (localhost:5000)
6. ✅ Docker Compose orchestration
7. ✅ Certificate storage & persistence
8. ✅ HTTP → HTTPS redirect mechanism
9. ✅ Security best practices
10. ✅ Deployment testing approach

All decisions documented with rationale and alternatives considered.

## Phase 1: Design & Contracts ✅ COMPLETE

### Design Artifacts Generated

**1. Data Model** (`data-model.md`)
- Environment Configuration entity (prod vs dev)
- SSL/TLS Certificate lifecycle and state machine
- Nginx Reverse Proxy configuration structure
- Docker Container (multi-stage Dockerfile)
- Certbot Renewal Configuration
- Data validation rules
- Entity relationships diagram

**2. API Contracts** (`contracts/`)

**environment-variables.md**:
- `VITE_API_BASE_URL` binding and usage
- Frontend `.env.production` and `.env.development`
- Backend `ASPNETCORE_ENVIRONMENT` and `ASPNETCORE_URLS`
- CORS configuration for dev vs production
- Static file serving configuration
- Build output verification
- Runtime environment detection
- Validation & testing procedures

**infrastructure.md**:
- VPS requirements (hardware, OS, software)
- Prerequisites installation steps
- Domain & DNS configuration
- Let's Encrypt certificate request procedure
- Certificate file locations and renewal setup
- Nginx reverse proxy configuration (complete)
- Nginx deployment steps
- Docker Compose file structure
- Firewall configuration (UFW)
- Monitoring & maintenance procedures
- Security checklist
- Disaster recovery procedures

**api-endpoints.md**:
- Endpoint routing architecture (diagram)
- Production endpoint list
- API routes (all backend endpoints)
- Example request flow
- CORS configuration (dev vs production)
- HTTP status codes
- Security considerations (HTTPS enforcement, auth, headers)
- Rate limiting (future enhancement note)
- Manual testing procedures (cURL examples)
- Automated testing procedures
- Health check endpoints
- Troubleshooting guide

**3. Quickstart Guide** (`quickstart.md`)
- Phase 1: Install prerequisites (Docker, Nginx, Certbot) - 20 min
- Phase 2: Clone repository & configure - 15 min
- Phase 3: Obtain SSL/TLS certificate - 10 min
- Phase 4: Configure Nginx reverse proxy - 15 min
- Phase 5: Build & deploy container - 20 min
- Phase 6: Verification & testing - 15 min
- Phase 7: Post-deployment configuration - 10 min
- Maintenance & updates procedures
- Troubleshooting guide with common issues
- Disaster recovery steps
- Security checklist

**Total estimated time for full deployment**: 1-2 hours initial setup, 10 minutes for updates

### Design Decisions Locked In

✅ **Frontend Configuration**: Build-time `VITE_API_BASE_URL` environment variable  
✅ **Certificate Management**: Certbot on VPS host with systemd timer, daily renewal checks  
✅ **Reverse Proxy**: Nginx on VPS host (not containerized)  
✅ **Application Container**: Single container with frontend static files + backend API  
✅ **Development Backend Port**: 5000 (ASP.NET Core standard)  
✅ **Production Domain**: https://giveyourcollagueatrophie.online  
✅ **HTTPS Enforcement**: HTTP redirects to HTTPS via Nginx error_page 497  
✅ **Certificate Persistence**: /etc/letsencrypt/live/ on VPS host with volume mount  
✅ **API Routing**: Same-origin (no subdomain/port routing needed)  
✅ **Security**: TLS 1.2+, strong ciphers, HSTS, security headers  

## Phase 2: Implementation Planning (PENDING)

Next phase will generate `/speckit.tasks` which will detail:
- Specific code changes required in Program.cs
- Dockerfile modifications for multi-stage build
- .env.production and .env.development creation
- Backend static file serving configuration
- CORS configuration for development mode
- Frontend build verification tests
- Backend API endpoint verification tests
- Integration tests for HTTPS/redirect behavior
- Docker Compose production setup
- Nginx configuration deployment
- Certbot certificate request and renewal
- Deployment checklist validation
- Post-deployment smoke tests

---

## Constitution Re-Check (Post-Phase 1)

Re-validating all constitutional gates after design completion:

✅ **Correctness Gate**: 
- Happy path: Deploy → access HTTPS → certificate auto-renews → ✅ TESTABLE
- Tests required: HTTPS connectivity, HTTP redirect, cert renewal verification
- Error handling: Certificate renewal failures logged; existing cert continues

✅ **Code Quality Gate**: 
- Nginx configs clear, documented, follow industry best practices
- Docker multi-stage build optimized and maintainable
- .env files are git-safe (no secrets hardcoded)
- No dead code or magic values in infrastructure files

✅ **Documentation Gate**: 
- ✅ Design specs complete (data-model.md, 3 contracts)
- ✅ Quickstart with 7 phases and full procedures
- ✅ Inline comments in configs explaining choices
- ✅ Troubleshooting guide for common issues

✅ **UI Compliance Gate**: 
- N/A for infrastructure feature
- No user-facing UI changes; existing humor/flamboyance preserved

**Gate Status**: ✅ ALL GATES PASS - Ready for Phase 2 task generation

---

## Deployment Timeline

| Phase | Duration | Status | Output |
|-------|----------|--------|--------|
| Phase 0: Research | 2 hours | ✅ COMPLETE | research.md |
| Phase 1: Design & Contracts | 3 hours | ✅ COMPLETE | data-model.md, 3 contracts, quickstart.md |
| Phase 2: Task Generation | 1 hour | ⏳ NEXT | tasks.md with implementation checklist |
| Implementation | 4-6 hours | 📋 READY | Code changes, docker files, configs |
| Testing & QA | 2-3 hours | 📋 READY | HTTPS validation, cert renewal, security audit |
| Deployment | 1-2 hours | 📋 READY | VPS setup, container deployment, verification |
| **Total Project** | **13-17 hours** | ✅ PLANNED | Full production deployment |

---

## Success Criteria Mapping

Each success criterion maps to deliverables:

| Success Criterion | Verified By | Deliverable |
|------------------|------------|-------------|
| SC-001: 100% HTTPS encryption | quickstart §6.2, §6.4 | HTTPS verification tests |
| SC-002: Zero downtime renewal | research §2, data-model §5 | Certbot hook configuration |
| SC-003: Port 443 accessibility | quickstart §6.2, §6.3 | Docker + Nginx config |
| SC-004: Zero data loss on redirects | research §8, api-endpoints | 301 redirect + session persistence |
| SC-005: Zero routing failures in production | contracts/api-endpoints.md | API routing diagram |
| SC-006: Dev uses localhost only | contracts/environment-variables.md | .env.development + CORS |
| SC-007: Auto renewal before expiration | research §2, quickstart §7 | Certbot systemd timer |
| SC-008: No SSL/TLS vulnerabilities | research §9, infrastructure.md | TLS 1.2+, strong ciphers |

---

## Next Command

```
/speckit.tasks
```

This will generate Phase 2 task breakdown with specific implementation steps, code changes, and testing procedures.
