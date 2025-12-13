# Research Phase 0: Production Deployment Investigation

**Date**: December 13, 2025  
**Purpose**: Resolve technical unknowns and identify best practices for production deployment  
**Status**: Complete

## Research Findings

### 1. Build-Time Environment Variables for Frontend (VITE_API_BASE_URL)

**Decision**: Use Vite environment variables with `.env` files  
**Rationale**: Vite natively supports environment variables prefixed with `VITE_` that are embedded at build time. This is the standard approach for React + Vite applications.

**Implementation Details**:
- Create `.env.production` with `VITE_API_BASE_URL=https://giveyourcollagueatrophie.online`
- Create `.env.development` with `VITE_API_BASE_URL=http://localhost:5000`
- Frontend code references: `import.meta.env.VITE_API_BASE_URL`
- Build step automatically inlines these values; resulting bundle is environment-specific
- Development server (`npm run dev`) reads from `.env.development` automatically
- Production build (`npm run build`) reads from `.env.production` by default

**Alternatives Considered**:
- Runtime environment detection: Would require additional API call or config fetch; adds latency
- Config file served from server: Extra round-trip; more complexity
- Docker environment variables: Would require runtime injection; defeats purpose of static builds

**Reference**: [Vite Env Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)

---

### 2. Certbot Certificate Renewal with Systemd Timer

**Decision**: Certbot on VPS host with systemd timer for daily renewal checks  
**Rationale**: Certbot is the de-facto standard for Let's Encrypt automation. Systemd timer is more reliable than cron for modern Linux systems and has better logging integration.

**Implementation Details**:
- Install certbot on VPS: `apt-get install certbot python3-certbot-nginx`
- Initial certificate: `certbot certonly --standalone -d giveyourcollagueatrophie.online`
- Nginx configuration: Reference certificate files from `/etc/letsencrypt/live/giveyourcollagueatrophie.online/`
- Automatic renewal: Certbot runs daily via systemd timer (pre-configured in certbot package)
- Renewal command: `certbot renew --quiet` (with Nginx plugin for auto-reload)
- Logs: Check with `journalctl -u certbot.service`

**Pre-Renewal Hook for Nginx**:
- Configure certbot to execute hook: Nginx must reload after renewal
- Hook script: `/etc/letsencrypt/renewal-hooks/post/nginx-reload.sh`
- Content: `#!/bin/bash` + `nginx -t && systemctl reload nginx`

**Alternatives Considered**:
- Manual renewal: Administrative overhead; high risk of downtime
- Docker-based Certbot (sidecar): Complexity of volume sharing; less reliable
- Cloud-managed certificates (AWS/DigitalOcean): Vendor lock-in; not available on generic VPS

