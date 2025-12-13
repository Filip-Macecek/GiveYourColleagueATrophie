# Quickstart: Trophy3D Development Environment

**Feature**: 001-trophy-sharing  
**Stack**: .NET 8 (backend), React (frontend), Docker  
**Setup Time**: ~15 minutes

---

## Prerequisites

### Required Software

- **Docker Desktop** 4.0+: https://www.docker.com/products/docker-desktop/
  - Includes Docker CLI and Docker Compose
  - Ensure it's running before proceeding

- **Git**: https://git-scm.com/
  - For cloning and version control

- **.NET 8 SDK** (for local development without Docker)
  - Download: https://dotnet.microsoft.com/en-us/download/dotnet/8.0
  - Verify: `dotnet --version` → should show 8.0.x

- **Node.js 18+** (for local frontend development without Docker)
  - Download: https://nodejs.org/
  - Verify: `node --version` → should show v18.x or higher
  - npm should be included: `npm --version`

### Optional (for IDE support)

- **Visual Studio Code** with extensions:
  - REST Client (REST API testing)
  - OpenAPI (YAML) Preview
  - Docker extension
- **Visual Studio 2022** Community Edition (backend development)
- **JetBrains Rider** (cross-platform IDE)

---

## Quick Start: Docker Compose (Recommended)

### 1. Clone the Repository

```bash
cd d:\dev
git clone <repository-url> trophy3d
cd trophy3d
```

### 2. Start Services with Docker Compose

```bash
# From repository root
docker-compose up -d
```

This command:
- Builds the backend Docker image (`backend/Dockerfile`)
- Builds the frontend Docker image (`frontend/Dockerfile`)
- Starts both services in the background
- Maps ports: Backend on `:5000`, Frontend on `:3000`

**Wait 30 seconds for services to initialize.**

### 3. Verify Services Are Running

```bash
# Check containers
docker-compose ps

# Output should show:
# NAME                 STATUS
# trophy3d-backend     Up 2 minutes
# trophy3d-frontend    Up 1 minute
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:5000/swagger (Swagger UI)
- **API Base**: http://localhost:5000/api

### 5. Stop Services

```bash
docker-compose down
```

### 6. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Local Development: Without Docker

### Backend Setup (.NET 8)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Restore NuGet packages
dotnet restore

# 3. Build the project
dotnet build

# 4. Run Entity Framework migrations (if database setup needed)
dotnet ef database update

# 5. Start the server (listens on https://localhost:5001 or http://localhost:5000)
dotnet run

# Output should show:
# info: Microsoft.Hosting.Lifetime[14]
# Now listening on: http://localhost:5000
```

**Backend will be available at**: `http://localhost:5000/api`

#### Backend Project Structure

```
backend/
├── src/
│   ├── Models/                 # Session, TrophySubmission, User entities
│   ├── Services/               # SessionService, TrophyService (business logic)
│   ├── Controllers/            # API endpoints (SessionsController, TrophiesController)
│   ├── Data/                   # DbContext and migrations
│   ├── Filters/                # Exception handling filters
│   └── Program.cs              # Startup configuration, DI setup
├── tests/
│   ├── Unit/                   # Service and model unit tests
│   ├── Integration/            # API integration tests
│   └── HappyPath/              # End-to-end happy path tests
├── backend.csproj              # Project file
└── Dockerfile
```

#### First-Run Checklist

- [ ] `dotnet restore` completes without errors
- [ ] `dotnet build` succeeds
- [ ] `dotnet run` starts without exceptions
- [ ] http://localhost:5000/api/sessions returns 404 (expected, no route without POST)
- [ ] http://localhost:5000/swagger opens (Swagger UI)

---

### Frontend Setup (React + Vite)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server (hot reload enabled)
npm run dev

# Output should show:
# Local:        http://localhost:5173
# Or configured port in vite.config.ts
```

**Frontend will be available at**: `http://localhost:5173` or configured port

> **Note**: Vite uses different port than Docker Compose (3000). Update API client if needed to point to backend.

#### Frontend Project Structure

```
frontend/
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── SessionForm.tsx     # Start session component
│   │   ├── TrophyForm.tsx      # Submit trophy component
│   │   └── TrophyPresentation.tsx  # 3D rendering component
│   ├── pages/                  # Full page components
│   │   ├── SessionPage.tsx
│   │   ├── SubmissionPage.tsx
│   │   └── PresentationPage.tsx
│   ├── services/               # API client and three.js
│   │   ├── api.ts              # Axios/Fetch wrapper
│   │   └── TrophyRenderer.ts   # three.js scene setup
│   ├── hooks/                  # Custom React hooks
│   │   ├── useSession.ts
│   │   └── useTrophies.ts
│   ├── assets/                 # Static files and 3D models
│   │   └── models/trophy.gltf
│   └── App.tsx                 # Root component
├── tests/
│   ├── unit/                   # Component tests (Vitest)
│   └── integration/            # Page integration tests
├── package.json
├── vite.config.ts              # Vite configuration
├── Dockerfile
└── README.md
```

#### First-Run Checklist

- [ ] `npm install` completes (watch for peer dependency warnings)
- [ ] `npm run dev` starts
- [ ] http://localhost:5173 (or configured port) opens in browser
- [ ] HMR (hot reload) works: edit a component and see it refresh
- [ ] API calls fail gracefully if backend not running (expected)

#### Configure API Endpoint

Update `frontend/src/services/api.ts`:

