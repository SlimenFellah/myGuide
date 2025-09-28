# MyGuide - AI-Powered Tourism App for Algeria

<!-- 
    Author: Slimene Fellah
    Available for freelance projects
    Contact: [Your contact information]
-->

## Overview
MyGuide is an AI-powered tourism application designed to help tourists explore Algeria by providing personalized trip recommendations, interactive maps, and comprehensive information about provinces, districts, municipalities, and places of interest.

## Features
- **AI Chatbot**: RAG-powered chatbot for tourism information
- **Trip Recommendations**: AI-generated personalized travel plans based on budget and preferences
- **Interactive Maps**: Real-time visualization of places and trip routes
- **User Management**: Normal users and admin roles
- **Place Management**: Comprehensive database of tourist attractions, restaurants, parks, etc.
- **Feedback System**: User reviews and ratings for places

## Tech Stack
- **Frontend**: React.js with Vite, TailwindCSS
- **Backend**: Django REST Framework with JWT authentication
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI/ML**: Integrated chatbot and trip planning services
- **Authentication**: JWT tokens with refresh mechanism
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD
- **Monitoring**: Prometheus, Grafana, Alertmanager
- **Web Server**: Nginx with SSL/TLS support

## Project Structure
```
myGuide/
├── frontend/                    # React.js application with Vite
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── contexts/          # React contexts (Auth, etc.)
│   │   ├── services/          # API service functions
│   │   ├── assets/            # Images, logos, and static files
│   │   └── utils/             # Utility functions
│   ├── Dockerfile             # Multi-stage Docker build
│   ├── nginx.conf             # Nginx configuration
│   └── package.json
├── backend/                     # Django REST API server
│   ├── authentication/        # User authentication app
│   ├── tourism/               # Tourism data management
│   ├── trip_planner/          # AI trip planning features
│   ├── chatbot/               # RAG chatbot implementation
│   ├── myguide_backend/       # Django project settings
│   ├── Dockerfile             # Multi-stage Docker build
│   ├── requirements.txt       # Python dependencies
│   └── manage.py
├── .github/workflows/          # CI/CD pipelines
│   ├── ci.yml                 # Main CI/CD workflow
│   └── security.yml           # Security scanning
├── monitoring/                 # Monitoring stack
│   ├── prometheus.yml         # Prometheus configuration
│   ├── grafana/               # Grafana dashboards
│   ├── alertmanager.yml       # Alert configuration
│   └── docker-compose.monitoring.yml
├── nginx/                      # Nginx configurations
│   ├── ssl.conf               # SSL/TLS settings
│   └── security.conf          # Security headers
├── scripts/                    # Deployment scripts
│   ├── deploy.sh              # Production deployment
│   ├── setup-dev.sh           # Development setup
│   ├── generate-ssl.sh        # SSL certificate generation
│   └── init-db.sql            # Database initialization
├── secrets/                    # Kubernetes secrets template
│   └── secrets-template.yaml
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── .env.template              # Environment variables template
├── docs/                       # Documentation and diagrams
│   └── er_diagram.png         # Database ER diagram
├── generate_er_diagram.py     # Script to generate ER diagram
└── README.md
```

