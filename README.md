# KryptoKE

[![CI](https://github.com/ToshGitonga0/kryptoke/actions/workflows/ci.yml/badge.svg)](https://github.com/ToshGitonga0/kryptoke/actions) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

KryptoKE — full-stack crypto trading app (FastAPI + Next.js). Wallets, orders, MPESA hooks, and a price simulator.

Quick start: docker compose up --build — then visit http://localhost:3000

---

<!-- Hero gallery with captions -->
<figure align="center">
  <table>
    <tr>
      <td align="center">
        <a href="docs/assets/screenshots/dashboard.png"><img src="docs/assets/screenshots/dashboard-thumb.jpg" alt="Dashboard" width="360" /></a>
        <figcaption>Dashboard — portfolio overview & market snapshot</figcaption>
      </td>
      <td align="center">
        <a href="docs/assets/screenshots/dashboard-darkmode.png"><img src="docs/assets/screenshots/dashboard-darkmode-thumb.jpg" alt="Dashboard (dark mode)" width="360" /></a>
        <figcaption>Dashboard (dark mode) — alternate theme</figcaption>
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="docs/assets/screenshots/portfolio.png"><img src="docs/assets/screenshots/portfolio-thumb.jpg" alt="Portfolio" width="360" /></a>
        <figcaption>Portfolio — holdings and performance</figcaption>
      </td>
      <td align="center">
        <a href="docs/assets/screenshots/trade.png"><img src="docs/assets/screenshots/trade-thumb.jpg" alt="Trade" width="360" /></a>
        <figcaption>Trade — place orders and view order book</figcaption>
      </td>
    </tr>
  </table>
</figure>

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

Note: this project uses the `uv` tool to manage/sync backend dependencies instead of installing via `pip` directly. Make sure `uv` is available in your environment before following the backend steps below.

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

1. Enter the backend folder, activate the virtual environment, sync dependencies with `uv`, then start the dev server:

```bash
cd backend
source .venv/bin/activate
uv sync
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

If a `.venv` directory doesn't already exist, create one first:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
uv sync
```

2. Copy the example env and update values (if you haven't already):

```bash
cp .env.example .env
# Edit backend/.env: set SECRET_KEY and DB_* values
```

3. Run migrations (make sure Postgres is available locally or via Docker), then start the server if you didn't already:

```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
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

## Screenshots

### Gallery

<p float="left">
  <a href="docs/assets/screenshots/dashboard.png"><img src="docs/assets/screenshots/dashboard-thumb.jpg" alt="Dashboard" width="320" /></a>
  <a href="docs/assets/screenshots/dashboard-darkmode.png"><img src="docs/assets/screenshots/dashboard-darkmode-thumb.jpg" alt="Dashboard (dark mode)" width="320" /></a>
  <a href="docs/assets/screenshots/portfolio.png"><img src="docs/assets/screenshots/portfolio-thumb.jpg" alt="Portfolio" width="320" /></a>
  <a href="docs/assets/screenshots/trade.png"><img src="docs/assets/screenshots/trade-thumb.jpg" alt="Trade" width="320" /></a>
</p>

