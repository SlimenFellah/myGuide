# MyGuide Frontend

React.js frontend application for MyGuide - AI-powered tourism app for Algeria.

## Built With

- **React 18** with Vite for fast development and building
- **TailwindCSS** for modern, responsive styling
- **Lucide React** for beautiful icons
- **React Router** for client-side routing
- **Context API** for state management

## Features

- **Responsive Design**: Mobile-first approach with TailwindCSS
- **AI Trip Planner**: Interactive trip planning with AI recommendations
- **Interactive Maps**: Real-time visualization of places and routes
- **Chatbot Interface**: RAG-powered tourism assistant
- **User Dashboard**: Personalized user experience
- **Authentication**: JWT-based secure authentication

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized setup)

### Docker Setup (Recommended)

The easiest way to run the frontend is using Docker:

```bash
# From the project root directory
docker-compose up frontend

# Or for development with hot reload
docker-compose -f docker-compose.yml up frontend
```

The frontend will be available at `http://localhost:3000`

### Local Development Setup

If you prefer to run without Docker:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws

# App Configuration
VITE_APP_NAME=MyGuide
VITE_APP_VERSION=1.0.0

# Map Configuration (if using external map services)
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Run tests (if configured)
npm test
```

## Docker Commands

### Development

```bash
# Start frontend in development mode
docker-compose up frontend

# Build frontend image
docker build -t myguide-frontend .

# Run frontend container
docker run -p 3000:80 myguide-frontend
```

### Production

```bash
# Build production image
docker build -f Dockerfile --target production -t myguide-frontend:prod .

# Run production container
docker run -p 80:80 myguide-frontend:prod
```

## Build Process

The frontend uses a multi-stage Docker build:

1. **Development Stage**: Node.js environment for development
2. **Build Stage**: Compiles React app for production
3. **Production Stage**: Nginx serves static files

### Build Configuration

- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **ESLint**: Code linting and formatting

## Nginx Configuration

The production build uses Nginx with:

- Gzip compression enabled
- Static file caching
- SPA routing support (history API fallback)
- Security headers
- Custom error pages

## Development Workflow

1. **Local Development**:
   ```bash
   npm run dev
   ```

2. **Code Quality**:
   ```bash
   npm run lint
   npm run lint:fix
   ```

3. **Build Testing**:
   ```bash
   npm run build
   npm run preview
   ```

4. **Docker Testing**:
   ```bash
   docker-compose up frontend
   ```

## Deployment

### Production Deployment

The frontend is automatically built and deployed through CI/CD pipeline:

1. **GitHub Actions** builds the Docker image
2. **Image** is pushed to container registry
3. **Deployment** updates the production environment

### Manual Deployment

```bash
# Build production image
docker build -f Dockerfile --target production -t myguide-frontend:latest .

# Tag for registry
docker tag myguide-frontend:latest your-registry/myguide-frontend:latest

# Push to registry
docker push your-registry/myguide-frontend:latest
```

## Performance Optimization

- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and CSS optimization
- **Caching**: Browser and CDN caching strategies
- **Bundle Analysis**: Use `npm run build -- --analyze`

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**:
   ```bash
   # Kill process using port 3000
   npx kill-port 3000
   ```

2. **Node modules issues**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Docker build issues**:
   ```bash
   # Clear Docker cache
   docker system prune -a
   ```

### Development Tips

- Use React DevTools browser extension
- Enable source maps in development
- Use Vite's HMR for fast development
- Check browser console for errors
- Use network tab to debug API calls

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

**Developed & maintained by Slimene Fellah — Available for freelance work at [slimenefellah.dev](https://slimenefellah.dev)**
