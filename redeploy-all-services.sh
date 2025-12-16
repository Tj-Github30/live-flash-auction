#!/bin/bash

# Redeploy all services to EKS (build -> push -> rollout restart)
# Runs the per-service scripts in sequence.
#
# Usage:
#   bash redeploy-all-services.sh
#   bash redeploy-all-services.sh --skip-auction --skip-timer
#
# Note: Uses `bash ./script.sh` so individual scripts don't need +x permissions.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${ROOT_DIR}"

SKIP_AUCTION=false
SKIP_BID=false
SKIP_WEBSOCKET=false
SKIP_TIMER=false

for arg in "$@"; do
  case "${arg}" in
    --skip-auction) SKIP_AUCTION=true ;;
    --skip-bid|--skip-bid-processor|--skip-bid-processing) SKIP_BID=true ;;
    --skip-websocket) SKIP_WEBSOCKET=true ;;
    --skip-timer) SKIP_TIMER=true ;;
    -h|--help)
      echo "Usage: bash redeploy-all-services.sh [--skip-auction] [--skip-bid] [--skip-websocket] [--skip-timer]"
      exit 0
      ;;
    *)
      echo "Unknown argument: ${arg}"
      echo "Run: bash redeploy-all-services.sh --help"
      exit 2
      ;;
  esac
done

run() {
  local script="$1"
  if [[ ! -f "${script}" ]]; then
    echo "❌ Missing script: ${script}"
    exit 1
  fi
  echo ""
  echo ">>> Running ${script}"
  bash "${script}"
}

# Order: core API first, then websocket, then supporting services.
if [[ "${SKIP_AUCTION}" == "false" ]]; then run "./redeploy-auction-service.sh"; fi
if [[ "${SKIP_BID}" == "false" ]]; then run "./redeploy-bid-processor-service.sh"; fi
if [[ "${SKIP_WEBSOCKET}" == "false" ]]; then run "./redeploy-websocket-service.sh"; fi
if [[ "${SKIP_TIMER}" == "false" ]]; then run "./redeploy-timer-service.sh"; fi

echo ""
echo "=========================================="
echo "✅ All requested redeployments complete!"
echo "=========================================="


