#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if command -v alembic >/dev/null 2>&1; then
  echo "[startup] Running Alembic migrations..."
  alembic -c "${SCRIPT_DIR}/alembic.ini" upgrade head
  echo "[startup] Alembic migrations complete."
else
  echo "[startup] Error: alembic is not installed or not available on PATH." >&2
  exit 1
fi

# Execute the service command after migrations
exec "$@"
