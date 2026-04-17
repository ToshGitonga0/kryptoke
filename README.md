# KryptoKE

KryptoKE is a production-oriented full-stack single-page application for crypto trading built with FastAPI (backend) and Next.js + TypeScript (frontend). The project is tailored for a Kenyan audience and includes a trading simulator, wallet management, orders/escrow flows, MPESA integration hooks, and admin reporting.

This README provides a polished overview and a concise developer installation guide.

## Key features

- Email/password authentication (JWT)
- Account roles: admin, staff, customer
- Wallets, deposits, withdrawals, and MPESA integration hooks
- Order matching and portfolio management
- Price simulator for demo/training
- Responsive frontend built with Next.js, Zustand and React Query

## Tech stack

- Backend: Python 3.11, FastAPI, SQLModel, SQLAlchemy (async), Alembic
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Database: PostgreSQL (recommended for production)
- Dev / infra: Docker Compose, GitHub Actions (CI)

## Prerequisites

- Git
- Python 3.11
- Node 18+ and npm (or pnpm/yarn)
- Docker & Docker Compose (optional, recommended)
- An SSH key configured with GitHub (or use HTTPS)

---

## Quick start (recommended — Docker Compose)

This starts the backend API, Postgres DB, and the frontend in containers.

```bash
# from repo root
docker compose up --build
```

Then visit:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

Stop services:

```bash
docker compose down
```

---

## Local development (without Docker)

### Backend

1. Create and activate a virtual environment:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Copy example env and update values:

```bash
cp .env.example .env
# Edit backend/.env: set SECRET_KEY and DB_* values
```

3. Run migrations and start the dev server:

```bash
# Make sure Postgres is available (local or via Docker)
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend

1. Install deps and run dev server:

```bash
cd ../frontend
npm ci
npm run dev
```

2. If the frontend needs a custom API URL, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Testing & linting

- Backend linting: Ruff (configured in `backend/pyproject.toml`)

```bash
cd backend
pip install ruff
ruff check .
```

- Frontend linting (ESLint):

```bash
cd frontend
npm run lint
```

## CI

There is a GitHub Actions workflow at `.github/workflows/ci.yml` that runs backend lint/tests and frontend build on push/PR.

## Security & secrets

- Do not commit secret files. Use `backend/.env.example` as a template.
- Add production secrets to your host (e.g., GitHub Actions Secrets) for CI and deploy.

## Contributing

See `CONTRIBUTING.md` for contribution guidelines, branch strategy and code style.

## License

MIT — see `LICENSE`.

---

If you'd like, I can also add a CI badge to the top of this README, a short architecture diagram, or deployment instructions for a target provider (Render, Fly, DigitalOcean, etc.).