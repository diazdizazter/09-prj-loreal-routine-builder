
set -euo pipefail

#   ./worker-debug.sh                
#   ./worker-debug.sh <worker-name>  
#   ./worker-debug.sh --login
#   ./worker-debug.sh --format json

if command -v wrangler >/dev/null 2>&1; then
  WRANGLER_CMD=(wrangler)
else
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
