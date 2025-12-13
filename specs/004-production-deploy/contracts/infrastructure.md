# Contract: Infrastructure & Deployment Architecture

**Date**: December 13, 2025  
**Scope**: VPS deployment architecture, SSL/TLS certificates, reverse proxy configuration  
**Owned By**: DevOps / System Administrator

## VPS Infrastructure Requirements

### Hardware & OS

- **Operating System**: Ubuntu 20.04 LTS or later (recommended)
- **Disk Space**: Minimum 20 GB (OS + Docker + containers + logs)
- **Memory**: Minimum 2 GB RAM (1 GB for OS + container, 1 GB buffer)
- **Network**: Static IP address with ports 80/443 open to internet
- **SSH Access**: Required for deployment and maintenance

### Pre-Requisite Software

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 20.10+ | Container runtime |
| Docker Compose | 2.0+ | Multi-container orchestration |
| Nginx | 1.18+ | Reverse proxy and HTTPS termination |
| Certbot | 1.25+ | Let's Encrypt certificate automation |
| Python3 | 3.8+ | Required by Certbot |
| Git | 2.25+ | Source code management |

### Installation Commands

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin -y

# Install Nginx
sudo apt-get install nginx -y

# Install Certbot with Nginx plugin
sudo apt-get install certbot python3-certbot-nginx -y
```

## Domain & DNS Configuration

### Domain Setup

| Component | Requirement |
|-----------|------------|
| **Domain** | `giveyourcollagueatrophie.online` |
| **DNS A Record** | Points to VPS public IP address |
| **TTL** | 3600 seconds (1 hour) minimum |
| **Verification** | `ping giveyourcollagueatrophie.online` resolves to VPS IP |

### Pre-Deployment DNS Check

```bash
# Verify DNS is configured correctly
nslookup giveyourcollagueatrophie.online
# Output should show VPS IP address

# Verify public IP matches what domain points to
curl ifconfig.me
# Output should match "giveyourcollagueatrophie.online" A record
```

## Certificate Configuration

### Let's Encrypt Certificate Request

```bash
# Initial certificate issuance (performs ACME challenge)
sudo certbot certonly \
  --standalone \
  -d giveyourcollagueatrophie.online \
  --agree-tos \
  --no-eff-email \
  --email admin@giveyourcollagueatrophie.online

# Output: Certificate stored in /etc/letsencrypt/live/giveyourcollagueatrophie.online/
```

### Certificate File Locations

```
/etc/letsencrypt/live/giveyourcollagueatrophie.online/
├── fullchain.pem         # Full certificate chain (used by Nginx)
├── privkey.pem          # Private key (kept secure)
├── cert.pem             # End-entity certificate only
└── chain.pem            # Intermediate certificates
```

**Ownership**:
```bash
# Verify permissions (read-only for web server)
ls -la /etc/letsencrypt/live/giveyourcollagueatrophie.online/
# Output: root:root, readable by all, not world-writable
```

### Automatic Renewal Setup

```bash
# Create post-renewal hook to reload Nginx
sudo mkdir -p /etc/letsencrypt/renewal-hooks/post
sudo tee /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh > /dev/null <<EOF
#!/bin/bash
echo "Reloading Nginx after certificate renewal..."
nginx -t && systemctl reload nginx
echo "Nginx reloaded successfully"
EOF

# Make script executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh

# Test renewal process (dry-run)
sudo certbot renew --dry-run

# Verify systemd timer is active
sudo systemctl status certbot.timer
# Output should show "active (waiting)"
```

### Certificate Renewal Verification

```bash
# Check certificate expiration date
sudo certbot certificates
# Output shows: expires on YYYY-MM-DD

# View renewal history
sudo journalctl -u certbot.service --all
# Output shows renewal attempts and results

# Monitor next renewal execution
sudo systemctl list-timers certbot.timer
```

## Nginx Reverse Proxy Configuration

### Configuration File Structure

```
/etc/nginx/sites-available/giveyourcollagueatrophie.online
/etc/nginx/sites-enabled/giveyourcollagueatrophie.online (symlink)
```

### Full Nginx Configuration

```nginx
# /etc/nginx/sites-available/giveyourcollagueatrophie.online

upstream app_backend {
    server 127.0.0.1:8080;  # Docker container internal port
}

