#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$ROOT_DIR/.runtime"
PID_FILE="$RUNTIME_DIR/frontend.pid"
APP_PORT="${APP_PORT:-3101}"

stop_frontend_from_pid() {
  local pid="$1"

  if [[ -z "$pid" ]]; then
    return
  fi

  if kill -0 "$pid" 2>/dev/null; then
    echo "Stopping frontend pid $pid..."
    kill "$pid" 2>/dev/null || true

    for _ in {1..10}; do
      if ! kill -0 "$pid" 2>/dev/null; then
        break
      fi
      sleep 0.2
    done

    if kill -0 "$pid" 2>/dev/null; then
      echo "Force killing frontend pid $pid..."
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi
}

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID="$(cat "$PID_FILE")"
  stop_frontend_from_pid "$EXISTING_PID"
  rm -f "$PID_FILE"
else
  PORT_PID="$(lsof -ti tcp:"$APP_PORT" || true)"
  if [[ -n "$PORT_PID" ]]; then
    stop_frontend_from_pid "$PORT_PID"
  fi
fi

echo "Stopping Supabase services..."
(
  cd "$ROOT_DIR"
  npx supabase stop >/dev/null || true
)

echo "Stopped."
