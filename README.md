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
│   └── package.json
├── backend/                     # Django REST API server
│   ├── authentication/        # User authentication app
│   ├── tourism/               # Tourism data management
│   ├── trip_planner/          # AI trip planning features
│   ├── chatbot/               # RAG chatbot implementation
│   ├── myguide_backend/       # Django project settings
│   ├── requirements.txt       # Python dependencies
│   └── manage.py
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

## Getting Started

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Generate ER Diagram
To regenerate the database ER diagram:
```bash
python generate_er_diagram.py
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

## Contributing
This project is developed by Slimene Fellah. For collaboration or freelance opportunities, please reach out.

## License
This project is developed by Slimene Fellah and available for freelance collaboration.

---

**Developed & maintained by Slimene Fellah — Available for freelance work at [slimenefellah.dev](https://slimenefellah.dev)**