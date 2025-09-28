#!/bin/bash

# MyGuide Development Environment Setup Script
# This script sets up the development environment with Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker and try again."
    fi
    
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
    fi
    
    log "Docker is installed and running ✓"
}

# Check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose and try again."
    fi
    
    log "Docker Compose is available ✓"
}

# Create environment file from template
setup_env_file() {
    if [ ! -f ".env" ]; then
        if [ -f ".env.template" ]; then
            log "Creating .env file from template..."
            cp .env.template .env
            warn "Please edit .env file with your configuration before running the application"
        else
            error ".env.template file not found"
        fi
    else
        info ".env file already exists"
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    directories=(
        "logs"
        "backups"
        "media"
        "static"
        "data/postgres"
        "data/redis"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        info "Created directory: $dir"
    done
}

# Build Docker images
build_images() {
    log "Building Docker images..."
    docker-compose build --no-cache
}

# Start services
start_services() {
    log "Starting development services..."
    docker-compose up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
}

# Run initial setup
initial_setup() {
    log "Running initial setup..."
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose exec backend python manage.py migrate
    
    # Create superuser (optional)
    read -p "Do you want to create a superuser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose exec backend python manage.py createsuperuser
    fi
    
    # Collect static files
    log "Collecting static files..."
    docker-compose exec backend python manage.py collectstatic --noinput
    
    # Install frontend dependencies and build
    log "Installing frontend dependencies..."
    docker-compose exec frontend npm install
}

# Show service status
show_status() {
    log "Service status:"
    docker-compose ps
    
    echo
    info "Application URLs:"
    info "Frontend: http://localhost:3000"
    info "Backend API: http://localhost:8000"
    info "Admin Panel: http://localhost:8000/admin"
    info "API Documentation: http://localhost:8000/api/docs/"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check backend
    if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        log "Backend is healthy ✓"
    else
        warn "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "Frontend is healthy ✓"
    else
        warn "Frontend health check failed"
    fi
}

# Main setup function
setup_dev_environment() {
    log "Setting up MyGuide development environment..."
    
    # Pre-setup checks
    check_docker
    check_docker_compose
    
    # Setup environment
    setup_env_file
    create_directories
    
    # Build and start
    build_images
    start_services
    
    # Initial setup
    initial_setup
    
    # Final checks
    health_check
    show_status
    
    log "Development environment setup completed! 🎉"
    echo
    info "To stop the services: docker-compose down"
    info "To view logs: docker-compose logs -f [service_name]"
    info "To rebuild: docker-compose build --no-cache"
}

# Cleanup function
cleanup() {
    log "Cleaning up development environment..."
    
    # Stop and remove containers
    docker-compose down -v
    
    # Remove images
    docker-compose down --rmi all
    
    # Clean up volumes (optional)
    read -p "Do you want to remove all data volumes? This will delete all data! (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        warn "All data volumes have been removed"
    fi
    
    log "Cleanup completed"
}

# Show usage
usage() {
    echo "Usage: $0 [command]"
    echo "Commands:"
    echo "  setup     Set up development environment (default)"
    echo "  cleanup   Clean up development environment"
    echo "  status    Show current status"
    echo "  logs      Show logs for all services"
    echo "  restart   Restart all services"
}

# Show logs
show_logs() {
    docker-compose logs -f
}

# Restart services
restart_services() {
    log "Restarting services..."
    docker-compose restart
    show_status
}

# Main script logic
case "${1:-setup}" in
    setup)
        setup_dev_environment
        ;;
    cleanup)
        cleanup
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    restart)
        restart_services
        ;;
    *)
        usage
        exit 1
        ;;
esac