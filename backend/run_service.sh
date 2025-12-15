#!/bin/bash
# Run auction management service with correct Python path

# Get the backend directory (parent of this script)
BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_DIR="$BACKEND_DIR/auction-management-service"

# Set Python path to include shared directory (must be first!)
export PYTHONPATH="$BACKEND_DIR/shared:$BACKEND_DIR:$PYTHONPATH"

echo "🚀 Starting Auction Management Service..."
echo "📁 Backend directory: $BACKEND_DIR"
echo "📁 Service directory: $SERVICE_DIR"
echo "🐍 Python path: $PYTHONPATH"
echo ""

# Change to service directory and run
cd "$SERVICE_DIR" || exit 1

# Run with explicit PYTHONPATH
PYTHONPATH="$BACKEND_DIR/shared:$BACKEND_DIR" python3 -m app.main

