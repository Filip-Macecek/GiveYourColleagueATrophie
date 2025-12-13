# Data Model: Production Deployment Configuration

**Date**: December 13, 2025  
**Purpose**: Define entities, data structures, and system configurations  
**Phase**: Phase 1 - Design & Contracts

## Overview

This feature introduces no new data entities or database models. Instead, it defines configuration entities and infrastructure contracts that govern how the system communicates, deploys, and renews certificates.

## Configuration Entities

### 1. Environment Configuration

**Purpose**: Determine API endpoint behavior based on deployment context  
**Scope**: Application startup; affects all API calls throughout application lifetime

#### Production Environment
```
{
  name: "production",
  api_base_url: "https://giveyourcollagueatrophie.online",
  deployment_target: "vps",
  certificate_domain: "giveyourcollagueatrophie.online",
  https_enabled: true,
  origin: "https://giveyourcollagueatrophie.online"
}
```
**Source**: Baked into frontend build via `VITE_API_BASE_URL` environment variable  
**Validation**: URL must be HTTPS and match configured domain  
**Lifecycle**: Set at build time; immutable at runtime

#### Development Environment
```
{
  name: "development",
  api_base_url: "http://localhost:5000",
  deployment_target: "local",
  certificate_domain: null,
  https_enabled: false,
  origin: "http://localhost:5173"
}
```
**Source**: Read from `.env.development` by Vite dev server  
**Validation**: Localhost only; HTTP allowed in dev  
**Lifecycle**: Set at dev server startup; mutable via .env file

### 2. SSL/TLS Certificate Entity

**Purpose**: Represent digital certificate lifecycle and renewal status  
**Persistence**: Files on VPS host at `/etc/letsencrypt/live/{domain}/`

```
{
  domain: "giveyourcollagueatrophie.online",
  issuer: "Let's Encrypt",
  issued_date: <timestamp>,
  expiration_date: <timestamp>,
  renewal_window_days: 30,
  files: {
    fullchain: "/etc/letsencrypt/live/giveyourcollagueatrophie.online/fullchain.pem",
    privkey: "/etc/letsencrypt/live/giveyourcollagueatrophie.online/privkey.pem"
  },
  status: "valid" | "expiring_soon" | "expired",
  auto_renewal_enabled: true,
  renewal_frequency: "daily"
}
```

**State Transitions**:
```
[Initial Setup] 
  → certbot certonly → [valid]
  → (certificate valid)
  → [30 days before expiry]
  → certbot renew → [valid] (new cert installed)
  → (expiration passes)
  → [expired] (alert admin)
```

**Renewal Logic**:
- Daily check: Certbot runs at scheduled time (default: 02:00 UTC)
- Trigger: If `now > (expiration_date - 30 days)`
- Action: Obtain new certificate from Let's Encrypt
- Verification: `certbot certificates` lists valid cert with new expiration
- Reload: Nginx reloads to use new certificate files

### 3. Nginx Reverse Proxy Configuration

**Purpose**: Route traffic, handle HTTPS termination, manage certificates  
**Location**: `/etc/nginx/sites-available/giveyourcollagueatrophie.online` on VPS

```yaml
upstream app {
  server localhost:8080;  # Container's internal port
}

# HTTP server - redirect all to HTTPS
server {
  listen 80;
  listen [::]:80;
  server_name giveyourcollagueatrophie.online;
  
  # ACME challenge for certificate renewal (must be accessible via HTTP)
  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }
  
  # Redirect all other traffic to HTTPS
  location / {
    error_page 497 =301 https://$host$request_uri;
    proxy_pass http://app;
  }
}

# HTTPS server - main application
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name giveyourcollagueatrophie.online;
  
  # SSL Certificate paths (managed by Certbot)
  ssl_certificate /etc/letsencrypt/live/giveyourcollagueatrophie.online/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/giveyourcollagueatrophie.online/privkey.pem;
  
  # SSL Configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;
  
  # Security headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  
  # Application routes
  location / {
    proxy_pass http://app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

**Key Properties**:
- **HTTP listener (port 80)**: Accepts HTTP requests, allows ACME validation, redirects to HTTPS
- **HTTPS listener (port 443)**: Serves all application traffic over encrypted connection
- **Upstream definition**: Routes traffic to app container running on internal port 8080
- **Certificate paths**: Reference Certbot-managed files (automatically updated on renewal)
- **Security headers**: Prevent common attacks (clickjacking, content sniffing, etc.)

### 4. Docker Container Configuration

**Purpose**: Define application container that serves both frontend and backend  
**Build artifact**: Single container image with both React build and ASP.NET Core application

#### Dockerfile (backend/Dockerfile)
```dockerfile
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# Stage 2: Build backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app
COPY backend/backend.csproj ./
RUN dotnet restore
COPY backend .
RUN dotnet build -c Release

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=backend-build /app/bin/Release/net8.0 .
COPY --from=frontend-build /frontend/dist ./wwwroot

# Configure ASP.NET to serve on port 8080
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "backend.dll"]
```

**Key Design Decisions**:
- **Multi-stage build**: Reduces final image size by excluding build dependencies
- **Frontend copied to wwwroot**: ASP.NET serves static React files from this directory
- **Port 8080**: Internal port (Nginx forwards external 443 → internal 8080)
- **ASPNETCORE_URLS**: Configured via environment variable for flexibility

#### Docker Compose (docker-compose.prod.yml)
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: ./backend/Dockerfile
    container_name: trophy3d-app
    ports:
      - "8080:8080"  # Internal port (Nginx reverse proxy uses this)
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:8080
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app-network:
    driver: bridge
```

