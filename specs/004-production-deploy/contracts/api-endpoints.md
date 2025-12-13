# Contract: API Endpoint Routing

**Date**: December 13, 2025  
**Scope**: How API requests are routed through the production deployment  
**Owned By**: Backend (ASP.NET Core) + Nginx reverse proxy

## Endpoint Routing Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Client Browser at https://giveyourcollagueatrophie.online   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS request to :443
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Nginx Reverse Proxy (port 443)                              │
│ - Terminates HTTPS connection                              │
│ - Routes all traffic to http://127.0.0.1:8080              │
└────────────┬───────────────────────────────────────────────┘
             │
             │ HTTP request to localhost:8080
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Docker Container (Trophy3D App)                             │
│ - ASP.NET Core listening on :8080                          │
│ - Serves both static files (/) and API routes (/api/*)      │
│                                                             │
│ Routes:                                                      │
│ GET  /             → index.html (React app)                │
│ GET  /static/*     → Static files (CSS, JS, images)         │
│ GET  /api/...      → API endpoints                         │
│ POST /api/...      → API endpoints                         │
└─────────────────────────────────────────────────────────────┘
```

## Production Endpoints

All endpoints are accessible via HTTPS at `https://giveyourcollagueatrophie.online`

### Frontend Routes

| Path | Type | Serves | Purpose |
|------|------|--------|---------|
| `/` | GET | `index.html` | React single-page application |
| `/index.html` | GET | HTML file | Main app file |
| `/assets/*` | GET | Static files | JavaScript, CSS, images |
| `/*` | GET | `index.html` (fallback) | SPA routing fallback |

### API Routes (Backend)

| Endpoint | Method | Port | Purpose |
|----------|--------|------|---------|
| `/api/sessions` | GET | 8080 (internal) | Fetch all sessions |
| `/api/sessions/{id}` | GET | 8080 (internal) | Fetch session by ID |
| `/api/sessions` | POST | 8080 (internal) | Create new session |
| `/api/trophies` | GET | 8080 (internal) | Fetch trophies |
| `/api/trophies/submit` | POST | 8080 (internal) | Submit trophy |
| `/health` | GET | 8080 (internal) | Health check endpoint |

**Access Method**: 
- Frontend JavaScript uses `fetch('https://giveyourcollagueatrophie.online/api/sessions')`
- URL is baked into production build via `VITE_API_BASE_URL`
- Nginx transparently routes to backend

### Example Request Flow

**Frontend making API call:**

```typescript
// Frontend code (from production build)
const API_BASE_URL = 'https://giveyourcollagueatrophie.online';
const response = await fetch(`${API_BASE_URL}/api/sessions`);
```

**Network flow:**

1. Browser sends: `GET https://giveyourcollagueatrophie.online/api/sessions`
2. HTTPS connects to `giveyourcollagueatrophie.online:443`
3. Nginx receives HTTPS request, terminates TLS
4. Nginx converts to: `GET http://127.0.0.1:8080/api/sessions`
5. Backend receives HTTP request on `:8080`
6. Backend routes `/api/sessions` to `SessionsController`
7. Response returned: `200 OK` with JSON data
8. Nginx forwards response back over HTTPS
9. Browser receives response with `Content-Type: application/json`

## CORS Configuration

### Development Mode (localhost)

CORS is **enabled** in development to allow cross-origin requests:

```csharp
// backend/src/Program.cs (Development environment)
if (app.Environment.IsDevelopment())
{
    var corsOrigins = new[] { "http://localhost:5173", "http://localhost:5000" };
    services.AddCors(options =>
    {
        options.AddPolicy("dev", builder =>
        {
            builder.WithOrigins(corsOrigins)
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
    });
    app.UseCors("dev");
}
```

**Development request flow:**

1. Frontend dev server: `http://localhost:5173`
2. Makes request to: `http://localhost:5000/api/sessions`
3. Backend checks: Origin header = `http://localhost:5173`
4. CORS policy allows it (both localhost)
5. Request succeeds

### Production Mode

CORS is **disabled** in production because:
- Frontend and backend are served from the **same origin** (`https://giveyourcollagueatrophie.online`)
- No cross-origin requests are needed
- CORS headers are not sent

**Production request flow:**

1. Frontend: `https://giveyourcollagueatrophie.online` (served from backend)
2. Makes request to: `https://giveyourcollagueatrophie.online/api/sessions`
3. **Same origin** - CORS check not needed
4. Request succeeds without CORS headers

## HTTP Status Codes

### Success Responses

```
200 OK           - Request succeeded with response body
204 No Content   - Request succeeded, no response body
```

### Client Error Responses

```
400 Bad Request       - Invalid request parameters
401 Unauthorized      - Authentication required
403 Forbidden         - User lacks permissions
404 Not Found         - Resource not found
409 Conflict          - Duplicate resource
422 Unprocessable     - Validation error
```

### Server Error Responses

```
500 Internal Server Error  - Unhandled exception in backend
502 Bad Gateway           - Nginx cannot reach backend (container down)
503 Service Unavailable   - Backend is restarting
504 Gateway Timeout       - Backend takes too long to respond
```

## Security Considerations

### HTTPS Enforcement

- All endpoints require HTTPS
- HTTP requests are redirected to HTTPS (status 301)
- No sensitive data transmitted over HTTP

### Authentication & Authorization

- All API endpoints (except `/health`) require authentication
- Credentials passed via HTTP headers or cookies (over HTTPS)
- Backend validates token/session before responding

### Request/Response Headers

**Standard request headers added by Nginx:**

```
X-Real-IP: 203.0.113.42                    # Client's real IP
X-Forwarded-For: 203.0.113.42              # Proxy chain
X-Forwarded-Proto: https                   # Original protocol
Host: giveyourcollagueatrophie.online      # Original host
```

**Standard response headers from backend:**

```
Content-Type: application/json
Content-Length: 1234
Cache-Control: no-cache
Set-Cookie: session=...; Secure; HttpOnly
```

**Security headers added by Nginx:**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Rate Limiting (Optional Future Enhancement)

Currently not implemented, but can be added in Nginx:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://app_backend;
}
```

## Testing Endpoints

### Manual Testing with cURL

```bash
# Test frontend (returns HTML)
curl -I https://giveyourcollagueatrophie.online/
# Expected: 200 OK, Content-Type: text/html

# Test API endpoint (returns JSON)
curl https://giveyourcollagueatrophie.online/api/sessions
# Expected: 200 OK, Content-Type: application/json, JSON body

# Test HTTP redirect
curl -I http://giveyourcollagueatrophie.online/
# Expected: 301 redirect to https://

# Test health endpoint
curl https://giveyourcollagueatrophie.online/health
# Expected: 200 OK with health status

# Test with headers
curl -I https://giveyourcollagueatrophie.online/ \
  -H "Accept: application/json"
```

### Automated Testing

```bash
# Health check (from container)
docker compose -f docker-compose.prod.yml exec app \
  curl http://localhost:8080/health

# API test (from host)
curl --cacert /etc/letsencrypt/live/giveyourcollagueatrophie.online/fullchain.pem \
  https://giveyourcollagueatrophie.online/api/sessions
```

## Monitoring Endpoints

### Health Check (Liveness Probe)

**Endpoint**: `GET /health`  
**Purpose**: Verify container is running and responsive  
**Response**: `200 OK` with health status  
**Used by**: Docker health check, Kubernetes liveness probe

```bash
curl http://localhost:8080/health
# Response: {"status":"healthy"}
```

### Ready Check (Readiness Probe)

**Endpoint**: `GET /ready` (if implemented)  
**Purpose**: Verify backend is ready to accept requests  
**Response**: `200 OK` if ready, `503 Service Unavailable` if not  
**Used by**: Load balancers, orchestration systems

## API Documentation

For detailed API endpoint documentation, see:
- Backend source code: `/backend/src/Controllers/`
- Swagger/OpenAPI (if enabled): `https://giveyourcollagueatrophie.online/swagger`
- API test examples: `/backend/tests/`

## Troubleshooting

| Issue | Check | Solution |
|-------|-------|----------|
| Frontend loads but API fails | CORS headers | Verify same-origin (no cross-domain) |
| 502 Bad Gateway | Backend running | `docker compose ps` + `docker compose logs app` |
| 504 Timeout | Backend slow | Check container resources, database, logs |
| 403 Unauthorized | Authentication | Verify token/session is valid |
| 301 redirect loop | Protocol detection | Check `X-Forwarded-Proto` headers in backend |
