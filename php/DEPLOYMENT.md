# PHP Backend Deployment Guide

## Deployment Scripts

### 1. build-and-push.sh
Builds and pushes Docker image to Docker Hub.

**Usage:**
```bash
./build-and-push.sh
```

**Environment Variables:**
- `DOCKERHUB_USERNAME` - Docker Hub username (default: quanluonluon)
- `IMAGE_NAME` - Image name (default: library-manager-php)
- `VERSION` - Image version/tag (default: latest)

### 2. deploy-to-ec2.sh
Deploys the application to EC2 instance via SSH.

**Usage:**
```bash
export EC2_HOST=your-ec2-host
export EC2_USER=ubuntu
export EC2_SSH_KEY=~/.ssh/your-key.pem
export GHCR_TOKEN=your_github_token
./deploy-to-ec2.sh
```

**Environment Variables:**
- `EC2_HOST` - EC2 instance IP or hostname (required)
- `EC2_USER` - SSH username (default: ubuntu)
- `EC2_SSH_KEY` - Path to SSH private key (required)
- `EC2_DEPLOY_PATH` - Deployment directory (default: ~/library-manager-php)

### 3. build-and-deploy.sh
Combines build-and-push.sh and deploy-to-ec2.sh in sequence.

**Usage:**
```bash
export EC2_HOST=your-ec2-host
export EC2_USER=ubuntu
export EC2_SSH_KEY=~/.ssh/your-key.pem
./build-and-deploy.sh
```

## Subdomain Configuration

The PHP backend uses a different subdomain from Python backend:
- **Python Backend:** `beta-api.gigafit.space`
- **PHP Backend:** `php-api.gigafit.space`

This is configured in `docker-compose.prod.yml` via Traefik labels.

## Deployment Steps

1. **Build and Push Image:**
   ```bash
   cd php
   ./build-and-push.sh
   ```

2. **Deploy to EC2:**
   ```bash
   export EC2_HOST=your-ec2-host
   export EC2_SSH_KEY=~/.ssh/your-key.pem
   ./deploy-to-ec2.sh
   ```

3. **Or do both at once:**
   ```bash
   ./build-and-deploy.sh
   ```

## Differences from Python Backend

1. **Subdomain:** `php-api.gigafit.space` instead of `beta-api.gigafit.space`
2. **Deploy Path:** `~/library-manager-php` instead of `~/library-manager`
3. **Container Name:** `library_manager_backend_php` instead of `library_manager_backend`
4. **Health Check:** `/api/health/db` (with `/api` prefix)
5. **Image Name:** `library-manager-php` instead of `library-manager-backend`

## Requirements

- Docker installed locally
- SSH access to EC2 instance
- Docker Hub account (for pushing images)
- Traefik reverse proxy configured on EC2
- External network `traefik_net` created on Docker

## Troubleshooting

### SSH Connection Issues
- Verify EC2_HOST, EC2_USER, and SSH key path
- Check security group allows SSH from your IP
- Ensure SSH key has correct permissions: `chmod 400 your-key.pem`

### Docker Image Pull Issues
- Verify you're logged in to Docker Hub: `docker login`
- Check image name matches in docker-compose.prod.yml
- Ensure image exists in Docker Hub

### Container Not Starting
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Verify .env file exists on EC2
- Check Traefik network: `docker network ls | grep traefik_net`