```typescript
const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000/api';
```

Or set environment variable:
```bash
# On Windows PowerShell
$env:VITE_API_URL = 'http://localhost:5000/api'
npm run dev

# On Linux/macOS
export VITE_API_URL='http://localhost:5000/api'
npm run dev
```

---

## Testing

### Run All Tests (with Docker Compose)

```bash
# Backend tests
docker-compose run backend dotnet test

# Frontend tests
docker-compose run frontend npm run test
```

### Run Tests Locally

**Backend (xUnit + Moq)**:
```bash
cd backend
dotnet test
# or with verbose output
dotnet test --verbosity=detailed
```

**Frontend (Vitest + React Testing Library)**:
```bash
cd frontend
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Happy Path Test

The happy path test covers the complete user workflow:
1. Create session
2. Access session via shareable link
3. Submit trophy
4. Transition to presentation
5. View 3D trophy with navigation

```bash
# Backend happy path test
cd backend
dotnet test --filter "Category=HappyPath"
```

---

## Common Tasks

### Create a Test Session Manually

**Using curl or REST Client**:

```bash
# 1. Create session
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"organizerName": "Alice"}'

# Response: { "id": "...", "sessionCode": "TROPHY-ABC123", "shareableUrl": "...", ... }

# 2. Get session
curl http://localhost:5000/api/sessions/TROPHY-ABC123

# 3. Submit trophy
curl -X POST http://localhost:5000/api/sessions/TROPHY-ABC123/trophies \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Bob",
    "achievementText": "Great work on Q4 project",
    "submitterName": "Carol"
  }'

# 4. Start presentation
curl -X POST http://localhost:5000/api/sessions/TROPHY-ABC123/present
```

Or use **REST Client extension in VS Code** with `requests.http`:

```http
### Create Session
POST http://localhost:5000/api/sessions HTTP/1.1
Content-Type: application/json

{
  "organizerName": "Alice"
}

### Get Session
GET http://localhost:5000/api/sessions/TROPHY-ABC123 HTTP/1.1

### Submit Trophy
POST http://localhost:5000/api/sessions/TROPHY-ABC123/trophies HTTP/1.1
Content-Type: application/json

{
  "recipientName": "Bob",
  "achievementText": "Excellent work",
  "submitterName": "Carol"
}

### Start Presentation
POST http://localhost:5000/api/sessions/TROPHY-ABC123/present HTTP/1.1
```

### Rebuild Docker Images

```bash
# Rebuild without cache (useful if dependencies changed)
docker-compose build --no-cache

# Start after rebuild
docker-compose up -d
```

### Check Backend Database

**If using SQLite locally**:
```bash
# Database file is typically at: backend/trophy3d.db
# Use SQLite viewer or command-line:
sqlite3 backend/trophy3d.db ".tables"
sqlite3 backend/trophy3d.db "SELECT * FROM Sessions;"
```

### Generate API Client Code (Optional)

From OpenAPI spec, generate TypeScript client:

```bash
# Install OpenAPI generator
npm install -g @openapitools/openapi-generator-cli

# Generate client in frontend/src/api-client/
cd frontend
openapi-generator-cli generate \
  -i ../specs/001-trophy-sharing/contracts/openapi.yaml \
  -g typescript-axios \
  -o src/api-client
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Docker containers won't start** | Check Docker Desktop is running: `docker ps` |
| **Port 5000 already in use** | Change `docker-compose.yml` port mapping: `5001:5000` |
| **Port 3000 already in use** | Change frontend port in `docker-compose.yml`: `3001:3000` |
| **Backend crashes on startup** | Check logs: `docker-compose logs backend` |
| **Frontend shows "Cannot GET /"** | Frontend needs `npm run dev` or Vite server running |
| **CORS errors in frontend** | Ensure backend is running and API URL is correct in `api.ts` |
| **Database migration errors** | Delete database: `rm backend/trophy3d.db`, then re-run migrations |
| **npm install fails** | Clear cache: `npm cache clean --force`, then retry |
| **.NET restore fails** | Clear NuGet cache: `dotnet nuget locals all --clear`, then retry |

---

## Next Steps

1. **Read the feature spec**: [spec.md](spec.md)
2. **Understand the data model**: [data-model.md](data-model.md)
3. **Review API contracts**: [contracts/openapi.yaml](contracts/openapi.yaml)
4. **Implement happy path**: Start with session creation → submission → presentation
5. **Add tests**: Write tests as you implement (test-first)

---

## Development Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feature/some-feature
   ```

2. **Make changes** (backend and/or frontend)

3. **Test locally**:
   ```bash
   cd backend && dotnet test
   cd frontend && npm run test
   ```

4. **Verify in Docker** (before committing):
   ```bash
   docker-compose build
   docker-compose up
   ```

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: implement session creation"
   git push origin feature/some-feature
   ```

6. **Create pull request** and request review

---

## Resources

- **OpenAPI Spec**: [contracts/openapi.yaml](contracts/openapi.yaml)
- **Data Model**: [data-model.md](data-model.md)
- **Research & Architecture**: [research.md](research.md)
- **ASP.NET Core Docs**: https://docs.microsoft.com/en-us/aspnet/core/
- **React Docs**: https://react.dev
- **three.js Docs**: https://threejs.org/docs/
- **Docker Docs**: https://docs.docker.com/

---

## Questions?

Refer to [spec.md](spec.md) for feature requirements and [research.md](research.md) for architectural decisions.
