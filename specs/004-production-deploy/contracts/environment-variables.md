# Contract: Environment Variables & Configuration

**Date**: December 13, 2025  
**Scope**: API endpoint configuration for production and development environments  
**Owned By**: Frontend build system (Vite) + Backend configuration (ASP.NET Core)

## Frontend API Base URL Contract

### Environment Variable: `VITE_API_BASE_URL`

**Purpose**: Configure the base URL for all API requests made by the frontend  
**Binding Time**: Build time (compiled into JavaScript bundle)  
**Modification**: Requires rebuild to change

#### Production Build
```
VITE_API_BASE_URL=https://giveyourcollagueatrophie.online
```

**Usage in Code**:
```typescript
// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchSessions = async () => {
  const response = await fetch(`${API_BASE_URL}/api/sessions`);
  return response.json();
};
```

**Resulting URLs in Production Build**:
- Embedded URL: `https://giveyourcollagueatrophie.online`
- Example API calls:
  - `https://giveyourcollagueatrophie.online/api/sessions`
  - `https://giveyourcollagueatrophie.online/api/trophies`
  - `https://giveyourcollagueatrophie.online/api/submit-trophy`

#### Development Build / Dev Server
```
VITE_API_BASE_URL=http://localhost:5000
```

**Usage in Development**:
```bash
cd frontend
npm run dev
# Vite reads from .env.development automatically
# Development server runs on http://localhost:5173
# API calls target http://localhost:5000/api/*
```

**Resulting URLs in Development**:
- Embedded URL: `http://localhost:5000`
- Example API calls:
  - `http://localhost:5000/api/sessions`
  - `http://localhost:5000/api/trophies`
  - `http://localhost:5000/api/submit-trophy`

### File Locations

| File | Environment | Purpose |
|------|-------------|---------|
| `frontend/.env.production` | Production | Vite uses this for `npm run build` |
| `frontend/.env.development` | Development | Vite uses this for `npm run dev` |
| `frontend/.env.local` | Local override | Git-ignored; for personal customization |

### File Content Examples

**frontend/.env.production**:
```
VITE_API_BASE_URL=https://giveyourcollagueatrophie.online
```

**frontend/.env.development**:
```
VITE_API_BASE_URL=http://localhost:5000
```

**frontend/.env.local** (git-ignored, optional):
```
VITE_API_BASE_URL=http://localhost:3000  # Override for different port
```

### Build Output Verification

After running `npm run build`:
```bash
# Check that production build contains production URL
grep -r "giveyourcollagueatrophie.online" frontend/dist/

# Should output: grep finds the production URL embedded in bundle
# Example: binary or minified code containing the URL
```

## Backend ASP.NET Core Configuration

### Environment Variable: `ASPNETCORE_ENVIRONMENT`

**Purpose**: Determine runtime behavior (Development, Staging, or Production)  
**Default**: `Development` (in dev mode)  
**Production Value**: `Production`

### Environment Variable: `ASPNETCORE_URLS`

**Purpose**: Configure port(s) for ASP.NET Core Kestrel server to listen on  
**Development Value**: `http://+:5000` (listens on all interfaces, port 5000)  
**Production Value**: `http://+:8080` (internal container port, Nginx forwards)

### CORS Configuration

**Purpose**: Allow frontend running on different origin to access backend API

**File**: `backend/src/Program.cs`

```csharp
// Add CORS policy for development
var allowedOrigins = new[] { "http://localhost:5173", "http://localhost:5000" };
services.AddCors(options =>
{
    options.AddPolicy("DevelopmentCors", builder =>
    {
        builder.WithOrigins(allowedOrigins)
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Use CORS middleware (only in development)
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevelopmentCors");
}
```

### Static File Serving Configuration

**File**: `backend/src/Program.cs`

```csharp
// Enable static file serving for frontend dist files
app.UseStaticFiles();

// Map API routes
app.MapControllers();

// Fallback to index.html for SPA routing (must be last)
app.MapFallbackToFile("index.html");
```

## Runtime Environment Detection

### Development Setup

```bash
# Terminal 1: Start backend on port 5000
cd backend
dotnet run
# Runs on http://localhost:5000
# ASPNETCORE_ENVIRONMENT=Development (from launchSettings.json)

# Terminal 2: Start frontend dev server on port 5173
cd frontend
npm run dev
# Reads VITE_API_BASE_URL from .env.development
# Frontend calls: http://localhost:5000/api/*
```

### Production Setup

```bash
# Build frontend with production config
cd frontend
VITE_API_BASE_URL=https://giveyourcollagueatrophie.online npm run build
# Output: frontend/dist/ with embedded production URL

# Docker build includes frontend build
docker build -t trophy3d:latest -f backend/Dockerfile .
# Result: Single container with frontend (wwwroot/) + backend

# Run container via docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up
# Container exposed on internal port 8080
# Nginx (host-level) forwards https://giveyourcollagueatrophie.online:443 → localhost:8080
```

## Validation & Testing

### Frontend URL Validation Test

```typescript
// frontend/src/services/api.test.ts
describe('API Base URL', () => {
  it('should use production URL in production builds', () => {
    expect(import.meta.env.VITE_API_BASE_URL).toBe(
      'https://giveyourcollagueatrophie.online'
    );
  });

  it('should use localhost in development', () => {
    expect(import.meta.env.VITE_API_BASE_URL).toContain('localhost');
  });

  it('should construct valid API endpoints', () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const endpoint = `${baseUrl}/api/sessions`;
    expect(endpoint).toMatch(/^https?:\/\//);
  });
});
```

### Backend API Verification

```bash
# Test backend responds on expected endpoint
curl http://localhost:5000/api/sessions
# Expected: JSON response (or 401 if auth required)

# Test frontend static files served from backend
curl http://localhost:5000/
# Expected: HTML content of index.html
```

## Deployment Checklist

### Pre-Production Build
- [ ] `frontend/.env.production` contains `VITE_API_BASE_URL=https://giveyourcollagueatrophie.online`
- [ ] Backend `Program.cs` does NOT use CORS in production
- [ ] Static file serving configured in ASP.NET Core
- [ ] No localhost URLs in production backend configuration

### Pre-Deployment to VPS
- [ ] Production build generated: `npm run build` in frontend
- [ ] Docker image built: `docker build -f backend/Dockerfile .`
- [ ] `docker-compose.prod.yml` configured with correct port (8080)
- [ ] Nginx configuration references `/etc/letsencrypt/` paths
- [ ] Environment variables set in docker-compose or .env.prod

### Post-Deployment Verification
- [ ] `curl https://giveyourcollagueatrophie.online/` returns HTML
- [ ] `curl https://giveyourcollagueatrophie.online/api/sessions` returns JSON
- [ ] `curl http://giveyourcollagueatrophie.online/` redirects to HTTPS
- [ ] Browser devtools show API requests going to `https://giveyourcollagueatrophie.online/api/*`

## Version Control Rules

- ✅ Commit: `frontend/.env.production` (no secrets)
- ✅ Commit: `frontend/.env.development` (no secrets)
- ❌ Commit: `frontend/.env.local` (git-ignored, for personal overrides)
- ✅ Commit: `backend/src/Program.cs` (app configuration)
- ❌ Commit: Actual certificates (handled by Certbot on VPS)