## Color Scheme
- Primary: White (#FFFFFF)
- Accent: Light Blue (#0D6FE5)
- Minimalistic and clean design approach

## Database Schema
The project includes a comprehensive database schema with the following main entities:
- **Users**: Authentication and user management
- **Provinces, Districts, Municipalities**: Administrative divisions of Algeria
- **Places**: Tourist attractions, restaurants, hotels, etc.
- **Trip Plans**: AI-generated travel itineraries
- **Feedbacks**: User reviews and ratings
- **Chatbot**: Knowledge base and conversation history

View the complete ER diagram: `docs/er_diagram.png`

## API Endpoints
The Django REST API provides the following main endpoints:
- `/api/auth/` - Authentication (login, register, refresh tokens)
- `/api/tourism/` - Tourism data (provinces, places, etc.)
- `/api/trip-planner/` - Trip planning and recommendations
- `/api/chatbot/` - RAG chatbot interactions
- `/api/admin/` - Administrative functions

## Quick Start

### Docker Setup (Recommended)

The fastest way to get MyGuide running is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd myGuide

# Copy environment template
cp .env.template .env

# Start the application
docker-compose up -d

# Run database migrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser

# Load sample data (optional)
docker-compose exec backend python manage.py loaddata sample_data.json
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

### Development Setup Script

For automated development environment setup:

```bash
# Make script executable (Linux/Mac)
chmod +x scripts/setup-dev.sh

# Run setup script
./scripts/setup-dev.sh

# Or on Windows
powershell -ExecutionPolicy Bypass -File scripts/setup-dev.ps1
```

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Configuration
DATABASE_URL=postgresql://myguide:password@db:5432/myguide_db

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AI/ML Services
OPENAI_API_KEY=your-openai-key
HUGGINGFACE_API_KEY=your-huggingface-key

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

## Development Workflow

### Local Development

1. **Backend Development**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   python manage.py runserver
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database Operations**:
   ```bash
   # Create migrations
   python manage.py makemigrations
   
   # Apply migrations
   python manage.py migrate
   
   # Create superuser
   python manage.py createsuperuser
   ```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec backend python manage.py migrate
docker-compose exec frontend npm run build

# Stop services
docker-compose down
```

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- SSL certificates (Let's Encrypt recommended)
- Domain name configured
- Server with adequate resources

### Deployment Steps

1. **Server Setup**:
   ```bash
   # Clone repository
   git clone <repository-url>
   cd myGuide
   
   # Copy and configure environment
   cp .env.template .env
   # Edit .env with production values
   ```

2. **SSL Certificate Generation**:
   ```bash
   # Generate SSL certificates
   ./scripts/generate-ssl.sh production your-domain.com
   ```

3. **Deploy Application**:
   ```bash
   # Deploy to production
   ./scripts/deploy.sh production
   
   # Check deployment status
   ./scripts/deploy.sh status
   ```

4. **Verify Deployment**:
   ```bash
   # Check service health
   curl -f http://your-domain.com/api/health/
   
   # View application logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Production Configuration

The production setup includes:

- **Nginx**: Reverse proxy with SSL termination
- **Gunicorn**: WSGI server for Django
- **PostgreSQL**: Production database
- **Redis**: Caching and session storage
- **Celery**: Background task processing
- **Let's Encrypt**: Automatic SSL certificates

## Monitoring and Observability

### Monitoring Stack

Start the monitoring stack:

```bash
# Start monitoring services
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# Access monitoring dashboards
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
# Alertmanager: http://localhost:9093
```

### Key Metrics Monitored

- **Application Performance**: Response times, error rates
- **System Resources**: CPU, memory, disk usage
- **Database**: Connection pools, query performance
- **Infrastructure**: Container health, network metrics

### Alerting

Alerts are configured for:
- High CPU/memory usage (>80%)
- Application downtime
- Database connection issues
- High error rates (>5%)
- Disk space low (<10%)

## CI/CD Pipeline

### GitHub Actions Workflows

The project includes automated CI/CD pipelines:

1. **Continuous Integration** (`.github/workflows/ci.yml`):
   - Code quality checks (ESLint, Black, isort)
   - Security scanning (Snyk, CodeQL)
   - Unit and integration tests
   - Docker image building

2. **Security Scanning** (`.github/workflows/security.yml`):
   - Dependency vulnerability scanning
   - Secret detection
   - Container image scanning
   - License compliance

### Required Secrets

Configure these secrets in your GitHub repository:

```
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
PRODUCTION_HOST=your-production-server
PRODUCTION_USER=deployment-user
PRODUCTION_SSH_KEY=your-private-ssh-key
SLACK_WEBHOOK_URL=your-slack-webhook
```

## Database Management

### Backup and Restore

```bash
# Create backup
docker-compose exec db pg_dump -U myguide myguide_db > backup.sql

# Restore from backup
docker-compose exec -T db psql -U myguide myguide_db < backup.sql

# Automated daily backups
# Add to crontab: 0 2 * * * /path/to/myGuide/scripts/backup-db.sh
```

### Migrations

```bash
# Create new migration
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# View migration status
docker-compose exec backend python manage.py showmigrations
```

## Security

### Security Features

- **HTTPS/TLS**: SSL certificates with strong ciphers
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Authentication**: JWT with refresh tokens
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive data sanitization
- **Secret Management**: Environment-based configuration

### Security Scanning

Regular security scans include:
- Dependency vulnerability scanning
- Container image scanning
- Secret detection in code
- Static application security testing (SAST)

## Performance Optimization

### Backend Optimizations

- **Database**: Query optimization, connection pooling
- **Caching**: Redis for session and query caching
- **Static Files**: CDN integration for media files
- **Background Tasks**: Celery for async processing

### Frontend Optimizations

- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Image compression, minification
- **Caching**: Browser and service worker caching
- **Bundle Analysis**: Webpack bundle analyzer

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check port usage
   netstat -tulpn | grep :8000
   
   # Kill process using port
   sudo kill -9 $(lsof -t -i:8000)
   ```

2. **Docker Issues**:
   ```bash
   # Clean Docker system
   docker system prune -a
   
   # Rebuild containers
   docker-compose build --no-cache
   ```

3. **Database Connection**:
   ```bash
   # Check database status
   docker-compose exec db pg_isready
   
   # Reset database
   docker-compose down -v
   docker-compose up -d db
   ```

### Logs and Debugging

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Django debug mode
# Set DEBUG=True in .env file

# Database query logging
# Add LOGGING configuration in Django settings
```

## Development Status
✅ **Completed Features:**
- Django REST API backend with full CRUD operations
- JWT authentication system
- React frontend with modern UI
- Database models for tourism data
- Trip planning system
- RAG chatbot integration
- Admin dashboard
- Responsive design with TailwindCSS
- Docker containerization
- CI/CD pipeline with GitHub Actions
- Monitoring and alerting system
- Production deployment scripts
- Security configurations
- SSL/TLS setup

## Contributing
This project is developed by Slimene Fellah. For collaboration or freelance opportunities, please reach out.

## License
This project is developed by Slimene Fellah and available for freelance collaboration.

---

**Developed & maintained by Slimene Fellah — Available for freelance work at [slimenefellah.dev](https://slimenefellah.dev)**