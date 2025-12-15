#!/bin/bash
# Run Auction Management Service with correct Python path

cd "$(dirname "$0")"

# Activate venv if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Set PYTHONPATH to include shared directory
export PYTHONPATH="$(pwd)/shared:$(pwd):$PYTHONPATH"

# Run the service
cd auction-management-service
PYTHONPATH="../../shared:../.." python3 -m app.main


