# Trophy3D Sharing App

A session-based trophy-sharing application enabling team members to nominate colleagues for recognition with 3D-rendered trophy presentations.

## Features

- **Create Sessions**: Organizers can create a sharing session and receive a shareable link
- **Submit Nominations**: Team members can submit trophy nominations with recipient name and achievement
- **Present with 3D**: Organizers can present trophies with theatrical 3D rendered graphics

## Quick Start

### Prerequisites

- Docker Desktop 4.0+
- Git
- .NET 8 SDK (for local development)
- Node.js 18+ (for local development)

### Docker Compose (Recommended)

```bash
# Clone and navigate
git clone <repo-url> trophy3d
cd trophy3d

# Start services
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# API Docs: http://localhost:5000/swagger
```

### Local Development

#### Backend (.NET 8)

```bash
cd backend
dotnet restore
dotnet build
dotnet run
# Backend runs on http://localhost:5000
```

#### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## Architecture

### Technology Stack

- **Backend**: ASP.NET Core 8, Entity Framework Core, Swagger
- **Frontend**: React 18, Vite, three.js (3D rendering)
- **Storage**: In-memory (MVP), optional persistence with SQLite/PostgreSQL
- **Deployment**: Docker, Docker Compose

### Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── Models/          # Domain entities
│   │   ├── Services/        # Business logic
│   │   ├── Controllers/     # API endpoints
│   │   ├── Data/            # DbContext
│   │   ├── Filters/         # Middleware
│   │   └── Program.cs       # Startup config
│   ├── tests/
│   │   ├── Unit/
│   │   └── Integration/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client, 3D
│   │   ├── hooks/           # Custom hooks
│   │   └── assets/          # Images, models
│   ├── tests/
│   ├── vite.config.ts
│   └── Dockerfile
└── docker-compose.yml
```

## API Documentation

See [specs/001-trophy-sharing/contracts/openapi.yaml](specs/001-trophy-sharing/contracts/openapi.yaml) for complete API specification.

### Key Endpoints

- `POST /api/sessions` - Create session
- `GET /api/sessions/{code}` - Get session details
- `POST /api/sessions/{code}/trophies` - Submit trophy
- `GET /api/sessions/{code}/trophies` - List trophies
- `POST /api/sessions/{code}/present` - Start presentation

## Development Workflow

1. Feature specifications in `specs/001-trophy-sharing/`
2. Tasks defined in `tasks.md`
3. Implementation follows test-first happy path
4. Docker Compose for integrated testing

## Contributing

Follow the implementation plan in [specs/001-trophy-sharing/tasks.md](specs/001-trophy-sharing/tasks.md).

## License

TBD
