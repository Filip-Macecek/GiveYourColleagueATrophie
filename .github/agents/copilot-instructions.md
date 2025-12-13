# trophy3d Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-13

## Active Technologies
- Backend: C# .NET 8.0, Frontend: TypeScript 5.3 + React 18 + Backend: ASP.NET Core, Entity Framework Core, Serilog; Frontend: Vite, Axios, React Router, Three.js, @react-three/fiber (002-trophy-refresh-button)
- Entity Framework Core InMemory (development/current implementation) (002-trophy-refresh-button)
- Frontend: TypeScript (Vite + React), Backend: .NET 8 C# + Frontend: React, Vite, `canvas-confetti` (NEW), existing hooks/services; Backend: existing session/trophy API (003-trophy-rizz)
- N/A (consumes existing APIs) (003-trophy-rizz)
- Frontend TypeScript (Vite + React), Backend .NET 8 (C#) + React, Vite, `canvas-confetti` (frontend), ASP.NET Core (backend) (003-trophy-rizz)
- N/A for this feature; consumes existing backend session/trophy endpoints (003-trophy-rizz)
- Backend: .NET 8 (ASP.NET Core); Frontend: Node.js/Vite + TypeScript + Nginx (container), ACME/certbot companion (container), Docker Compose, ASP.NET Core, Vite (004-production-deploy)
- N/A (certificates stored in Docker volume at `/etc/letsencrypt`) (004-production-deploy)

- .NET 8 (backend), React (frontend), JavaScript/TypeScript (001-trophy-sharing)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

.NET 8 (backend), React (frontend), JavaScript/TypeScript: Follow standard conventions

## Recent Changes
- 004-production-deploy: Added Backend: .NET 8 (ASP.NET Core); Frontend: Node.js/Vite + TypeScript + Nginx (container), ACME/certbot companion (container), Docker Compose, ASP.NET Core, Vite
- 003-trophy-rizz: Added Frontend TypeScript (Vite + React), Backend .NET 8 (C#) + React, Vite, `canvas-confetti` (frontend), ASP.NET Core (backend)
- 003-trophy-rizz: Added Frontend: TypeScript (Vite + React), Backend: .NET 8 C# + Frontend: React, Vite, `canvas-confetti` (NEW), existing hooks/services; Backend: existing session/trophy API


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