**Reference**: [Certbot Documentation](https://certbot.eff.org/), [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)

---

### 3. Nginx Reverse Proxy Configuration

**Decision**: Nginx on VPS host (not containerized) serving as reverse proxy to application container  
**Rationale**: 
- Nginx must be on host level to manage certificates and reload on renewal
- Separating Nginx from app container allows for graceful reloads without app downtime
- Host-level Nginx can manage Docker networking seamlessly

**Configuration Structure**:
- `nginx.conf`: Main Nginx configuration
- `sites-available/giveyourcollagueatrophie.online`: Virtual host configuration
- Key directives:
  - `ssl_protocols TLSv1.2 TLSv1.3` (secure)
  - `ssl_ciphers HIGH:!aNULL:!MD5` (modern ciphers)
  - `proxy_pass http://localhost:8080` (or internal container IP:port)
  - `error_page 497 =301 https://$host$request_uri` (HTTP redirect)

**Alternatives Considered**:
- Apache: More complex; heavier; not necessary for this use case
- Caddy: Built-in automatic HTTPS; simpler config; but different ecosystem
- Traefik: Container-native; adds complexity if Nginx already familiar

**Reference**: [Nginx SSL Module](http://nginx.org/en/docs/http/ngx_http_ssl_module.html), [Certbot Nginx Plugin](https://certbot.eff.org/docs/using.html#nginx)

---

### 4. Single Container Architecture (Frontend + Backend)

**Decision**: Both frontend (static React build) and backend (ASP.NET Core) in same container  
**Rationale**: 
- ASP.NET Core can serve both static files and API routes from the same process
- Simplifies routing: no need for separate frontend service
- Reduces operational complexity on production VPS
- Standard pattern for monolithic web applications

**Implementation Approach**:
- Frontend build output (React dist folder) copied into backend Docker image
- ASP.NET Core configured to serve static files from `/wwwroot/`
- Routing: API requests to `/api/*` handled by backend controllers; other requests served as static files with fallback to `index.html` for SPA routing
- Configuration in `Program.cs`: 
  ```csharp
  app.UseStaticFiles();
  app.UseRouting();
  app.MapControllers();
  app.MapFallbackToFile("index.html");
  ```

**Alternatives Considered**:
- Separate frontend/backend containers: More complex Nginx routing; duplicate cert management
- Frontend served from separate Nginx container: Extra network hop; duplication of concerns

**Reference**: [ASP.NET Core Static Files](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files), [SPA Routing Pattern](https://learn.microsoft.com/en-us/aspnet/core/spa/angular#serve-the-spa-default-document)

---

### 5. Frontend API Base URL Configuration in Development

**Decision**: Port 5000 for local ASP.NET Core development server  
**Rationale**: 
- ASP.NET Core defaults to HTTPS on port 5001 and HTTP on port 5000 in development
- Frontend Vite dev server runs on separate port (typically 5173)
- CORS will be configured to allow frontend (localhost:5173) to access backend (localhost:5000)
- Matches existing development workflow expectations

**CORS Configuration** (in ASP.NET Core Program.cs):
```csharp
var allowedOrigins = new[] { "http://localhost:5173", "http://localhost:5000" };
services.AddCors(options => {
    options.AddPolicy("dev", builder => {
        builder.WithOrigins(allowedOrigins)
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```

**Development Setup**:
- Terminal 1: `cd backend && dotnet run` (runs on localhost:5000)
- Terminal 2: `cd frontend && npm run dev` (runs on localhost:5173)
- Frontend API calls target `http://localhost:5000/api/...`

**Alternatives Considered**:
- Port 3000: Common for Node.js; confusing with different runtimes
- Port 8080: Generic; less conventional for .NET

**Reference**: [ASP.NET Core Default URLs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel#https), [CORS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors)

---

### 6. Docker Compose for Production Deployment

**Decision**: Custom `docker-compose.prod.yml` for production orchestration  
**Rationale**: 
- Allows version-controlled, reproducible deployments
- Simplifies container startup, networking, and volume management
- Environment variables can be managed via `.env.prod` file
- Industry standard for multi-container deployments

**Configuration Structure**:
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: ./backend/Dockerfile
      args:
        FRONTEND_BUILD: true  # Signal to include frontend build
    ports:
      - "8080:8080"  # Internal container port
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:8080
    volumes:
      - ./frontend/dist:/app/wwwroot  # Bind frontend build output
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Alternatives Considered**:
- Kubernetes: Overkill for single VPS deployment; significant operational overhead
- Manual Docker commands: Error-prone; harder to version control
- Systemd services: Less declarative; harder to manage dependencies

**Reference**: [Docker Compose Documentation](https://docs.docker.com/compose/)

---

### 7. Certificate Storage and Persistence

**Decision**: Host-level `/etc/letsencrypt/live/` directory with Docker volume mount  
**Rationale**: 
- Certificates must survive container restarts
- Certbot manages certificates at host level; safer to leave there
- Nginx reads from same location; single source of truth
- Standard Let's Encrypt directory structure; widely understood

**Volume Mounting Strategy**:
```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro  # Read-only mount for certs in Nginx
  - /etc/letsencrypt/live:/app/certs:ro   # Alternative: app container access if needed
```

**Nginx Configuration**:
```nginx
ssl_certificate /etc/letsencrypt/live/giveyourcollagueatrophie.online/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/giveyourcollagueatrophie.online/privkey.pem;
```

**Backup Strategy**: Recommend backing up `/etc/letsencrypt/` to secure storage (S3, encrypted drive, etc.)

**Alternatives Considered**:
- Docker named volume: Harder to backup; less transparent
- Copy certs into container at build time: Defeats purpose of auto-renewal

**Reference**: [Certbot File Permissions](https://certbot.eff.org/docs/using.html#best-practices)

---

### 8. HTTP to HTTPS Redirect

**Decision**: Nginx error_page 497 redirect (most elegant HTTP → HTTPS redirect)  
**Rationale**: 
- Port 80 (HTTP) requests to Nginx result in error 497 (HTTP Request Received on HTTPS Port)
- Redirect users to HTTPS equivalent with zero data loss
- Session cookies automatically preserved (flagged as secure after redirect)
- Single directive in Nginx config; no extra middleware needed

**Nginx Configuration**:
```nginx
error_page 497 =301 https://$host$request_uri;
```

**How It Works**:
1. User requests `http://giveyourcollagueatrophie.online/`
2. Nginx receives on port 80, tries to match SSL rules
3. Returns 497 error
4. Error handler redirects to `https://giveyourcollagueatrophie.online/`
5. Browser follows redirect with GET request

**Alternatives Considered**:
- Redirect server block: Extra config; same result
- Return 301 in default location: Less elegant; requires more routing logic
- HTTP Strict-Transport-Security (HSTS): Good complement; not replacement for redirect

**Reference**: [Nginx Error Pages](http://nginx.org/en/docs/http/ngx_http_core_module.html#error_page)

---

### 9. Security Best Practices

**Decision**: TLS 1.2+, modern cipher suites, HSTS, OCSP stapling  
**Rationale**: 
- TLS 1.0/1.1 deprecated; TLS 1.2 minimum for production
- Strong cipher suites prevent known attacks (BEAST, RC4, etc.)
- HSTS tells browsers to always use HTTPS (prevents downgrade attacks)
- OCSP stapling improves certificate validation performance

**Nginx Security Configuration**:
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4;
```

**Testing**: Use [SSL Labs](https://www.ssllabs.com/ssltest/) to verify configuration (target: A+ grade)

**Alternatives Considered**: None; these are industry standards.

**Reference**: [OWASP TLS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)

---

### 10. Deployment Checklist and Testing

**Decision**: Manual deployment checklist + automated test suite  
**Rationale**: 
- Production deployments require verification at each step
- Automated tests ensure repeatability and catch regressions
- Manual checklist catches environment-specific issues

**Pre-Deployment Checklist**:
- [ ] Domain DNS resolves to VPS IP
- [ ] VPS ports 80/443 are open and forwarding
- [ ] SSH access to VPS confirmed
- [ ] Docker and Docker Compose installed on VPS
- [ ] `giveyourcollagueatrophie.online` is a valid domain with proper registration
- [ ] Let's Encrypt rate limits are understood (50 per week per domain)

**Testing After Deployment**:
- [ ] `https://giveyourcollagueatrophie.online/` loads (frontend appears)
- [ ] `https://giveyourcollagueatrophie.online/api/sessions` returns data (backend works)
- [ ] `http://giveyourcollagueatrophie.online/` redirects to HTTPS
- [ ] `curl -I https://giveyourcollagueatrophie.online` shows valid certificate
- [ ] `openssl s_client -connect giveyourcollagueatrophie.online:443` shows TLS 1.2+
- [ ] SSL Labs test shows A+ rating
- [ ] Certificate expiration date is correct

**Certificate Renewal Testing**:
- [ ] Run manual renewal: `certbot renew --dry-run`
- [ ] Check logs: `journalctl -u certbot.timer`
- [ ] Verify Nginx reload: `systemctl status nginx`

**Alternatives Considered**: None; comprehensive testing is required for production.

---

## Summary

All critical unknowns have been resolved:
- ✅ Frontend configuration: Vite `VITE_API_BASE_URL` environment variables
- ✅ Certificate renewal: Certbot with systemd timer on VPS host
- ✅ Reverse proxy: Nginx on VPS host
- ✅ Application architecture: Single container with frontend + backend
- ✅ Development port: localhost:5000 for ASP.NET Core
- ✅ Docker orchestration: docker-compose.prod.yml for deployment
- ✅ Certificate persistence: Host-level /etc/letsencrypt/ with volume mount
- ✅ HTTP → HTTPS: Nginx error_page 497 redirect
- ✅ Security: TLS 1.2+, modern ciphers, HSTS
- ✅ Testing: Pre-deployment checklist + post-deployment verification

**Ready for Phase 1: Design & Contracts**
