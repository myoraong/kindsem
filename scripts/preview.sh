#!/usr/bin/env bash
# Static KindSem preview on :43127 (Node HTTP/1.1).
# Cursor Preview/Start runs `npm start`. Do not use `next dev` / `next start`
# (export has no Next server; iframe also blocks Next dev JS).
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
  pids="$(ss -tlnp 2>/dev/null | awk -v p=":${PORT}" '$4 ~ p {print}' | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | sort -u)"
  if [[ -z "${pids}" ]]; then
    pids="$(pgrep -f "preview-server.mjs|http.server ${PORT}" || true)"
  fi
  if [[ -n "${pids}" ]]; then
    # shellcheck disable=SC2086
    kill ${pids} 2>/dev/null || true
    sleep 0.2
  fi
}

serve() {
  ensure_out
  exec node "$ROOT/scripts/preview-server.mjs"
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
  boot)
    if up; then
      echo "already serving ${URL}"
      exit 0
    fi
    ensure_out
    nohup node "$ROOT/scripts/preview-server.mjs" >/tmp/kindsem-preview.log 2>&1 &
    for _ in 1 2 3 4 5 6 7 8 9 10 11 12; do
      if up; then
        echo "booted ${URL}"
        exit 0
      fi
      sleep 0.25
    done
    echo "failed to boot ${URL}" >&2
    tail -n 40 /tmp/kindsem-preview.log >&2 || true
    exit 1
    ;;
  restart)
    kill_listener
    serve
    ;;
  *)
    echo "usage: $0 [check|ensure|serve|boot|restart]" >&2
    exit 2
    ;;
esac
