# Feature Specification: Production Deployment Configuration

**Feature Branch**: `004-production-deploy`  
**Created**: December 13, 2025  
**Status**: Draft  
**Input**: User description: "Enable HTTPS with automatic certificate refresh, serve on standard port 80, and configure environment-specific API endpoints for production domain"

## Clarifications

### Session 2025-12-13

- Q: How should the frontend detect whether it's running in production or development to route API requests correctly? → A: Build-time environment detection using environment variables. Different builds are created for production vs development using environment variables/build flags during npm build. Production frontend is pre-configured with the production domain.
- Q: How should SSL/TLS certificates be automatically renewed? → A: Certbot with systemd/cron. Certbot runs daily renewal checks on the VPS host system with automatic web server reload on certificate change. Certificates persist in /etc/letsencrypt/live/ across container restarts.
- Q: What port should the backend use for local development? → A: Port 5000 - the standard ASP.NET Core development port. Frontend configured with `VITE_API_BASE_URL=http://localhost:5000` in development.
- Q: What reverse proxy technology should be used for the production deployment? → A: Nginx - lightweight, fast, industry-standard for VPS deployments, integrates seamlessly with Certbot/Let's Encrypt, and provides simple configuration for frontend/backend routing.
- Q: How should API endpoints be routed - prefix-based, subdomain-based, or other approach? → A: Nginx reverse proxy on the host terminates TLS and routes `/` to the frontend container and `/api` to the .NET backend container. Keeps services independent while sharing the production domain.
- Q: Should frontend and backend share one Dockerfile/image or be built independently? → A: Two Dockerfiles/images (frontend + backend) orchestrated together; Nginx proxies to each. Keeps build contexts clean and services independent.
- Q: Should Nginx and certificate management run inside docker-compose or on the host? → A: Containerized Nginx reverse proxy with ACME/certbot companion under docker-compose for automated certificate issuance/renewal and volume-persisted certs.
- Q: Under the containerized reverse proxy, should routing use path-based `/api` on a single domain or host-based subdomains? → A: Single domain with path-based `/api` routing managed by Nginx inside docker-compose.
- Q: Where should certificates be stored within docker-compose? → A: `/etc/letsencrypt` in a named Docker volume shared between Nginx and the ACME companion.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - System Administrator Deploys Application to VPS (Priority: P1)

A system administrator needs to deploy the Trophy3D application to a VPS hosting environment. The application (frontend and backend running in separate containers) is exposed through Nginx reverse proxy. The deployment must:
- Listen for HTTPS traffic on port 443 via Nginx
- Redirect HTTP traffic on port 80 to HTTPS
- Serve frontend from the frontend container and backend API endpoints from the backend container
- Automatically maintain valid SSL/TLS certificates without manual intervention

**Why this priority**: This is the foundational requirement for production deployment. Without HTTPS and proper port configuration, the application cannot securely serve users or meet modern security standards.

**Independent Test**: The deployment can be tested independently by:
1. Accessing the application via https://giveyourcollagueatrophie.online/ and receiving the frontend application
2. Accessing the API via https://giveyourcollagueatrophie.online/api/... and receiving data from the backend
3. Attempting to access via http://giveyourcollagueatrophie.online/ and being redirected to HTTPS
4. Verifying certificate validity and auto-renewal in the next 30 days

**Acceptance Scenarios**:

