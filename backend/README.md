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
- Python 3.8+
- pip
- Virtual environment (recommended)

### Installation

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
   cp .env.example .env
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

For production deployment:
1. Set `DEBUG=False`
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure CORS settings
5. Use environment variables for sensitive data

## Contributing

This project is developed by Slimene Fellah. For collaboration opportunities, please reach out.

## License

This project is proprietary software developed for tourism promotion in Algeria.

---

**Developed & maintained by Slimene Fellah — Available for freelance work at [slimenefellah.dev](https://slimenefellah.dev)**