### 5. Certbot Renewal Configuration

**Purpose**: Automate Let's Encrypt certificate renewal  
**Execution**: Daily systemd timer (installed with certbot package)

#### Initial Certificate Request
```bash
certbot certonly \
  --standalone \
  -d giveyourcollagueatrophie.online \
  --agree-tos \
  --email admin@giveyourcollagueatrophie.online
```

**Certificate Storage**:
- Path: `/etc/letsencrypt/live/giveyourcollagueatrophie.online/`
- Files:
  - `fullchain.pem` - Full certificate chain (cert + intermediates)
  - `privkey.pem` - Private key (keep secure; mounted read-only)
  - `cert.pem` - End entity certificate only
  - `chain.pem` - Intermediate certificates

#### Renewal Configuration
**File**: `/etc/letsencrypt/renewal/giveyourcollagueatrophie.online.conf`
```
[giveyourcollagueatrophie.online]
version = 2.4.0
cert = /etc/letsencrypt/live/giveyourcollagueatrophie.online/cert.pem
privkey = /etc/letsencrypt/live/giveyourcollagueatrophie.online/privkey.pem
chain = /etc/letsencrypt/live/giveyourcollagueatrophie.online/chain.pem
fullchain = /etc/letsencrypt/live/giveyourcollagueatrophie.online/fullchain.pem
account = [account-id]
authenticator = nginx
server = https://acme-v02.api.letsencrypt.org/directory
```

#### Post-Renewal Hook
**File**: `/etc/letsencrypt/renewal-hooks/post/nginx-reload.sh`
```bash
#!/bin/bash
echo "Reloading nginx after certificate renewal..."
nginx -t && systemctl reload nginx
echo "Certificate renewal complete"
```

**Execution**: Automatically called by Certbot after successful renewal

#### Systemd Timer Schedule
**File**: `/etc/systemd/system/certbot.timer` (pre-installed with certbot)
```
[Unit]
Description=Run certbot twice daily

[Timer]
OnCalendar=*-*-* 00,12:00:00
Persistent=true

[Install]
WantedBy=timers.target
```
**Behavior**: Runs daily at 00:00 UTC and 12:00 UTC; actual renewal only triggers if cert expires within 30 days

## Data Validation Rules

### Frontend API URL Validation
- **Production**: Must be HTTPS, valid domain, matches `giveyourcollagueatrophie.online`
- **Development**: Must be HTTP or HTTPS, localhost or 127.0.0.1, with valid port

### Certificate Validation
- **Expiration**: Must not be in the past
- **Renewal window**: Alert when 30 days or less remain
- **Issuer**: Must be Let's Encrypt (trusted CA)

### Environment Variable Validation
- **VITE_API_BASE_URL**: Must be a valid, absolute URL (not relative)
- **ASPNETCORE_ENVIRONMENT**: Must be "Development", "Staging", or "Production"

## Relationships

```
┌─────────────────────────┐
│  Environment            │
│  Configuration          │
├─────────────────────────┤
│ - name: prod|dev        │
│ - api_base_url          │◄──┐
│ - https_enabled         │   │
│ - deployment_target     │   │ influences
└─────────────────────────┘   │
                              │
                    ┌─────────┴──────────────┐
                    │                        │
        ┌───────────────────────┐  ┌────────────────────┐
        │ SSL/TLS Certificate   │  │ Nginx Configuration│
        ├───────────────────────┤  ├────────────────────┤
        │ - domain              │  │ - server_name      │
        │ - expiration_date     │  │ - ssl_certificate  │
        │ - renewal_window_days │  │ - ssl_certificate_ │
        │ - files               │  │   key              │
        │ - status              │  │ - upstream.server  │
        └───────────────────────┘  └────────────────────┘
                  │                           │
                  │ managed by               │ references
                  │                           │
        ┌─────────▼───────────────────────────▼────┐
        │  Certbot Renewal Process                 │
        ├──────────────────────────────────────────┤
        │ - renewal_check: daily via systemd timer │
        │ - trigger: expiration_date - 30 days     │
        │ - action: obtain new cert from ACME      │
        │ - verification: cert validity check      │
        │ - reload: execute post-renewal hook      │
        │ - post_hook: nginx -t && reload nginx    │
        └──────────────────────────────────────────┘
                         │
                         │ updates
                         ▼
        ┌──────────────────────────────┐
        │ Docker Container             │
        │ (Frontend + Backend)         │
        ├──────────────────────────────┤
        │ - port: 8080 (internal)      │
        │ - environment: Production    │
        │ - wwwroot: static files      │
        │ - /api/*: backend routes     │
        └──────────────────────────────┘
```

## Summary

The data model for production deployment consists of:
1. **Environment Configuration** - Determines API endpoint at build/startup time
2. **SSL/TLS Certificate** - Managed by Certbot with automatic renewal
3. **Nginx Configuration** - Routes traffic, terminates HTTPS, manages redirects
4. **Docker Container** - Single image serving frontend static files + backend API
5. **Certbot Renewal** - Automates certificate lifecycle with systemd timer

No database models are added or modified. All configuration is file-based and managed through standard Linux tools (Certbot, Nginx, Docker, systemd).
