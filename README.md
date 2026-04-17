# 🌿 KryptoKE — Kenya Crypto Trading Platform

A production-ready full-stack crypto trading SPA built for Kenyan investors.

## Tech Stack
| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | FastAPI (async) · SQLModel · PostgreSQL · Alembic |
| Auth      | JWT (OAuth2PasswordBearer)                      |
| Frontend  | Next.js 14 (App Router) · TypeScript · Tailwind |
| State     | Zustand · React Query                           |
| Charts    | Recharts                                        |
| Deploy    | Docker Compose + Nginx                          |

## Quick Start

```bash
# Backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm run dev
```

Visit: http://localhost:3000 | API Docs: http://localhost:8000/docs

## Default Credentials
| Role     | Email                         | Password         |
|----------|-------------------------------|------------------|
| Admin    | admin@kryptoke.co.ke          | Admin@2024!      |
| Staff    | staff@kryptoke.co.ke          | Staff@2024!      |
| Customer | james.mwangi@gmail.com        | Customer@2024!   |
| Customer | aisha.omar@gmail.com          | Customer@2024!   |

## Generate Typed API Client
```bash
# Start backend first, then:
cd frontend
npm run generate-client
```

## Architecture
```
kryptoke/
├── backend/
│   └── app/
│       ├── models/       # SQLModel database models + Pydantic schemas
│       ├── core/         # Config, security, database, dependencies
│       ├── repos/        # Repository pattern (data access layer)
│       ├── services/     # Business logic layer
│       └── api/routes/   # FastAPI route handlers
└── frontend/
    └── src/
        ├── app/          # Next.js App Router pages
        ├── components/   # Reusable UI components
        ├── lib/          # API clients, Zustand stores, utils
        └── types/        # TypeScript interfaces
```