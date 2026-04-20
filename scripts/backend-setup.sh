#!/usr/bin/env bash
set -euo pipefail

# Interactive questionnaire-style backend setup for KryptoKE
# - collects DB config interactively
# - creates or reuses .venv
# - optionally runs `uv sync` (if installed)
# - writes a backend/.env file with the provided values
# - runs alembic migrations (optional)
# - optionally starts the uvicorn dev server

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BACKEND_DIR="$REPO_ROOT/backend"
VENV_DIR="$BACKEND_DIR/.venv"
ENV_FILE="$BACKEND_DIR/.env"

NC="\e[0m"
CYAN="\e[36m"
GREEN="\e[32m"
YELLOW="\e[33m"
RED="\e[31m"

print_step() {
  echo -e "\n${CYAN}==> $*${NC}\n"
}

print_warn() { echo -e "${YELLOW}Warning:${NC} $*"; }
print_error() { echo -e "${RED}Error:${NC} $*"; }
print_ok() { echo -e "${GREEN}$*${NC}"; }

get_config() {
  print_step "Project configuration"
  read -r -p "PostgreSQL database name     [kryptoke_db]: " DB_NAME; DB_NAME=${DB_NAME:-kryptoke_db}
  read -r -p "PostgreSQL username          [tosh]: " DB_USER; DB_USER=${DB_USER:-tosh}
  read -rsp "PostgreSQL password (input hidden): " DB_PASSWORD; echo ""
  read -r -p "PostgreSQL host              [localhost]: " DB_HOST; DB_HOST=${DB_HOST:-localhost}
  read -r -p "PostgreSQL port              [5432]: " DB_PORT; DB_PORT=${DB_PORT:-5432}
  echo ""
  echo -e "${CYAN}  Database: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"
  echo ""
  read -r -p "Continue? (y/n) " -n 1 -r; echo ""
  [[ $REPLY =~ ^[Yy]$ ]] || { print_error "Cancelled by user"; exit 1; }
  export DB_NAME DB_USER DB_PASSWORD DB_HOST DB_PORT
}

maybe_create_venv() {
  if [[ ! -d "$VENV_DIR" ]]; then
    read -r -p ".venv not found. Create virtualenv at $VENV_DIR? [Y/n] " create_venv
    if [[ "${create_venv,,}" == "n" ]]; then
      print_error "Please create a virtualenv at $VENV_DIR and re-run this script."
      exit 1
    fi
    python -m venv "$VENV_DIR"
    print_ok "Created virtualenv at $VENV_DIR"
  fi
  echo "To activate the virtualenv in your shell run:"
  echo "  source $VENV_DIR/bin/activate"
  read -r -p "Activate it now in this shell (recommended for running uv sync)? [y/N] " do_activate
  if [[ "${do_activate,,}" == "y" ]]; then
    # shellcheck disable=SC1090
    source "$VENV_DIR/bin/activate"
  fi
}

write_env_file() {
  print_step "Writing .env file"
  if [[ -f "$ENV_FILE" ]]; then
    read -r -p ".env already exists. Back it up to .env.bak? [Y/n] " backup
    if [[ "${backup,,}" != "n" ]]; then
      cp "$ENV_FILE" "$ENV_FILE.bak"
      print_ok "Backed up existing .env -> .env.bak"
    fi
  fi

  # Optionally generate SECRET_KEY
  read -r -p "Generate a random SECRET_KEY for this project? [Y/n] " gen_key
  if [[ "${gen_key,,}" == "n" ]]; then
    read -r -p "Enter SECRET_KEY (leave empty to abort): " SECRET_KEY
    [[ -n "$SECRET_KEY" ]] || { print_error "SECRET_KEY is required"; exit 1; }
  else
    SECRET_KEY=$(python - <<'PY'
import secrets
print(secrets.token_urlsafe(32))
PY
)
    print_ok "Generated SECRET_KEY"
  fi

  # Write values (quote values to be safe)
  {
    echo "SECRET_KEY=\"$SECRET_KEY\""
    echo "DB_NAME=\"$DB_NAME\""
    echo "DB_USER=\"$DB_USER\""
    echo "DB_PASSWORD=\"$DB_PASSWORD\""
    echo "DB_HOST=\"$DB_HOST\""
    echo "DB_PORT=\"$DB_PORT\""
  } > "$ENV_FILE"

  print_ok "Wrote $ENV_FILE"
}

run_uv_sync() {
  if command -v uv >/dev/null 2>&1; then
    read -r -p "Run 'uv sync' to sync backend dependencies? [Y/n] " run_uv
    if [[ "${run_uv,,}" != "n" ]]; then
      print_step "Running: uv sync"
      uv sync
    fi
  else
    print_warn "'uv' not found in PATH. Skipping uv sync."
  fi
}

run_migrations() {
  read -r -p "Run database migrations now (alembic upgrade head)? [Y/n] " do_migrate
  if [[ "${do_migrate,,}" != "n" ]]; then
    print_step "Running migrations"
    alembic upgrade head
  fi
}

start_server() {
  read -r -p "Start uvicorn dev server now? [Y/n] " do_serve
  if [[ "${do_serve,,}" != "n" ]]; then
    print_step "Starting uvicorn"
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  fi
}

main() {
  print_step "KryptoKE backend interactive setup"
  get_config
  maybe_create_venv
  cd "$BACKEND_DIR"
  write_env_file
  run_uv_sync
  run_migrations
  start_server
  print_ok "Setup complete."
}

main "$@"
