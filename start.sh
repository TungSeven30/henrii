#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$ROOT_DIR/.runtime"
PID_FILE="$RUNTIME_DIR/frontend.pid"
LOG_FILE="$RUNTIME_DIR/frontend.log"
APP_PORT="${APP_PORT:-3101}"

mkdir -p "$RUNTIME_DIR"

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID="$(cat "$PID_FILE")"
  if [[ -n "$EXISTING_PID" ]] && kill -0 "$EXISTING_PID" 2>/dev/null; then
    echo "Frontend is already running (pid: $EXISTING_PID) on port $APP_PORT"
    echo "Log: $LOG_FILE"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

echo "Starting Supabase services..."
(
  cd "$ROOT_DIR"
  npx supabase start >/dev/null
)

echo "Starting Next.js dev server on port $APP_PORT..."
(
  cd "$ROOT_DIR"
  nohup npm run dev -- --port "$APP_PORT" >"$LOG_FILE" 2>&1 &
  echo $! >"$PID_FILE"
)

sleep 1
NEW_PID="$(cat "$PID_FILE")"
if ! kill -0 "$NEW_PID" 2>/dev/null; then
  echo "Failed to start frontend. Check log: $LOG_FILE"
  exit 1
fi

echo "Started."
echo "- Frontend: http://localhost:$APP_PORT"
echo "- Supabase API: http://127.0.0.1:54321"
echo "- Frontend pid: $NEW_PID"
echo "- Log file: $LOG_FILE"
