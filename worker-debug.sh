#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./worker-debug.sh                 # use worker in wrangler.jsonc
#   ./worker-debug.sh <worker-name>  # tail a specific worker name
#   
         # login in headless mode (no auto-browser)
#
# Optional:
#   ./worker-debug.sh --format json

if command -v wrangler >/dev/null 2>&1; then
  WRANGLER_CMD=(wrangler)
else
  # -y prevents the npx install confirmation prompt.
  WRANGLER_CMD=(npx -y wrangler@4.80.0)
fi

if [[ "${1:-}" == "--login" ]]; then
  "${WRANGLER_CMD[@]}" login --browser false
  exit 0
fi

if [[ $# -gt 0 ]]; then
  "${WRANGLER_CMD[@]}" tail "$@"
else
  "${WRANGLER_CMD[@]}" tail --format pretty
fi
