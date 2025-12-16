# Docker Compose Cheat Sheet (Quick Reference)

## `docker-compose` vs `docker compose`
- `docker compose`: Compose v2 plugin (recommended; built into Docker Desktop / modern Docker)
- `docker-compose`: legacy v1 standalone binary (older installs)
- Most commands/flags are the same; prefer `docker compose`.

## Project Shortcuts
```sh
# Use the prod compose file
alias dcp='docker compose -f docker-compose.prod.yml'

# Use the default compose file
alias dc='docker compose'
```

## Build
```sh
# Build everything
dcp build

# Build one service
dcp build backend

# Rebuild without cache
dcp build --no-cache
```

## Start / Stop
```sh
# Start (foreground)
dcp up

# Start (detached)
dcp up -d

# Stop containers (keeps them)
dcp stop

# Stop + remove containers + default network
dcp down

# Down + remove named volumes (DANGEROUS: deletes persisted data)
dcp down -v
```

## Status / Processes
```sh
# Show compose-managed containers
dcp ps

# Show all docker containers
docker ps -a
```

## Logs
```sh
# All logs
dcp logs

# Follow logs
dcp logs -f

# Follow one service
dcp logs -f nginx

# Last N lines
dcp logs --tail=200 -f
```

## Restart (and see startup logs)
```sh
# Restart then follow logs
dcp restart
; dcp logs -f --tail=200

# Restart one service
dcp restart backend
; dcp logs -f --tail=200 backend
```

## Debugging: Shell, Files, Networking
```sh
# Shell into a running container
dcp exec backend sh

# Run a one-off command in a new container
dcp run --rm backend sh -lc 'printenv | sort'

# Verify expanded config (what Compose will actually run)
dcp config

# Inspect networks/ports at docker level
docker network ls
; docker inspect trophy3d-nginx
```

## Health / Quick Checks
```sh
# Watch status
dcp ps

# Quick curl from host
curl -i http://localhost/
; curl -ik https://localhost/
```

## Cleanup
```sh
# Remove dangling images/build cache (safe-ish)
docker image prune
; docker builder prune

# Aggressive cleanup (DANGEROUS)
docker system prune -a
```

## Useful Patterns
```sh
# Force recreate containers (keeps images unless rebuilt)
dcp up -d --force-recreate

# Rebuild + recreate
dcp up -d --build

# If something is wedged, start fresh
dcp down
; dcp up -d --build
; dcp logs -f --tail=200
```
