# Production Deployment Guide

## System Requirements

- **OS**: Ubuntu 20.04 LTS or later
- **CPU**: 4+ cores
- **RAM**: 8GB+ 
- **Storage**: 100GB+ SSD
- **Network**: 100 Mbps+ connection
- **Node.js**: 18.0.0+
- **Docker**: 20.10+

## Pre-Deployment Checklist

- [ ] Secure credentials setup
- [ ] SSL certificates configured
- [ ] Firewall rules configured
- [ ] Backup systems in place
- [ ] Monitoring alerts setup
- [ ] Disaster recovery plan
- [ ] Performance testing done
- [ ] Security audit completed

## Installation Steps

### 1. System Preparation

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/armandRobled/seed-vault-sdk.git
cd seed-vault-sdk/crypto-exchange-integration

# Install dependencies
npm ci --only=production

# Build application
npm run build
```

### 3. Configuration

```bash
# Create .env file with secrets
cp .env.example .env

# Edit with production values
sudo nano .env

# Set restrictive permissions
chmod 600 .env

# Verify configuration
node dist/index.js --validate-config
```

### 4. Database Setup

```bash
# Initialize database
node dist/scripts/init-db.js

# Run migrations
node dist/scripts/migrate.js
```

### 5. Systemd Service

```bash
# Create service file
sudo tee /etc/systemd/system/crypto-exchange.service > /dev/null <<EOF
[Unit]
Description=Crypto Exchange Integration
After=network.target

[Service]
Type=simple
User=crypto-exchange
WorkingDirectory=/opt/crypto-exchange
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
EnvironmentFile=/opt/crypto-exchange/.env

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable crypto-exchange
sudo systemctl start crypto-exchange

# Check status
sudo systemctl status crypto-exchange
```

### 6. Nginx Configuration

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create config
sudo tee /etc/nginx/sites-available/crypto-exchange > /dev/null <<'EOF'
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/crypto-exchange /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificates

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d api.example.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Monitoring & Logging

### Application Logs

```bash
# View logs
sudo journalctl -u crypto-exchange -f

# Log file
tail -f /var/log/crypto-exchange.log
```

### Health Check

```bash
# Manual check
curl -s http://localhost:3000/health | jq

# Automated monitoring
watch -n 5 'curl -s http://localhost:3000/health | jq'
```

### Metrics

```bash
# CPU usage
ps aux | grep 'node dist/index.js'

# Memory usage
free -h

# Disk usage
df -h
```

## Backup & Recovery

### Automated Backups

```bash
# Create backup script
sudo tee /usr/local/bin/backup-crypto-exchange.sh > /dev/null <<'EOF'
#!/bin/bash
BACKUP_DIR=/backups/crypto-exchange
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U postgres crypto_exchange > $BACKUP_DIR/db_$DATE.sql

# Backup config
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/crypto-exchange/.env

# Upload to S3
aws s3 cp $BACKUP_DIR/ s3://backups/crypto-exchange/ --recursive

echo "Backup completed at $DATE"
EOF

sudo chmod +x /usr/local/bin/backup-crypto-exchange.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-crypto-exchange.sh") | crontab -
```

## Scaling

### Load Balancing

```bash
# Run multiple instances
for i in {1..3}; do
  PORT=$((3000 + $i)) npm start &
done

# Configure HAProxy for load balancing
# See HAProxy documentation
```

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy service
docker service create \
  --name crypto-exchange \
  --replicas 3 \
  --publish 3000:3000 \
  crypto-exchange:latest
```

## Troubleshooting

### Application Won't Start

```bash
# Check Node.js
node --version

# Check dependencies
npm ci

# Check configuration
cat .env | grep -E '^[^#]'

# Run with debug
DEBUG=* node dist/index.js
```

### High Memory Usage

```bash
# Check memory leaks
node --max-old-space-size=4096 dist/index.js

# Enable monitoring
npm install clinic
node_modules/.bin/clinic doctor -- node dist/index.js
```

## Security Hardening

- [ ] Firewall rules configured
- [ ] SSH key-based only (no passwords)
- [ ] Fail2ban installed
- [ ] SELinux/AppArmor enabled
- [ ] Regular security updates
- [ ] Secrets in secure vault
- [ ] API rate limiting enabled
- [ ] HTTPS enforced

## Support

For issues or questions:
- Check logs: `journalctl -u crypto-exchange -f`
- Review documentation
- Report on GitHub Issues
- Email: armandRobled@users.noreply.github.com
