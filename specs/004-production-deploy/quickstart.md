
docker compose -f docker-compose.prod.yml exec app curl http://localhost:8080/health
# Quickstart: Production Deployment (Containerized)

Date: December 13, 2025  
Purpose: Deploy Trophy3D with HTTPS, Nginx reverse proxy, and containerized ACME companion.

## Prerequisites
- Docker Engine 20.10+ and Docker Compose v2 on the VPS
- Domain `giveyourcollagueatrophie.online` pointing to the VPS public IP
- Ports 80 and 443 open (no other service bound)
- Git access to this repository

## 1) Clone and configure

```bash
git clone https://github.com/YOUR_ORG/trophy3d.git
cd trophy3d
git checkout 004-production-deploy

# Copy and edit production env
cp .env.prod.example .env.production
vi .env.production   # DOMAIN, EMAIL, STAGING, VITE_API_BASE_URL

# Confirm dev env for local work
cat frontend/.env.development
# Expect: VITE_API_BASE_URL=http://localhost:5000/api
```

## 2) Build images

```bash
docker compose -f docker-compose.prod.yml build
```

## 3) Launch stack (first run issues cert if missing)

```bash
docker compose -f docker-compose.prod.yml up -d

# Check containers
docker compose -f docker-compose.prod.yml ps
```

## 4) Validate routing and TLS

```bash
# HTTP → HTTPS redirect
curl -I http://giveyourcollagueatrophie.online/ | head -n 1    # Expect 301

# Frontend over HTTPS
curl -I https://giveyourcollagueatrophie.online/ | head -n 1   # Expect 200

# API over HTTPS (status may be 200/401/405 depending on implementation, but TLS must be valid)
curl -I https://giveyourcollagueatrophie.online/api/sessions | head -n 1

# Certificate details
openssl s_client -connect giveyourcollagueatrophie.online:443 -servername giveyourcollagueatrophie.online \
    </dev/null 2>/dev/null | openssl x509 -noout -dates -issuer
```

## 5) Verify frontend build embeds production API URL

```bash
# Check built bundle for production domain
docker run --rm trophy3d-frontend:prod \
    sh -c "grep -R 'giveyourcollagueatrophie.online' /usr/share/nginx/html | head -n 1"
```

## 6) Observe ACME issuance/renewal

```bash
# Follow ACME logs (issuance + 12h renewal loop)
docker compose -f docker-compose.prod.yml logs -f acme

# On first issuance, you can also verify the HTTP challenge path is reachable (must be 200/404, not a redirect):
curl -I http://giveyourcollagueatrophie.online/.well-known/acme-challenge/test | head -n 1

# Dry-run renewal on demand
docker compose -f docker-compose.prod.yml exec acme \
    sh -c "certbot renew --dry-run --webroot -w /var/www/certbot"

# Confirm cert files present
docker compose -f docker-compose.prod.yml exec nginx \
    ls -l /etc/letsencrypt/live/${DOMAIN:-giveyourcollagueatrophie.online}
```

## 7) TLS/security verification checklist

- curl -I https://giveyourcollagueatrophie.online (200)
- curl -I http://giveyourcollagueatrophie.online (301 → https)
- openssl s_client -connect giveyourcollagueatrophie.online:443 -servername giveyourcollagueatrophie.online \
    </dev/null 2>/dev/null | openssl x509 -noout -dates -issuer
- docker compose -f docker-compose.prod.yml exec nginx nginx -T | grep Strict-Transport-Security
- SSL Labs: https://www.ssllabs.com/ssltest/?d=giveyourcollagueatrophie.online (target A rating)

## 8) Operations

```bash
# Restart services
docker compose -f docker-compose.prod.yml restart

# Rebuild with new code
docker compose -f docker-compose.prod.yml up -d --build

# Tail proxy logs
docker compose -f docker-compose.prod.yml logs -f nginx

# Tear down
docker compose -f docker-compose.prod.yml down
```

Notes:
- ACME container shares the Nginx PID namespace and reloads Nginx via `kill -s HUP 1` after issuance/renewal.
- Certificates persist in the `letsencrypt` named volume and are mounted by Nginx.
- Frontend uses `VITE_API_BASE_URL` (with `/api`) baked at build time; dev uses `.env.development` automatically.

Troubleshooting:
- If `trophy3d-acme` exits with code `137`, it was SIGKILLed (commonly the VPS OOM killer). On the VPS, confirm with `dmesg -T | tail -n 200 | grep -i oom` and consider enabling swap or using a larger instance.
