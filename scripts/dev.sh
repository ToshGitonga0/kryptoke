#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
LOG_DIR="$REPO_ROOT/logs"

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

# Load ports from existing .env
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  print_error ".env not found — run ./scripts/quickstart.sh first"
  exit 1
fi

BACKEND_PORT=$(grep -E '^BACKEND_PORT=' "$ENV_FILE" | cut -d= -f2 | tr -d '"' || echo "8000")
FRONTEND_PORT=$(grep -E '^FRONTEND_PORT=' "$ENV_FILE" | cut -d= -f2 | tr -d '"' || echo "3000")

# ----------------------------
# BACKEND
# ----------------------------
start_backend() {
  print_step "Starting backend"

  cd "$BACKEND_DIR"
  source .venv/bin/activate

  nohup uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${BACKEND_PORT:-8000}" \
    > "$LOG_DIR/backend.log" 2>&1 &

  echo $! > "$LOG_DIR/backend.pid"
  print_success "Backend → http://localhost:${BACKEND_PORT:-8000}/docs  (pid $(cat "$LOG_DIR/backend.pid"))"
}

stop_backend() {
  # Kill by PID file first
  if [ -f "$LOG_DIR/backend.pid" ]; then
    kill "$(cat "$LOG_DIR/backend.pid")" 2>/dev/null \
      && print_success "Backend stopped (pid file)" \
      || print_warning "Backend PID was stale"
    rm -f "$LOG_DIR/backend.pid"
  fi
  # Kill anything still holding the port (handles orphaned processes)
  local pid
  pid=$(lsof -ti tcp:"${BACKEND_PORT:-8000}" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill $pid 2>/dev/null \
      && print_success "Killed orphaned process on port ${BACKEND_PORT:-8000} (pid $pid)" \
      || print_warning "Could not kill pid $pid"
  else
    print_warning "No process found on port ${BACKEND_PORT:-8000}"
  fi
}

# ----------------------------
# FRONTEND
# ----------------------------
start_frontend() {
  print_step "Starting frontend"

  cd "$FRONTEND_DIR"

  nohup npm run dev \
    > "$LOG_DIR/frontend.log" 2>&1 &

  echo $! > "$LOG_DIR/frontend.pid"
  print_success "Frontend → http://localhost:${FRONTEND_PORT:-3000}  (pid $(cat "$LOG_DIR/frontend.pid"))"
}

stop_frontend() {
  # Kill by PID file first
  if [ -f "$LOG_DIR/frontend.pid" ]; then
    kill "$(cat "$LOG_DIR/frontend.pid")" 2>/dev/null \
      && print_success "Frontend stopped (pid file)" \
      || print_warning "Frontend PID was stale"
    rm -f "$LOG_DIR/frontend.pid"
  fi
  # Kill anything still holding the port (handles orphaned processes)
  local pid
  pid=$(lsof -ti tcp:"${FRONTEND_PORT:-3000}" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill $pid 2>/dev/null \
      && print_success "Killed orphaned process on port ${FRONTEND_PORT:-3000} (pid $pid)" \
      || print_warning "Could not kill pid $pid"
  else
    print_warning "No process found on port ${FRONTEND_PORT:-3000}"
  fi
}

# ----------------------------
# LOGS
# ----------------------------
show_logs() {
  case "${1:-both}" in
    backend)  tail -f "$LOG_DIR/backend.log" ;;
    frontend) tail -f "$LOG_DIR/frontend.log" ;;
    both)     tail -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log" ;;
    *)        print_error "Unknown target: $1. Use backend, frontend, or both" ; exit 1 ;;
  esac
}

# ----------------------------
# USAGE
# ----------------------------
usage() {
  printf "\n${CYAN}${BOLD}KryptoKE Dev Runner${NC}\n\n"
  printf "Usage: %s <command> [target]\n\n" "$(basename "$0")"
  printf "Commands:\n"
  printf "  start   [backend|frontend|both]   Start service(s)   default: both\n"
  printf "  stop    [backend|frontend|both]   Stop service(s)    default: both\n"
  printf "  restart [backend|frontend|both]   Restart service(s) default: both\n"
  printf "  logs    [backend|frontend|both]   Tail logs          default: both\n\n"
  printf "Examples:\n"
  printf "  ./scripts/dev.sh start\n"
  printf "  ./scripts/dev.sh start backend\n"
  printf "  ./scripts/dev.sh stop frontend\n"
  printf "  ./scripts/dev.sh restart both\n"
  printf "  ./scripts/dev.sh logs backend\n\n"
}

# ----------------------------
# MAIN
# ----------------------------
COMMAND="${1:-}"
TARGET="${2:-both}"

case "$COMMAND" in
  start)
    case "$TARGET" in
      backend)  start_backend ;;
      frontend) start_frontend ;;
      both)     start_backend; start_frontend ;;
      *)        print_error "Unknown target: $TARGET"; usage; exit 1 ;;
    esac
    ;;
  stop)
    case "$TARGET" in
      backend)  stop_backend ;;
      frontend) stop_frontend ;;
      both)     stop_backend; stop_frontend ;;
      *)        print_error "Unknown target: $TARGET"; usage; exit 1 ;;
    esac
    ;;
  restart)
    case "$TARGET" in
      backend)  stop_backend;  start_backend ;;
      frontend) stop_frontend; start_frontend ;;
      both)     stop_backend;  stop_frontend; start_backend; start_frontend ;;
      *)        print_error "Unknown target: $TARGET"; usage; exit 1 ;;
    esac
    ;;
  logs)
    show_logs "${TARGET}"
    ;;
  *)
    usage
    exit 1
    ;;
esac