#!/usr/bin/env bash
set -euo pipefail

trap 'printf "\n❌ Script failed at line %s\n" "$LINENO"; exit 1' ERR

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
LOG_DIR="$REPO_ROOT/logs"
ENV_FILE="$BACKEND_DIR/.env"

mkdir -p "$LOG_DIR"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

print_step()    { printf "\n${CYAN}${BOLD}▶  %s${NC}\n" "$*"; }
print_info()    { printf "${BLUE}ℹ  %s${NC}\n" "$*"; }
print_success() { printf "${GREEN}✓  %s${NC}\n" "$*"; }
print_warning() { printf "${YELLOW}⚠  %s${NC}\n" "$*"; }
print_error()   { printf "${RED}✗  %s${NC}\n" "$*"; }

command_exists() { command -v "$1" >/dev/null 2>&1; }

# ----------------------------
# 1. PREREQUISITES
# ----------------------------
check_prereqs() {
  print_step "Checking prerequisites"

  local missing=()
  command_exists python3  || missing+=("python3")
  command_exists uv       || missing+=("uv  →  curl -LsSf https://astral.sh/uv/install.sh | sh")
  command_exists node     || missing+=("node 18+")
  command_exists npm      || missing+=("npm")
  command_exists psql     || missing+=("postgresql client (psql)")
  command_exists createdb || missing+=("postgresql client (createdb)")

  if [ ${#missing[@]} -ne 0 ]; then
    print_error "Missing dependencies:"
    printf '  • %s\n' "${missing[@]}"
    exit 1
  fi

  print_success "All prerequisites installed"
}

# ----------------------------
# 2. CONFIG
# ----------------------------
get_config() {
  print_step "Project configuration"

  read -r  -p "DB name [kryptoke]: "       DB_NAME;       DB_NAME=${DB_NAME:-kryptoke}
  read -r  -p "DB user [postgres]: "       DB_USER;       DB_USER=${DB_USER:-postgres}
  read -rsp "DB password: "                DB_PASSWORD;   echo ""
  read -r  -p "DB host [localhost]: "      DB_HOST;       DB_HOST=${DB_HOST:-localhost}
  read -r  -p "DB port [5432]: "           DB_PORT;       DB_PORT=${DB_PORT:-5432}
  read -r  -p "Frontend port [3000]: "     FRONTEND_PORT; FRONTEND_PORT=${FRONTEND_PORT:-3000}
  read -r  -p "Backend port [8000]: "      BACKEND_PORT;  BACKEND_PORT=${BACKEND_PORT:-8000}
  read -r  -p "Token expiry mins [1440]: " TOKEN_EXPIRE;  TOKEN_EXPIRE=${TOKEN_EXPIRE:-1440}
  read -r  -p "Trading fee rate [0.001]: " TRADING_FEE;   TRADING_FEE=${TRADING_FEE:-0.001}

  print_success "Config captured"
}

# ----------------------------
# 3. ENV FILE
# ----------------------------
write_env() {
  print_step "Writing .env"

  SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

  cat > "$ENV_FILE" <<EOF
PROJECT_NAME=KryptoKE
SECRET_KEY="${SECRET_KEY}"
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=${TOKEN_EXPIRE}

DB_HOST="${DB_HOST}"
DB_PORT="${DB_PORT}"
DB_USER="${DB_USER}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_NAME}"

TRADING_FEE_RATE=${TRADING_FEE}
EOF

  print_success ".env written → $ENV_FILE"
}

# ----------------------------
# 4. WAIT FOR POSTGRES
# ----------------------------
wait_for_db() {
  print_step "Waiting for Postgres"

  for i in {1..10}; do
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" >/dev/null 2>&1; then
      print_success "Postgres is ready"
      return
    fi
    printf "  waiting... (%s/10)\n" "$i"
    sleep 2
  done

  print_error "Postgres not ready after 20s — is it running?"
  exit 1
}

# ----------------------------
# 5. DATABASE
# ----------------------------
setup_database() {
  print_step "Setting up database"

  print_info "Creating database '${DB_NAME}'…"
  PGPASSWORD="$DB_PASSWORD" createdb \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
    "$DB_NAME" 2>/dev/null \
    && print_success "Database '${DB_NAME}' created" \
    || print_warning "Database '${DB_NAME}' already exists — continuing"

  print_info "Verifying connection to '${DB_NAME}'…"
  if ! PGPASSWORD="$DB_PASSWORD" psql \
      -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
      -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    print_error "Cannot connect to '${DB_NAME}' — check credentials"
    exit 1
  fi
  print_success "Connection verified"
}

# ----------------------------
# 6. BACKEND
# ----------------------------
setup_and_start_backend() {
  print_step "Backend setup"

  cd "$BACKEND_DIR"

  if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    print_success "venv created"
  fi

  source .venv/bin/activate

  print_info "Installing dependencies (uv sync)…"
  uv sync

  print_info "Running migrations…"
  uv run alembic upgrade head
  print_success "Migrations applied"

  print_info "Seeding database…"
  uv run python seed.py || { print_error "seed.py failed — check output above"; exit 1; }
  print_success "Seed data inserted"

  nohup uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "$BACKEND_PORT" \
    > "$LOG_DIR/backend.log" 2>&1 &

  echo $! > "$LOG_DIR/backend.pid"
  print_success "Backend → http://localhost:${BACKEND_PORT}/docs  (pid $(cat "$LOG_DIR/backend.pid"))"
}

# ----------------------------
# 7. FRONTEND
# ----------------------------
setup_and_start_frontend() {
  print_step "Frontend setup"

  cd "$FRONTEND_DIR"

  if [ ! -d "node_modules" ]; then
    npm install
  fi
  print_success "Frontend deps installed"

  nohup npm run dev \
    > "$LOG_DIR/frontend.log" 2>&1 &

  echo $! > "$LOG_DIR/frontend.pid"
  print_success "Frontend → http://localhost:${FRONTEND_PORT}  (pid $(cat "$LOG_DIR/frontend.pid"))"
}

# ----------------------------
# 8. HEALTH CHECK
# ----------------------------
health_check() {
  print_step "Health check"
  sleep 5

  if curl -sf "http://localhost:$BACKEND_PORT/docs" >/dev/null; then
    print_success "Backend healthy"
  else
    print_warning "Backend may still be starting — check logs/backend.log"
  fi
}

# ----------------------------
# 9. SUMMARY
# ----------------------------
summary() {
  printf "\n"
  print_success "🚀 SYSTEM READY"
  printf "%s\n" "--------------------------------"
  printf "Frontend : http://localhost:%s\n"      "$FRONTEND_PORT"
  printf "Backend  : http://localhost:%s/docs\n" "$BACKEND_PORT"
  printf "Logs     : %s/\n"                      "$LOG_DIR"
  printf "\nStop services:\n"
  printf "  kill \$(cat logs/backend.pid)\n"
  printf "  kill \$(cat logs/frontend.pid)\n"
  printf "%s\n" "--------------------------------"
}

# ----------------------------
# MAIN
# ----------------------------
main() {
  check_prereqs
  get_config
  write_env
  wait_for_db
  setup_database
  setup_and_start_backend
  setup_and_start_frontend
  health_check
  summary
}

main "$@"