1. **Given** the application is deployed on a VPS with a valid domain, **When** a user accesses the frontend via HTTPS, **Then** they receive the frontend application without security warnings
2. **Given** a user accesses the application via HTTP on port 80, **When** they make a request, **Then** they are redirected to the HTTPS version
3. **Given** an SSL certificate is 30 days from expiration, **When** the auto-renewal check runs, **Then** the certificate is successfully renewed without downtime
4. **Given** frontend and backend run in separate containers behind Nginx, **When** users access / they receive frontend assets and /api/* requests are routed to the backend, **Then** both respond over HTTPS on port 443

---

### User Story 2 - Frontend Application Sends Requests to Production Domain (Priority: P1)

The frontend application must be built differently for production and development environments. The build process uses environment variables to configure the correct API endpoint at build time. In production, the frontend is built with the production domain URL baked into the build artifacts. In development, it is built with localhost as the API endpoint.

**Why this priority**: This ensures the frontend is correctly configured for each environment at build time, preventing accidental production domain references in development and ensuring zero configuration drift. This is critical for reliable deployments and local development workflows.

**Independent Test**: The feature can be tested independently by:
1. Building the frontend with production environment variables and verifying the resulting build contains production API URLs
2. Building the frontend with development environment variables and verifying the resulting build contains localhost API URLs
3. Running production build and confirming requests go to the production domain
4. Running development build locally and confirming requests go to localhost

**Acceptance Scenarios**:

1. **Given** the frontend is built with `VITE_API_BASE_URL=https://giveyourcollagueatrophie.online`, **When** the build completes, **Then** the bundled code contains this URL and uses it for all API requests
2. **Given** the frontend is built with `VITE_API_BASE_URL=http://localhost:5000`, **When** the build completes, **Then** the bundled code contains this URL and uses it for all API requests
3. **Given** a user runs `npm run dev` in the development environment, **When** the dev server starts, **Then** it automatically uses http://localhost:5000 for API configuration
4. **Given** the frontend build is deployed to production, **When** users access the application, **Then** all API requests target https://giveyourcollagueatrophie.online without any code changes needed

---

### User Story 3 - Infrastructure Automatically Maintains Certificate Validity (Priority: P1)

Certbot must be installed and configured on the VPS to automatically renew Let's Encrypt certificates. A systemd timer or cron job runs Certbot daily to check for certificate expiration. When renewal is needed (30 days before expiration), Certbot automatically obtains the new certificate and reloads the web server, ensuring zero downtime and continuous HTTPS availability.

**Why this priority**: Without automatic renewal, the site will become inaccessible after certificate expiration, causing user-facing outages. This automation is essential for production reliability and eliminates manual administrative overhead.

**Independent Test**: The feature can be tested independently by:
1. Verifying Certbot renewal process is configured and runs daily via systemd timer/cron
2. Confirming web server (nginx/Apache) reloads automatically after certificate renewal
3. Validating that renewed certificates from /etc/letsencrypt/live/ are active and served to clients
4. Confirming certificate renewal logs show successful renewals before expiration threshold

**Acceptance Scenarios**:

1. **Given** Certbot is installed and configured on the VPS, **When** the daily renewal check runs, **Then** Certbot communicates with Let's Encrypt to verify certificate status
2. **Given** a certificate has 30 days remaining until expiration, **When** the daily renewal check runs, **Then** Certbot obtains and installs the renewed certificate
3. **Given** a certificate is renewed, **When** Certbot completes renewal, **Then** the web server reloads the new certificate and existing HTTPS connections continue without interruption
4. **Given** the application is running with persistent certificate storage, **When** containers are restarted, **Then** the most recent valid certificate from /etc/letsencrypt/live/ is used

---

### Edge Cases

- What happens if certificate renewal fails? The system should log the failure and alert administrators while continuing to serve with the existing certificate.
- What happens if the domain DNS is temporarily unavailable during renewal? The renewal process should retry with exponential backoff.
- What happens if a user accesses via the IP address directly instead of the domain? The server should either redirect to the domain or serve with an appropriate security message.
- What happens during the transition from HTTP to HTTPS? Existing session data should remain valid across the redirect.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept HTTPS connections on port 443 with a valid SSL/TLS certificate via Nginx reverse proxy
- **FR-002**: System MUST automatically redirect all HTTP traffic (port 80) to HTTPS equivalents
- **FR-003**: System MUST NOT accept unencrypted HTTP traffic for any API endpoints or authenticated requests
- **FR-004**: Frontend build process MUST accept `VITE_API_BASE_URL` environment variable to configure the API endpoint at build time
- **FR-005**: Production frontend build MUST be configured with `VITE_API_BASE_URL=https://giveyourcollagueatrophie.online` and this URL MUST be embedded in all API requests
- **FR-006**: Development frontend build/dev server MUST use `VITE_API_BASE_URL=http://localhost:5000` and this URL MUST be embedded in all API requests
- **FR-007**: Certbot MUST be installed and configured on the VPS with a daily renewal check (via systemd timer or cron job)
- **FR-008**: Certbot MUST automatically renew expiring Let's Encrypt certificates at least 30 days before expiration
- **FR-009**: Upon successful certificate renewal, Nginx MUST reload the new certificate without interrupting active HTTPS connections
- **FR-010**: Certificate files MUST be persisted in /etc/letsencrypt/live/ on the VPS host so they survive container restarts
- **FR-011**: Frontend container MUST serve the frontend application on `/` (via npm runtime or built static assets)
- **FR-012**: Backend container MUST serve API endpoints on `/api/*`
- **FR-013**: Nginx MUST route HTTPS traffic on port 443 to the frontend container for `/` and to the backend container for `/api/*`; HTTP traffic on port 80 MUST be redirected to HTTPS
- **FR-014**: Reverse proxy and certificate management MUST run as docker-compose services (containerized Nginx + ACME/certbot companion)
- **FR-015**: Certificates MUST persist via docker volumes and be automatically renewed without host-level schedulers
- **FR-016**: A named volume MUST be mounted at `/etc/letsencrypt` for both the Nginx proxy and the ACME/certbot companion to share certificate files

### Key Entities

- **SSL/TLS Certificate**: Digital certificate that encrypts traffic; has expiration date and requires periodic renewal
- **Domain Name**: giveyourcollagueatrophie.online - the public address through which users access the application
- **Environment Configuration**: Settings that determine whether the application is running in production or development context

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All user traffic to the application is encrypted with HTTPS; 100% of requests are served over secure connections
- **SC-002**: Users experience zero downtime during SSL/TLS certificate renewal
- **SC-003**: Frontend and backend services are both accessible on port 443 (standard HTTPS port) through the production domain
- **SC-004**: HTTP traffic on port 80 is successfully redirected to HTTPS with zero data loss
- **SC-005**: API requests from production frontend reach the correct backend domain; zero cross-origin or routing failures in production
- **SC-006**: Development frontend sends requests to localhost without requiring configuration changes; zero production domain references in dev requests
- **SC-007**: SSL/TLS certificate renewals occur automatically at least 30 days before expiration; zero certificates expire while in use
- **SC-008**: System security scan shows no SSL/TLS vulnerabilities (e.g., supports TLS 1.2+, has strong cipher suites)

## Assumptions

1. **Domain Registration**: The domain giveyourcollagueatrophie.online is already registered and DNS is properly configured to point to the VPS IP address
2. **Certificate Provider**: Let's Encrypt is used for SSL/TLS certificates; Certbot is the automation tool
3. **Container Orchestration**: Docker is used for deployment; frontend and backend run in separate containers orchestrated together (e.g., docker-compose)
4. **Reverse Proxy Architecture**: Nginx runs as a container managed by docker-compose to:
   - Listen on ports 80 (HTTP) and 443 (HTTPS)
   - Redirect HTTP traffic to HTTPS
   - Terminate HTTPS connections
   - Forward `/` requests to the frontend container and `/api/*` requests to the backend container
   - Reload certificates upon renewal (container reload)
5. **Certificate Management**: ACME/certbot companion runs as a container alongside Nginx to manage Let's Encrypt certificates and automate issuance/renewal
6. **Renewal Scheduling**: Renewal is handled by the ACME companion; no host-level systemd/cron is required
7. **Environment Detection**: Vite build-time environment detection using `VITE_API_BASE_URL` variable determines whether code is running in production or development
8. **Port Availability**: VPS allows inbound traffic on ports 80 and 443
9. **Certificate Persistence**: /etc/letsencrypt/live/ directory is accessible on the VPS host and persists across container restarts; Nginx reads from this directory
10. **Backend API Mounting**: The backend ASP.NET application only serves API endpoints; frontend is served separately from the frontend container
11. **Internal Container Ports**: Frontend and backend containers listen on their respective internal ports (e.g., 4173 for frontend preview/static server, 5000 for backend); Nginx forwards traffic to the appropriate port
