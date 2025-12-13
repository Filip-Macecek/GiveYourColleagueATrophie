# Quickstart: Production Deployment Guide

**Date**: December 13, 2025  
**Purpose**: Step-by-step guide to deploy Trophy3D to production VPS with HTTPS and auto-renewing certificates  
**Time Estimate**: 1-2 hours for initial setup, 10 minutes for updates  
**Audience**: DevOps engineers, system administrators

## Pre-Requisites

### What You Need
- [ ] VPS with Ubuntu 20.04+ (2GB RAM, 20GB disk minimum)
- [ ] Public IP address for VPS
- [ ] Domain: `giveyourcollagueatrophie.online` (already registered and DNS-configured)
- [ ] SSH access to VPS
- [ ] Git access to Trophy3D repository

### Verify Pre-Requisites

```bash
# 1. SSH into VPS
ssh ubuntu@YOUR_VPS_IP

# 2. Verify OS
lsb_release -a
# Expected: Ubuntu 20.04 or later

# 3. Verify DNS is configured correctly
nslookup giveyourcollagueatrophie.online
# Expected: Returns your VPS IP address

# 4. Verify ports 80/443 are open
sudo ss -tlnp | grep -E ':80|:443'
# Expected: Ports not in use (or can be freed)
```

## Phase 1: Install Prerequisites (20 minutes)

### Step 1.1: Update System

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git
```

### Step 1.2: Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
# Log out and back in to apply group changes
```

Verify:
```bash
docker --version
# Expected: Docker version X.X.X or later
```

### Step 1.3: Install Docker Compose

```bash
sudo apt-get install -y docker-compose-plugin
```

Verify:
```bash
docker compose version
# Expected: Docker Compose version X.X.X or later
```

### Step 1.4: Install Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Verify:
```bash
sudo systemctl status nginx
# Expected: active (running)

curl http://localhost
# Expected: Welcome to nginx!
```

### Step 1.5: Install Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

Verify:
```bash
certbot --version
# Expected: certbot X.X.X
```

## Phase 2: Clone Repository & Configure (15 minutes)

### Step 2.1: Clone Trophy3D Repository

```bash
# Navigate to home directory
cd ~

# Clone repository
git clone https://github.com/YOUR_ORG/trophy3d.git
cd trophy3d

# Checkout the production-deploy branch
git checkout 004-production-deploy

# Or verify you're on main branch (when merging)
git checkout main
git pull origin main
```

### Step 2.2: Configure Environment Files

```bash
# Frontend production environment
cat > frontend/.env.production << EOF
VITE_API_BASE_URL=https://giveyourcollagueatrophie.online
EOF

# Frontend development environment (already exists, verify)
cat frontend/.env.development
# Expected output:
# VITE_API_BASE_URL=http://localhost:5000
```

### Step 2.3: Verify Build Configuration

```bash
# Test frontend build with production environment
cd frontend
npm install
VITE_API_BASE_URL=https://giveyourcollagueatrophie.online npm run build

# Verify build contains production URL
grep -r "giveyourcollagueatrophie.online" dist/ | head -1
# Expected: Binary data or minified code containing the URL

cd ..
```

## Phase 3: Obtain SSL/TLS Certificate (10 minutes)

### Step 3.1: Request Certificate from Let's Encrypt

```bash
# Stop Nginx temporarily (for standalone validation)
sudo systemctl stop nginx

# Request certificate
sudo certbot certonly \
  --standalone \
  -d giveyourcollagueatrophie.online \
  --agree-tos \
  --no-eff-email \
  --email admin@giveyourcollagueatrophie.online

# Expected: "Congratulations! Your certificate has been obtained."
```

### Step 3.2: Verify Certificate Installation

```bash
# List certificates
sudo certbot certificates

# Expected output:
# Certificate Name: giveyourcollagueatrophie.online
# Domains: giveyourcollagueatrophie.online
# Expiry Date: YYYY-MM-DD
# Valid: True
```

### Step 3.3: Set Up Automatic Renewal

```bash
# Create renewal hook directory
sudo mkdir -p /etc/letsencrypt/renewal-hooks/post

# Create Nginx reload script
sudo tee /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh > /dev/null <<'EOF'
#!/bin/bash
echo "Reloading Nginx after certificate renewal..."
nginx -t && systemctl reload nginx
echo "Nginx reloaded successfully"
EOF

# Make executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh

# Test renewal process (dry-run)
sudo certbot renew --dry-run --quiet

# Verify timer is active
sudo systemctl status certbot.timer
# Expected: active (waiting)
```

## Phase 4: Configure Nginx Reverse Proxy (15 minutes)

### Step 4.1: Create Nginx Configuration

```bash
# Create Nginx configuration file
sudo tee /etc/nginx/sites-available/giveyourcollagueatrophie.online > /dev/null <<'EOF'
upstream app_backend {
    server 127.0.0.1:8080;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name giveyourcollagueatrophie.online;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        error_page 497 =301 https://$host$request_uri;
        proxy_pass http://app_backend;
    }
}

# HTTPS server - main application
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name giveyourcollagueatrophie.online;

    ssl_certificate /etc/letsencrypt/live/giveyourcollagueatrophie.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/giveyourcollagueatrophie.online/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5:!RC4;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    access_log /var/log/nginx/giveyourcollagueatrophie.online.access.log;
    error_log /var/log/nginx/giveyourcollagueatrophie.online.error.log;

    location / {
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        access_log off;
        proxy_pass http://app_backend;
    }
}
EOF
```

### Step 4.2: Enable Configuration

