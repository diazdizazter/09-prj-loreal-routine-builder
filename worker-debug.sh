#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./worker-debug.sh                 # use worker in wrangler.jsonc
#   ./worker-debug.sh <worker-name>  # tail a specific worker name
#
# Optional:
#   ./worker-debug.sh --format json

if command -v wrangler >/dev/null 2>&1; then
  if [[ $# -gt 0 ]]; then
    wrangler tail "$@"
  else
    wrangler tail --format pretty
  fi
else
  if [[ $# -gt 0 ]]; then
    npx wrangler tail "$@"
  else
    npx wrangler tail --format pretty
  fi
fi
