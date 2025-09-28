# MyGuide Backend API

Django REST Framework backend for the MyGuide tourism application.

## Overview

This backend provides a comprehensive REST API for managing tourism data, user authentication, trip planning, and chatbot functionality for Algeria's tourism sector.

## Features

- **Authentication System**: JWT-based authentication with refresh tokens
- **Tourism Management**: CRUD operations for provinces, districts, municipalities, and places
- **Trip Planning**: AI-powered trip recommendation system
- **RAG Chatbot**: Intelligent chatbot for tourism information
- **Admin Dashboard**: Administrative interface for content management
- **User Feedback**: Review and rating system for places

## API Endpoints

---

**Developed & maintained by Slimene Fellah — Available for freelance work at slimenefellah.dev**

### Authentication (`/api/auth/`)
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Tourism (`/api/tourism/`)
- `GET /api/tourism/provinces/` - List all provinces
- `GET /api/tourism/provinces/{id}/` - Get province details
- `GET /api/tourism/districts/` - List districts
- `GET /api/tourism/municipalities/` - List municipalities
- `GET /api/tourism/places/` - List places with filtering
- `GET /api/tourism/places/{id}/` - Get place details
- `POST /api/tourism/places/{id}/feedback/` - Add feedback to a place

### Trip Planner (`/api/trip-planner/`)
- `POST /api/trip-planner/generate/` - Generate trip plan
- `GET /api/trip-planner/plans/` - List user's trip plans
- `GET /api/trip-planner/plans/{id}/` - Get trip plan details
- `PUT /api/trip-planner/plans/{id}/` - Update trip plan
- `DELETE /api/trip-planner/plans/{id}/` - Delete trip plan
- `GET /api/trip-planner/templates/` - List trip templates

### Chatbot (`/api/chatbot/`)
- `POST /api/chatbot/chat/` - Send message to chatbot
- `GET /api/chatbot/conversations/` - List user conversations
- `GET /api/chatbot/conversations/{id}/` - Get conversation history

## Models

### Authentication
- **User**: Extended Django user model with additional fields

### Tourism
- **Province**: Algeria's provinces (wilayas)
- **District**: Districts within provinces
- **Municipality**: Municipalities within districts
- **Place**: Tourist attractions, restaurants, hotels, etc.
- **PlaceImage**: Images associated with places
- **Feedback**: User reviews and ratings

### Trip Planner
- **TripPlan**: User-generated or AI-generated trip plans
- **PlannedActivity**: Individual activities within a trip plan
- **TripPlanTemplate**: Pre-defined trip templates
- **SavedTripPlan**: User's saved trip plans

### Chatbot
- **Conversation**: Chat conversation sessions
- **Message**: Individual messages in conversations
- **KnowledgeBase**: Tourism knowledge base for RAG

## Setup Instructions

### Prerequisites
- Python 3.8+ (for local development)
- Docker & Docker Compose (recommended)
- Git

### Quick Start with Docker (Recommended)

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd myGuide
   ```

2. **Environment setup:**
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose:**
   ```bash
   # Development environment
   docker-compose up -d
   
   # Or use the setup script
   ./scripts/setup-dev.sh
   ```

4. **Run initial setup:**
   ```bash
   # Database migrations
   docker-compose exec backend python manage.py migrate
   
   # Create superuser (optional)
   docker-compose exec backend python manage.py createsuperuser
   
   # Collect static files
   docker-compose exec backend python manage.py collectstatic --noinput
   ```

The API will be available at `http://localhost:8000/`

### Local Development Setup

1. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment setup:**
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

4. **Database setup:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # Optional
   ```

5. **Run development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://127.0.0.1:8000/`

## Configuration

Key environment variables (see `.env.example`):

- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (True/False)
- `DATABASE_URL`: Database connection string
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Frontend URLs for CORS

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://127.0.0.1:8000/docs/`
- ReDoc: `http://127.0.0.1:8000/redoc/`

## Database Schema

View the complete ER diagram: `../docs/er_diagram.png`

To regenerate the ER diagram:
```bash
cd ..
python generate_er_diagram.py
```

## Testing

Run tests:
```bash
python manage.py test
```

## Development

### Code Style
- Follow PEP 8 guidelines
- Use meaningful variable and function names
- Add docstrings to functions and classes

### Adding New Endpoints
1. Define models in `models.py`
2. Create serializers in `serializers.py`
3. Implement views in `views.py`
4. Add URL patterns in `urls.py`
5. Run migrations if models changed

## Deployment

### Docker Production Deployment

1. **Production environment setup:**
   ```bash
   # Copy and configure production environment
   cp .env.template .env
   # Set production values (DEBUG=False, proper database, etc.)
   ```

2. **Deploy with production compose:**
   ```bash
   # Build and start production services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Or use deployment script
   ./scripts/deploy.sh production
   ```

3. **SSL/HTTPS Setup:**
   ```bash
   # Generate SSL certificates
   ./scripts/generate-ssl.sh yourdomain.com production
   
   # Or use Let's Encrypt
   certbot certonly --standalone -d yourdomain.com
   ```

### Manual Production Deployment

For production deployment:
1. Set `DEBUG=False` in environment variables
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving with Nginx
4. Configure CORS settings for your domain
5. Use environment variables for sensitive data
6. Set up SSL/TLS certificates
7. Configure monitoring and logging

### Environment Variables

Key production environment variables:

```bash
# Django settings
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Redis
REDIS_URL=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Security
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
```

### Monitoring and Logging

The application includes comprehensive monitoring setup:

1. **Start monitoring stack:**
   ```bash
   cd monitoring
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

2. **Access monitoring dashboards:**
   - Grafana: `http://localhost:3001` (admin/admin)
   - Prometheus: `http://localhost:9090`
   - Alertmanager: `http://localhost:9093`

3. **View application logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   ```

### CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Automated testing on pull requests
- Security scanning (Snyk, CodeQL, secrets)
- Docker image building and pushing
- Automated deployment to staging/production

Configure the following secrets in your GitHub repository:
- `DOCKER_USERNAME` and `DOCKER_PASSWORD`
- `STAGING_HOST` and `PRODUCTION_HOST`
- `SSH_PRIVATE_KEY` for deployment
- `SLACK_WEBHOOK_URL` for notifications

### Health Checks

The backend includes health check endpoints:
- `GET /health/` - Basic health check
- `GET /health/db/` - Database connectivity
- `GET /health/redis/` - Redis connectivity

### Backup and Recovery

1. **Database backup:**
   ```bash
   # Create backup
   docker-compose exec db pg_dump -U postgres myguide > backup.sql
   
   # Restore backup
   docker-compose exec -T db psql -U postgres myguide < backup.sql
   ```

2. **Automated backups:**
   ```bash
   # Set up cron job for daily backups
   0 2 * * * /path/to/myGuide/scripts/backup.sh
   ```

## Contributing

This project is developed by Slimene Fellah. For collaboration opportunities, please reach out.

## License

This project is proprietary software developed for tourism promotion in Algeria.

---

**Developed & maintained by Slimene Fellah — Available for freelance work at [slimenefellah.dev](https://slimenefellah.dev)**
