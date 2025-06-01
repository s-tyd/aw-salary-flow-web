# Salary Flow Web Application

A modern web application for managing employee salary and work data, built with Next.js, FastAPI, and PostgreSQL.

## Tech Stack

- **Frontend**: Next.js 15 with React 18 and TypeScript
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS

## Project Structure

```
aw-salary-flow-web/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts (Auth)
│   │   └── lib/             # Utility libraries
│   └── Dockerfile
├── backend/                 # FastAPI application
│   ├── main.py             # FastAPI app entry point
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── database.py         # Database configuration
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
└── docker-compose.yml      # Development environment
```

## Features

- User authentication with JWT tokens
- Employee management
- Work data tracking
- Expense management
- Responsive UI with Tailwind CSS

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Development with Docker

1. Clone the repository
2. Create environment files:

```bash
# Backend environment
cp backend/.env.example backend/.env
```

3. Start the development environment:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000
- Next.js frontend on port 3000

### Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database configuration

# Start the backend
uvicorn main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /register` - User registration
- `POST /token` - User login (get JWT token)
- `GET /users/me` - Get current user info
- More endpoints will be added for employee and work data management

## Database Models

- **User**: User accounts with authentication
- **Employee**: Employee information
- **WorkData**: Daily work records
- **Expense**: Expense claims and reimbursements

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/salary_flow_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request