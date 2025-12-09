# Setup Guide

## Initial Setup

### 1. Install Prerequisites

- **Node.js 18+**: [Download](https://nodejs.org/)
- **Docker & Docker Compose**: [Download](https://www.docker.com/get-started)
- **Git**: [Download](https://git-scm.com/)

### 2. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Project structure setup"
```

### 3. Create Environment Files

Create `.env` files from the examples:

**Root directory:**
```bash
# Copy and customize as needed
cp .env.example .env
```

**Backend:**
```bash
cd backend
cp .env.example .env
cd ..
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
cd ..
```

### 4. Install Dependencies

**Option A: Using Docker (Recommended)**
```bash
# Start all services
docker-compose up -d

# Install frontend dependencies
docker-compose exec frontend npm install

# Install backend dependencies
docker-compose exec backend npm install
```

**Option B: Local Installation**
```bash
# Frontend
cd frontend
npm install
cd ..

# Backend
cd backend
npm install
cd ..
```

### 5. Start Development Environment

**Using Docker:**
```bash
docker-compose up
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3001
- Frontend on port 3000

**Local Development:**
```bash
# Terminal 1: Start database services
docker-compose up postgres redis

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm start
```

### 6. Verify Setup

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","message":"TaskManager API is running"}`

2. **Frontend:**
   Open http://localhost:3000 in your browser

3. **Database Connection:**
   ```bash
   docker-compose exec postgres psql -U dev -d taskmanager -c "SELECT version();"
   ```

4. **Redis Connection:**
   ```bash
   docker-compose exec redis redis-cli ping
   ```
   Should return: `PONG`

## Next Steps

1. **Run Tests:**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

2. **Check Code Quality:**
   ```bash
   # Backend linting
   cd backend && npm run lint
   
   # Frontend linting
   cd frontend && npm run lint
   ```

3. **Start Development:**
   - Create feature branches from `develop`
   - Follow the [Implementation Plan](../guides/TaskManager-SaaS-Implementation-Plan.md)

## Troubleshooting

### Port Already in Use
If ports 3000, 3001, 5432, or 6379 are already in use:
- Change ports in `docker-compose.yml`
- Or stop the conflicting services

### Docker Issues
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache
```

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check database credentials in `.env` files
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://dev:dev123@postgres:5432/taskmanager
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

