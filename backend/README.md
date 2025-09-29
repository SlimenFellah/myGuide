# MyGuide Backend API

Django REST Framework backend for the MyGuide tourism application.

## Overview

This backend provides a comprehensive REST API for managing tourism data, user authentication, trip planning, and chatbot functionality for Algeria's tourism sector.

## Features

- **Authentication System**: JWT-based authentication with refresh tokens
- **Tourism Management**: CRUD operations for provinces, districts, municipalities, and places
- **AI-Powered Trip Planning**: Intelligent trip recommendation system with autonomous planning algorithms
- **RAG Chatbot**: Retrieval-Augmented Generation chatbot with LLM integration for tourism information
- **AI Content Moderation**: Machine learning-based spam detection for user-generated content
- **Admin Dashboard**: Administrative interface for content management
- **User Feedback**: Review and rating system for places with AI-powered content filtering
- **Subscription Management**: Stripe-powered subscription system with multiple tiers
- **Payment Processing**: Secure payment handling with Stripe integration

## AI/ML Technologies & Architecture

### 1. Intelligent Trip Planning System (`trip_planner/services.py`)

**Technology Stack:**
- **Autonomous Planning Algorithms**: Multi-criteria decision-making system
- **Machine Learning**: Collaborative filtering and content-based recommendations
- **Data Analytics**: Statistical analysis of user preferences and destination popularity

**Core Components:**

#### TripPlannerAIService
- **Algorithm Type**: Rule-based AI with heuristic optimization
- **Functionality**: 
  - Autonomous trip itinerary generation based on user preferences
  - Multi-dimensional optimization (budget, duration, interests, travel style)
  - Dynamic destination selection using weighted scoring algorithms
  - Intelligent activity distribution across trip days
  - Cost optimization with budget constraint satisfaction

**Technical Implementation:**
```python
# Key AI Features:
- Preference mapping algorithms for trip type to activity matching
- Destination filtering using multi-criteria decision analysis
- Dynamic budget allocation with proportional scaling
- Confidence scoring using weighted feature analysis
- Temporal activity scheduling with constraint satisfaction
```

#### TripRecommendationService
- **Algorithm Type**: Hybrid recommendation system
- **Techniques Used**:
  - **Collaborative Filtering**: User behavior analysis and pattern matching
  - **Content-Based Filtering**: Destination feature matching
  - **Popularity-Based Recommendations**: Trending analysis with temporal weighting
  - **Cold Start Problem Solution**: Default recommendations for new users

### 2. RAG (Retrieval-Augmented Generation) Chatbot (`chatbot/services.py`)

**Technology Stack:**
- **LLM Integration**: Ollama (local) and OpenAI GPT-3.5-turbo (fallback)
- **Vector Search**: TF-IDF vectorization with cosine similarity
- **Knowledge Base**: Structured tourism information retrieval
- **NLP**: Text preprocessing and semantic search

**Core Components:**

#### RAGService
- **Retrieval Method**: TF-IDF vectorization with scikit-learn
- **Similarity Metric**: Cosine similarity for document ranking
- **Features**:
  - Real-time knowledge base vectorization
  - Multi-criteria document filtering (content type, source type)
  - Relevance scoring with configurable thresholds
  - Context length optimization for LLM input

**Technical Implementation:**
```python
# RAG Pipeline:
1. Document Vectorization: TF-IDF with n-gram features (1,2)
2. Query Processing: Real-time query vectorization
3. Similarity Computation: Cosine similarity ranking
4. Context Assembly: Top-k retrieval with length constraints
5. LLM Integration: Context-aware prompt engineering
```

#### ChatbotService
- **LLM Architecture**: Multi-provider support (Ollama/OpenAI)
- **Conversation Management**: Context-aware dialogue with history tracking
- **Fallback System**: Rule-based responses when LLM unavailable
- **Features**:
  - Dynamic prompt engineering with context injection
  - Conversation history management (sliding window)
  - Sentiment analysis for response optimization
  - Suggestion generation using pattern matching

**AI Capabilities:**
- **Natural Language Understanding**: Intent recognition and entity extraction
- **Context Awareness**: Multi-turn conversation handling
- **Knowledge Grounding**: RAG-based factual response generation
- **Personalization**: User preference integration in responses

### 3. AI Content Moderation (`tourism/spam_detection.py`)

**Technology Stack:**
- **Machine Learning**: Pattern recognition and text analysis
- **NLP**: Regular expressions and linguistic feature extraction
- **Classification**: Multi-criteria spam detection with confidence scoring

**Core Components:**

#### SpamDetectionService
- **Algorithm Type**: Rule-based ML with feature engineering
- **Detection Methods**:
  - **Keyword Analysis**: Predefined spam vocabulary matching
  - **Pattern Recognition**: Regex-based suspicious pattern detection
  - **Linguistic Analysis**: Text structure and style analysis
  - **Behavioral Analysis**: Content length and character distribution

**Technical Implementation:**
```python
# Spam Detection Features:
- Multi-category keyword matching (promotional, adult, fake reviews)
- Pattern detection (URLs, emails, phone numbers, money amounts)
- Linguistic heuristics (capital letters, punctuation analysis)
- Content structure analysis (length, repetition patterns)
- Confidence scoring with weighted feature combination
```

**AI Features:**
- **Multi-dimensional Analysis**: 15+ spam indicators with weighted scoring
- **Adaptive Thresholding**: Configurable confidence thresholds
- **Explainable AI**: Detailed reasoning for spam classification
- **Real-time Processing**: Low-latency content analysis

### 4. Machine Learning Data Pipeline

