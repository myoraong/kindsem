#!/usr/bin/env bash
# Static KindSem preview on :43127.
# Cursor's preview iframe blocks Next.js `next dev` JS, so we serve `out/`.
set -euo pipefail

PORT="${PORT:-43127}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"
URL="http://127.0.0.1:${PORT}/"

up() {
  curl -sf -o /dev/null --max-time 1 "$URL"
}

ensure_out() {
  if [[ ! -f "$OUT/index.html" ]]; then
    echo "out/ missing — building once (this is the slow path)"
    (cd "$ROOT" && npm run build)
  fi
}

kill_listener() {
  local pids
  pids="$(ss -tlnp 2>/dev/null | awk -v p=":${PORT}" '$4 ~ p"$" {print}' | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | sort -u)"
  if [[ -z "${pids}" ]]; then
    pids="$(pgrep -f "http.server ${PORT}" || true)"
  fi
  if [[ -n "${pids}" ]]; then
    # shellcheck disable=SC2086
    kill ${pids} 2>/dev/null || true
    sleep 0.2
  fi
}

serve() {
  ensure_out
  exec python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$OUT"
}

cmd="${1:-ensure}"

case "$cmd" in
  check)
    if up; then
      echo "ok ${URL}"
      exit 0
    fi
    echo "down ${URL}"
    exit 1
    ;;
  ensure)
    if up; then
      echo "already serving ${URL}"
      exit 0
    fi
    serve
    ;;
  serve)
    serve
    ;;
  restart)
    kill_listener
    serve
    ;;
  *)
    echo "usage: $0 [check|ensure|serve|restart]" >&2
    exit 2
    ;;
esac
