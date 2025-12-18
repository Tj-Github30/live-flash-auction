#!/usr/bin/env bash
set -euo pipefail

# Reset auctions data for the live-flash-auction project.
#
# What it does:
# - Deletes ALL rows from Postgres `auctions` table (users are untouched)
# - Optionally clears Redis auction keys (best-effort, if redis-cli exists in the pod)
# - Optionally clears DynamoDB bid history table (requires aws cli + perms; optional)
#
# Usage examples:
#   ./reset-auctions.sh
#   ./reset-auctions.sh --namespace default
#   ./reset-auctions.sh --namespace default --also-clear-redis
#

NAMESPACE="default"
ALSO_CLEAR_REDIS="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --namespace)
      NAMESPACE="$2"
      shift 2
      ;;
    --also-clear-redis)
      ALSO_CLEAR_REDIS="true"
      shift
      ;;
    *)
      echo "Unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

echo "Using namespace: ${NAMESPACE}"

# Find a pod that can reach Postgres and has DATABASE_URL env (auction-management is ideal)
# Try common label conventions first, then fall back to matching the pod name.
POD="$(
  kubectl get pods -n "${NAMESPACE}" -l app=auction-management-service -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true
)"
if [[ -z "${POD}" ]]; then
  POD="$(
    kubectl get pods -n "${NAMESPACE}" -l app=auction-management -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || true
  )"
fi
if [[ -z "${POD}" ]]; then
  POD="$(
    kubectl get pods -n "${NAMESPACE}" --no-headers 2>/dev/null | awk '/auction-management-service/ {print $1; exit}'
  )"
fi
if [[ -z "${POD}" ]]; then
  echo "Could not find an auction-management pod in namespace ${NAMESPACE}." >&2
  echo "Try: kubectl get pods -n ${NAMESPACE}" >&2
  exit 1
fi

echo "Using pod: ${POD}"

echo "Resetting Postgres auctions table..."
kubectl exec -n "${NAMESPACE}" "${POD}" -- sh -lc '
  set -e
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL not set in pod" >&2
    exit 1
  fi
  if ! command -v psql >/dev/null 2>&1; then
    echo "psql not installed in this container. (Either install it in the image or run this from a utility pod.)" >&2
    exit 1
  fi
  echo "Running TRUNCATE auctions..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 << "SQL"
BEGIN;
TRUNCATE TABLE auctions RESTART IDENTITY CASCADE;
COMMIT;
SQL
  echo "Done."
'

if [[ "${ALSO_CLEAR_REDIS}" == "true" ]]; then
  echo "Clearing Redis auction keys (best-effort)..."
  kubectl exec -n "${NAMESPACE}" "${POD}" -- sh -lc '
    set -e
    if ! command -v redis-cli >/dev/null 2>&1; then
      echo "redis-cli not installed in this container; skipping Redis cleanup."
      exit 0
    fi
    if [ -z "${REDIS_URL:-}" ]; then
      echo "REDIS_URL not set; skipping Redis cleanup."
      exit 0
    fi
    # Extract host/port from REDIS_URL (assumes redis://host:port/db)
    HOST=$(echo "$REDIS_URL" | sed -E "s#redis://([^:/]+).*#\\1#")
    PORT=$(echo "$REDIS_URL" | sed -E "s#redis://[^:/]+:([0-9]+).*#\\1#")
    echo "Redis: ${HOST}:${PORT}"
    # Delete keys by prefix (auction:*). Use SCAN to avoid blocking Redis.
    cursor=0
    while :; do
      out=$(redis-cli -h "$HOST" -p "$PORT" SCAN "$cursor" MATCH "auction:*" COUNT 1000)
      cursor=$(echo "$out" | head -n1)
      keys=$(echo "$out" | tail -n +2)
      if [ -n "$keys" ]; then
        echo "$keys" | xargs -r redis-cli -h "$HOST" -p "$PORT" DEL >/dev/null
      fi
      [ "$cursor" = "0" ] && break
    done
    echo "Redis cleanup done."
  '
fi

echo "✅ Auctions reset complete."