```bash
# Create symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/giveyourcollagueatrophie.online \
    /etc/nginx/sites-enabled/giveyourcollagueatrophie.online

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
# Expected: nginx: configuration file test is successful

# Reload Nginx
sudo systemctl reload nginx
```

## Phase 5: Build and Deploy Application Container (20 minutes)

### Step 5.1: Prepare Docker Compose File

```bash
# Create production docker-compose file
cd ~/trophy3d
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: ./backend/Dockerfile
    container_name: trophy3d-app
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:8080
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  app-network:
    driver: bridge
EOF
```

### Step 5.2: Build Application Image

```bash
# Build Docker image (includes frontend build + backend)
docker compose -f docker-compose.prod.yml build

# Expected: "Successfully tagged trophy3d-app"
```

### Step 5.3: Start Application Container

```bash
# Start container in detached mode
docker compose -f docker-compose.prod.yml up -d

# Verify container is running
docker compose -f docker-compose.prod.yml ps
# Expected: status "running"

# Check health
docker compose -f docker-compose.prod.yml exec app curl http://localhost:8080/health
# Expected: {"status":"healthy"} or similar
```

## Phase 6: Verification & Testing (15 minutes)

### Step 6.1: Test HTTP Redirect

```bash
# Test HTTP to HTTPS redirect
curl -I http://giveyourcollagueatrophie.online/
# Expected: 301 or 302 redirect to https://
```

### Step 6.2: Test HTTPS Frontend

```bash
# Test frontend loads over HTTPS
curl -s https://giveyourcollagueatrophie.online/ | head -20
# Expected: HTML content starting with <!DOCTYPE html>
```

### Step 6.3: Test HTTPS API

```bash
# Test API endpoint
curl https://giveyourcollagueatrophie.online/api/sessions
# Expected: JSON response with session data
```

### Step 6.4: Verify Certificate

```bash
# Check certificate details
curl -I https://giveyourcollagueatrophie.online/
# Look for: "Strict-Transport-Security", valid certificate

# Use online tool
# Visit: https://www.ssllabs.com/ssltest/?d=giveyourcollagueatrophie.online
# Expected: A+ or A rating
```

### Step 6.5: View Logs

```bash
# Check application logs
docker compose -f docker-compose.prod.yml logs app

# Check Nginx logs
sudo tail -20 /var/log/nginx/giveyourcollagueatrophie.online.access.log
sudo tail -20 /var/log/nginx/giveyourcollagueatrophie.online.error.log
```

## Phase 7: Post-Deployment Configuration (10 minutes)

### Step 7.1: Set Up Monitoring

```bash
# Check certificate expiration
sudo certbot certificates

# View renewal schedule
sudo systemctl list-timers certbot.timer
```

### Step 7.2: Configure Log Rotation

```bash
# Create logrotate config
sudo tee /etc/logrotate.d/trophy3d > /dev/null <<'EOF'
/var/log/nginx/giveyourcollagueatrophie.online.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF
```

### Step 7.3: Enable Auto-Start on Reboot

```bash
# Docker container auto-restart is already enabled
# Verify
docker compose -f docker-compose.prod.yml config | grep restart

# Nginx and Certbot auto-start
sudo systemctl enable nginx
sudo systemctl enable certbot.timer

# Verify
sudo systemctl is-enabled nginx
sudo systemctl is-enabled certbot.timer
```

## Maintenance & Updates

### Regular Tasks

```bash
# Daily: Certificate renewal check (automatic via systemd timer)
sudo systemctl status certbot.timer

# Weekly: Check logs for errors
sudo tail -100 /var/log/nginx/giveyourcollagueatrophie.online.error.log

# Monthly: Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# As needed: Update Trophy3D application
cd ~/trophy3d
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs app
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| HTTPS certificate error | Check: `sudo certbot certificates` and certificate date |
| Application not responding | Check: `docker compose ps` and `docker compose logs app` |
| HTTP requests failing | Check Nginx logs: `sudo tail -50 /var/log/nginx/...error.log` |
| Port 80/443 already in use | Check: `sudo ss -tlnp \| grep -E ':80\|:443'` |
| Certificate renewal failed | Check: `sudo certbot renew --dry-run --verbose` |

### Disaster Recovery

If something breaks:

```bash
# View container status
docker compose -f docker-compose.prod.yml ps

# Restart container
docker compose -f docker-compose.prod.yml restart

# Rebuild and restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# Check if certificates still exist
sudo certbot certificates

# Manual certificate renewal if needed
sudo certbot renew --force-renewal
```

## Security Checklist

After deployment, verify:

- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Certificate is valid (no browser warnings)
- [ ] All API endpoints require HTTPS
- [ ] SSH key-based authentication (no password login)
- [ ] Firewall configured (ports 80, 443 open; others blocked)
- [ ] Regular backups of `/etc/letsencrypt/` performed
- [ ] Certificate renewal working (check `journalctl -u certbot`)
- [ ] Application container runs with security best practices

## Next Steps

1. **Monitor**: Check logs daily for first week
2. **Backup**: Set up automated backups of `/etc/letsencrypt/`
3. **Updates**: Plan for regular application updates
4. **Scaling**: If load increases, consider load balancing or container orchestration
5. **Metrics**: Consider adding monitoring (e.g., Prometheus, Grafana) for production

## Support & References

- [Let's Encrypt Rate Limits](https://letsencrypt.org/docs/rate-limits/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Nginx SSL Configuration](http://nginx.org/en/docs/http/ngx_http_ssl_module.html)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [ASP.NET Core Deployment](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/)
