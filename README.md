# KryptoKE

[![CI](https://github.com/ToshGitonga0/kryptoke/actions/workflows/ci.yml/badge.svg)](https://github.com/ToshGitonga0/kryptoke/actions) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

KryptoKE — full-stack crypto trading app (FastAPI + Next.js). Wallets, orders, MPESA hooks, and a price simulator.

Quick start: docker compose up --build — then visit http://localhost:3000

---

<!-- Hero gallery -->
<p align="center">
  <a href="docs/assets/screenshots/dashboard.png"><img src="docs/assets/screenshots/dashboard-thumb.jpg" alt="Dashboard" width="360" /></a>
  &nbsp;
  <a href="docs/assets/screenshots/dashboard-darkmode.png"><img src="docs/assets/screenshots/dashboard-darkmode-thumb.jpg" alt="Dashboard (dark mode)" width="360" /></a>
  <br />
  <a href="docs/assets/screenshots/portfolio.png"><img src="docs/assets/screenshots/portfolio-thumb.jpg" alt="Portfolio" width="360" /></a>
  &nbsp;
  <a href="docs/assets/screenshots/trade.png"><img src="docs/assets/screenshots/trade-thumb.jpg" alt="Trade" width="360" /></a>
</p>

---

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
## Screenshots

### Gallery

<p float="left">
  <a href="docs/assets/screenshots/dashboard.png"><img src="docs/assets/screenshots/dashboard-thumb.jpg" alt="Dashboard" width="320" /></a>
  <a href="docs/assets/screenshots/dashboard-darkmode.png"><img src="docs/assets/screenshots/dashboard-darkmode-thumb.jpg" alt="Dashboard (dark mode)" width="320" /></a>
  <a href="docs/assets/screenshots/portfolio.png"><img src="docs/assets/screenshots/portfolio-thumb.jpg" alt="Portfolio" width="320" /></a>
  <a href="docs/assets/screenshots/trade.png"><img src="docs/assets/screenshots/trade-thumb.jpg" alt="Trade" width="320" /></a>
</p>

