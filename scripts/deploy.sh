#!/bin/bash

# MyGuide Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environment: staging|production (default: staging)

set -e  # Exit on any error

ENVIRONMENT=${1:-staging}
PROJECT_NAME="myguide"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if environment file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        error ".env file not found. Please copy .env.template to .env and configure it."
    fi
    log "Environment file found ✓"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
    fi
    log "Docker is running ✓"
}

# Pull latest images
pull_images() {
    log "Pulling latest images..."
    docker-compose -f $COMPOSE_FILE pull
}

# Backup database
backup_database() {
    log "Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose -f $COMPOSE_FILE exec -T db pg_dump -U ${DB_USER:-postgres} ${DB_NAME:-myguide} > "backups/$BACKUP_FILE"
    log "Database backup created: backups/$BACKUP_FILE"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    docker-compose -f $COMPOSE_FILE exec backend python manage.py migrate
}

# Collect static files
collect_static() {
    log "Collecting static files..."
    docker-compose -f $COMPOSE_FILE exec backend python manage.py collectstatic --noinput
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        log "Backend health check passed ✓"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost/ > /dev/null 2>&1; then
        log "Frontend health check passed ✓"
    else
        error "Frontend health check failed"
    fi
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    docker image prune -f
    docker volume prune -f
}

# Main deployment function
deploy() {
    log "Starting deployment to $ENVIRONMENT environment..."
    
    # Pre-deployment checks
    check_env_file
    check_docker
    
    # Create backup directory if it doesn't exist
    mkdir -p backups
    
    # Backup database (only for production)
    if [ "$ENVIRONMENT" = "production" ]; then
        backup_database
    fi
    
    # Pull latest images
    pull_images
    
    # Stop services
    log "Stopping services..."
    docker-compose -f $COMPOSE_FILE down
    
    # Start services
    log "Starting services..."
    docker-compose -f $COMPOSE_FILE up -d
    
    # Run migrations
    run_migrations
    
    # Collect static files
    collect_static
    
    # Health check
    health_check
    
    # Cleanup
    cleanup
    
    log "Deployment completed successfully! 🎉"
    log "Application is available at: http://localhost"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current services
    docker-compose -f $COMPOSE_FILE down
    
    # Restore from backup (implement based on your backup strategy)
    warn "Manual database restore may be required"
    
    # Start services with previous version
    # (This would require tagging and version management)
    warn "Rollback completed. Please verify the application state."
}

# Show usage
usage() {
    echo "Usage: $0 [command] [environment]"
    echo "Commands:"
    echo "  deploy    Deploy the application (default)"
    echo "  rollback  Rollback the deployment"
    echo "  status    Show deployment status"
    echo "Environments:"
    echo "  staging     Deploy to staging (default)"
    echo "  production  Deploy to production"
}

# Show status
status() {
    log "Deployment status:"
    docker-compose -f $COMPOSE_FILE ps
}

# Main script logic
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    status)
        status
        ;;
    *)
        usage
        exit 1
        ;;
esac