**Data Sources:**
- User interaction data (trip plans, feedback, chat history)
- Tourism content (places, reviews, ratings)
- Behavioral analytics (preferences, search patterns)

**ML Workflows:**
- **Feature Engineering**: User preference extraction and destination profiling
- **Model Training**: Collaborative filtering model updates
- **Real-time Inference**: Dynamic recommendation generation
- **Performance Monitoring**: Confidence scoring and accuracy tracking

### 5. AI System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │────│   Django REST    │────│   AI Services   │
│                 │    │      API         │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                       ┌────────▼────────┐    ┌─────────▼─────────┐
                       │   PostgreSQL    │    │   ML Components   │
                       │   Database      │    │                   │
                       └─────────────────┘    │ • RAG Service     │
                                              │ • Trip Planner AI │
                                              │ • Spam Detection  │
                                              │ • LLM Integration │
                                              └───────────────────┘
```

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

### Subscriptions & Payments
- **SubscriptionPlan**: Available subscription tiers (Free, Premium, Enterprise)
- **UserSubscription**: User's current subscription status and details
- **PaymentHistory**: Record of all payment transactions
- **SubscriptionUsage**: Usage tracking for subscription limits

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

## Stripe Payment Setup

### Prerequisites
1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **API Keys**: Obtain your Stripe API keys from the Stripe Dashboard

### Configuration Steps

1. **Get Stripe API Keys:**
   - Log in to your Stripe Dashboard
   - Navigate to Developers > API keys
   - Copy your **Publishable key** (for frontend) and **Secret key** (for backend)
   - For testing, use test keys (starting with `pk_test_` and `sk_test_`)
   - For production, use live keys (starting with `pk_live_` and `sk_live_`)

2. **Configure Environment Variables:**
   ```bash
   # Add to your .env file
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
   STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here
   ```

3. **Set Up Webhook Endpoint:**
   - In Stripe Dashboard, go to Developers > Webhooks
   - Click "Add endpoint"
   - Set endpoint URL: `https://yourdomain.com/api/subscriptions/webhook/`
   - Select events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `customer.subscription.trial_will_end`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

4. **Create Subscription Products in Stripe:**
   ```bash
   # Example: Create products and prices in Stripe Dashboard
   # Or use Stripe CLI/API to create them programmatically
   
   # Free Plan (no Stripe product needed)
   # Premium Plan
   stripe products create --name="Premium Plan" --description="Premium features access"
   stripe prices create --product=prod_xxx --unit-amount=999 --currency=usd --recurring[interval]=month
   
   # Enterprise Plan  
   stripe products create --name="Enterprise Plan" --description="Full enterprise features"
   stripe prices create --product=prod_yyy --unit-amount=2999 --currency=usd --recurring[interval]=month
   ```

5. **Update Subscription Plans:**
   ```python
   # In Django admin or shell, update SubscriptionPlan models with Stripe price IDs
   from subscriptions.models import SubscriptionPlan
   
   premium = SubscriptionPlan.objects.get(name='Premium')
   premium.stripe_price_id = 'price_xxx'  # From step 4
   premium.save()
   
   enterprise = SubscriptionPlan.objects.get(name='Enterprise')
   enterprise.stripe_price_id = 'price_yyy'  # From step 4
   enterprise.save()
   ```

### Testing Payment Flow

1. **Use Stripe Test Cards:**
   ```
   # Successful payment
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   
   # Declined payment
   Card: 4000 0000 0000 0002
   ```

2. **Test Webhook Events:**
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:8000/api/subscriptions/webhook/
   
   # Trigger test events
   stripe trigger checkout.session.completed
   stripe trigger invoice.payment_succeeded
   ```

### API Endpoints for Payments

```bash
# Get subscription plans
GET /api/subscriptions/plans/

# Get user subscription status  
GET /api/subscriptions/user-subscription/

# Create checkout session
POST /api/subscriptions/create-checkout-session/
{
  "plan_id": 1,
  "success_url": "https://yourapp.com/success",
  "cancel_url": "https://yourapp.com/cancel"
}

# Verify checkout session
POST /api/subscriptions/verify-checkout-session/
{
  "session_id": "cs_test_xxx"
}

# Get payment history
GET /api/subscriptions/payment-history/

# Cancel subscription
POST /api/subscriptions/cancel/

# Upgrade subscription
POST /api/subscriptions/upgrade/
{
  "new_plan_id": 2
}

# Stripe webhook (configured automatically)
POST /api/subscriptions/webhook/
```

### Security Considerations

1. **Environment Variables**: Never commit Stripe keys to version control
2. **Webhook Verification**: Always verify webhook signatures using `STRIPE_WEBHOOK_SECRET`
3. **HTTPS Required**: Stripe requires HTTPS for webhooks in production
4. **Key Rotation**: Regularly rotate your Stripe API keys
5. **Test vs Live**: Use test keys for development, live keys only in production

### Troubleshooting

1. **Webhook Issues:**
   ```bash
   # Check webhook logs in Stripe Dashboard
   # Verify endpoint URL is accessible
   # Ensure correct webhook secret is configured
   ```

2. **Payment Failures:**
   ```bash
   # Check Stripe Dashboard for failed payments
   # Verify customer has valid payment method
   # Check subscription status in database
   ```

3. **Development Testing:**
   ```bash
   # Use Stripe CLI for local webhook testing
   stripe listen --forward-to localhost:8000/api/subscriptions/webhook/
   
   # Check Django logs for payment processing
   python manage.py runserver --verbosity=2
   ```

## Configuration

Key environment variables (see `.env.example`):

- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (True/False)
- `DATABASE_URL`: Database connection string
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Frontend URLs for CORS
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret for secure event handling

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

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

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
