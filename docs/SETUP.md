# Setup Guide

## Development Environment Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ur-latam-inventory
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Setup database**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Run migrations
   npm run db:migrate
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start development servers**
   
   Terminal 1 - Backend:
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Database Setup

Using PostgreSQL:
```sql
CREATE DATABASE ur_latam_inventory;
```

Then update `.env` with your database URL and run migrations.

## Environment Variables

See `.env.example` files in backend folder for required variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_HOST` - SMTP server for notifications
- `FRONTEND_URL` - Frontend URL for CORS
