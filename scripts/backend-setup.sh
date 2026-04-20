#!/usr/bin/env bash
set -euo pipefail

# Simple interactive backend setup for KryptoKE
# - creates .venv if missing
# - activates venv for the current shell (prints instructions)
# - runs "uv sync"
# - copies .env.example to .env if missing
# - runs alembic upgrade head
# - starts uvicorn

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BACKEND_DIR="$REPO_ROOT/backend"
VENV_DIR="$BACKEND_DIR/.venv"

echo "This script will guide you through a simple local backend setup for KryptoKE."
read -r -p "Proceed? [y/N] " proceed
if [[ "${proceed,,}" != "y" ]]; then
  echo "Aborted."
  exit 0
fi

if [[ ! -d "$VENV_DIR" ]]; then
  read -r -p ".venv not found. Create virtualenv at $VENV_DIR? [Y/n] " create_venv
  if [[ "${create_venv,,}" == "n" ]]; then
    echo "Please create a virtualenv at $VENV_DIR and re-run this script." 
    exit 1
  fi
  python -m venv "$VENV_DIR"
  echo "Created virtualenv at $VENV_DIR"
fi

echo "To activate the virtualenv in your shell run:"
echo "  source $VENV_DIR/bin/activate"

read -r -p "Activate it now in this shell (recommended for running uv sync)? [y/N] " do_activate
if [[ "${do_activate,,}" == "y" ]]; then
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate"
fi

cd "$BACKEND_DIR"

if ! command -v uv >/dev/null 2>&1; then
  echo "Warning: 'uv' not found in PATH. If you intend to use 'uv', install it before continuing." 
  read -r -p "Continue without running 'uv sync'? [y/N] " cont_no_uv
  if [[ "${cont_no_uv,,}" != "y" ]]; then
    echo "Aborted. Install 'uv' and re-run this script." 
    exit 1
  fi
else
  echo "Running: uv sync"
  uv sync
fi

if [[ ! -f ".env" && -f ".env.example" ]]; then
  read -r -p ".env not found. Copy .env.example -> .env? [Y/n] " copy_env
  if [[ "${copy_env,,}" != "n" ]]; then
    cp .env.example .env
    echo "Copied .env.example to .env — please edit backend/.env to set SECRET_KEY and DB_* values if needed."
  fi
fi

read -r -p "Run database migrations now (alembic upgrade head)? [Y/n] " do_migrate
if [[ "${do_migrate,,}" != "n" ]]; then
  alembic upgrade head
fi

read -r -p "Start uvicorn dev server now? [Y/n] " do_serve
if [[ "${do_serve,,}" != "n" ]]; then
  echo "Starting uvicorn app.main:app on 0.0.0.0:8000"
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
fi

echo "Done."
