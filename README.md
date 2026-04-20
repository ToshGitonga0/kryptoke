# KryptoKE

[![CI](https://github.com/ToshGitonga0/kryptoke/actions/workflows/ci.yml/badge.svg)](https://github.com/ToshGitonga0/kryptoke/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

KryptoKE is a full-stack crypto trading platform built for the Kenyan market. It features JWT auth, role-based access, wallets, order matching, M-Pesa integration hooks, and a price simulator — backed by FastAPI and Next.js.

---

## Screenshots

<table>
  <tr>
    <td align="center">
      <a href="docs/assets/screenshots/dashboard.png">
        <img src="docs/assets/screenshots/dashboard-thumb.jpg" alt="Dashboard" width="360" />
      </a>
      <br/><sub>Dashboard — portfolio overview & market snapshot</sub>
    </td>
    <td align="center">
      <a href="docs/assets/screenshots/dashboard-darkmode.png">
        <img src="docs/assets/screenshots/dashboard-darkmode-thumb.jpg" alt="Dashboard dark mode" width="360" />
      </a>
      <br/><sub>Dashboard — dark mode</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="docs/assets/screenshots/portfolio.png">
        <img src="docs/assets/screenshots/portfolio-thumb.jpg" alt="Portfolio" width="360" />
      </a>
      <br/><sub>Portfolio — holdings and performance</sub>
    </td>
    <td align="center">
      <a href="docs/assets/screenshots/trade.png">
        <img src="docs/assets/screenshots/trade-thumb.jpg" alt="Trade" width="360" />
      </a>
      <br/><sub>Trade — place orders and view order book</sub>
    </td>
  </tr>
</table>

---

## Features

- JWT authentication with email/password
- Role-based access: admin, staff, customer
- Wallets, deposits, withdrawals, and M-Pesa integration hooks
- Order matching and portfolio management
- Price simulator for demo and training
- Responsive UI built with Next.js, Zustand, and React Query

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Backend   | Python 3.11, FastAPI, SQLModel, SQLAlchemy (async), Alembic |
| Frontend  | Next.js 14, TypeScript, Tailwind CSS                |
| Database  | PostgreSQL                                          |
| Infra     | Docker Compose, GitHub Actions CI                   |

---

## Prerequisites

- Git
- Python 3.11+
- Node 18+ and npm
- PostgreSQL (local or via Docker)
- [`uv`](https://github.com/astral-sh/uv) — used to manage and sync backend dependencies

> Docker and Docker Compose are optional but recommended for the simplest setup.

---

## Quick Start — Docker (Recommended)

```bash
docker compose up --build
```

Then visit:

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

To stop:

```bash
docker compose down
```

---

## Quick Start — No Docker (One Command)

If you'd rather run everything locally without Docker, use the quickstart script from the repo root. It will:

1. Check all prerequisites
2. Prompt you for database config and generate a `.env`
3. Create a Python venv and sync backend dependencies with `uv`
4. Create the database if it doesn't exist
5. Run Alembic migrations
6. Seed the database with default users and assets
7. Start the backend and frontend dev servers in the background

```bash
./scripts/quickstart-no-docker.sh
```

When the script completes, it prints the URLs and the commands to stop both servers.

### Default Seed Credentials

| Role     | Email                        | Password        |
|----------|------------------------------|-----------------|
| admin    | admin@kryptoke.co.ke         | Admin@2024!     |
| staff    | staff@kryptoke.co.ke         | Staff@2024!     |
| customer | james.mwangi@gmail.com       | Customer@2024!  |
| customer | aisha.omar@gmail.com         | Customer@2024!  |
| customer | peter.njoroge@yahoo.com      | Customer@2024!  |
| customer | mercy.kamau@gmail.com        | Customer@2024!  |
| customer | brian.otieno@gmail.com       | Customer@2024!  |

---

## Manual Local Setup

If you prefer to run each step yourself:

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
uv sync
cp .env.example .env   # then edit DB_* and SECRET_KEY values
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

If you need a custom API URL, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Dev Runner

After the initial quickstart, use `dev.sh` to manage the servers:

```bash
./scripts/dev.sh start              # start both
./scripts/dev.sh start backend      # backend only
./scripts/dev.sh stop               # stop both (also clears orphaned port processes)
./scripts/dev.sh restart frontend   # restart frontend only
./scripts/dev.sh logs               # tail both logs
./scripts/dev.sh logs backend       # tail backend log only
```

Logs are written to `logs/backend.log` and `logs/frontend.log`.

---

## Testing & Linting

**Backend (Ruff):**

```bash
cd backend
pip install ruff
ruff check .
```

**Frontend (ESLint):**

```bash
cd frontend
npm run lint
```

---

## CI

GitHub Actions runs backend lint/tests and a frontend build on every push and pull request. See `.github/workflows/ci.yml`.

---

## Branching Workflow

Work on feature branches, not directly on `main`:

```bash
git checkout -b feat/your-feature
# make changes, commit
git push -u origin HEAD
# open a PR on GitHub, merge after review
git checkout main && git pull origin main
```

---

## Security

Never commit `.env` files. Use `backend/.env.example` as your template. For production and CI, inject secrets via environment variables or GitHub Actions Secrets.

---

## Contributing

See `CONTRIBUTING.md` for contribution guidelines, branch strategy, and code style.

---

## License

MIT — see `LICENSE`.