# HTTP server - redirect to HTTPS and handle ACME challenges
server {
    listen 80;
    listen [::]:80;
    server_name giveyourcollagueatrophie.online;

    # ACME challenge directory for certificate renewal
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
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

    # SSL Certificate configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/giveyourcollagueatrophie.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/giveyourcollagueatrophie.online/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5:!RC4;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/giveyourcollagueatrophie.online.access.log;
    error_log /var/log/nginx/giveyourcollagueatrophie.online.error.log;

    # Application proxy
    location / {
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (for monitoring)
    location /health {
        access_log off;
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
    }
}
```

### Nginx Deployment Steps

```bash
# Create sites-available file
sudo tee /etc/nginx/sites-available/giveyourcollagueatrophie.online > /dev/null < <<EOF
[paste configuration above]
EOF

# Create symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/giveyourcollagueatrophie.online \
    /etc/nginx/sites-enabled/giveyourcollagueatrophie.online

# Disable default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration syntax
sudo nginx -t
# Output should show: "successful"

# Reload Nginx to apply changes
sudo systemctl reload nginx

# Verify Nginx is running
sudo systemctl status nginx
```

## Docker Container Configuration

### Docker Compose File (docker-compose.prod.yml)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: ./backend/Dockerfile
    container_name: trophy3d-app
    restart: unless-stopped
    
    # Port configuration
    ports:
      - "127.0.0.1:8080:8080"  # Only expose to localhost (Nginx on host accesses this)
    
    # Environment variables
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:8080
    
    # Networking
    networks:
      - app-network
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    
    # Logging
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  app-network:
    driver: bridge
```

### Deployment Steps

```bash
# Navigate to repository root
cd /home/ubuntu/trophy3d  # or wherever repo is cloned

# Build and start container
docker-compose -f docker-compose.prod.yml up -d

# Verify container is running
docker-compose -f docker-compose.prod.yml ps
# Output should show "running" status

# Check container logs
docker-compose -f docker-compose.prod.yml logs -f app

# Verify health check passes
docker-compose -f docker-compose.prod.yml exec app curl http://localhost:8080/health
```

## Firewall Configuration

### UFW (Uncomplicated Firewall) Setup

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (prevent lockout)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# View firewall status
sudo ufw status
```

### Verify Connectivity

```bash
# Test HTTP redirect
curl -I http://giveyourcollagueatrophie.online/
# Expected: 301 redirect to https://

# Test HTTPS connectivity
curl -I https://giveyourcollagueatrophie.online/
# Expected: 200 OK, certificate valid

# Test API endpoint
curl https://giveyourcollagueatrophie.online/api/sessions
# Expected: JSON response
```

## Monitoring & Maintenance

### Certificate Expiration Monitoring

```bash
# Manual check
sudo certbot certificates

# Automated alert (add to crontab for daily check)
sudo certbot renew --dry-run --quiet

# View renewal logs
sudo journalctl -u certbot.service -n 50
```

### Application Logs

```bash
# View application container logs
docker-compose -f docker-compose.prod.yml logs app

# View Nginx logs
sudo tail -f /var/log/nginx/giveyourcollagueatrophie.online.access.log
sudo tail -f /var/log/nginx/giveyourcollagueatrophie.online.error.log

# View system logs
sudo journalctl -u nginx -f
```

### Performance Monitoring

```bash
# Check container resource usage
docker stats trophy3d-app

# Monitor Nginx performance
sudo systemctl status nginx
```

## Security Checklist

- [ ] Firewall configured (UFW or cloud provider rules)
- [ ] SSH key-based authentication only (no password login)
- [ ] Fail2ban installed and configured (optional but recommended)
- [ ] Automatic security updates enabled
- [ ] Certificate files owned by root, readable but not writable
- [ ] Docker runs as unprivileged user
- [ ] Regular backups of /etc/letsencrypt/ configured
- [ ] HTTPS headers configured (HSTS, X-Frame-Options, etc.)

## Disaster Recovery

### Backup Critical Files

```bash
# Backup certificates
sudo tar czf /backup/letsencrypt-$(date +%Y%m%d).tar.gz /etc/letsencrypt/

# Backup Nginx configuration
sudo tar czf /backup/nginx-$(date +%Y%m%d).tar.gz /etc/nginx/

# Backup docker-compose and code
tar czf /backup/app-$(date +%Y%m%d).tar.gz /home/ubuntu/trophy3d/
```

### Restore Procedure

If deployment fails, certificates can be restored:
```bash
# Restore certificates
sudo tar xzf /backup/letsencrypt-YYYYMMDD.tar.gz -C /

# Rebuild container
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Verify restoration
curl -I https://giveyourcollagueatrophie.online/
```
