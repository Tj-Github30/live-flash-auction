FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy shared dependencies
COPY ../shared /app/shared

# Copy service requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service code
COPY . .

# Set Python path to include shared modules
ENV PYTHONPATH=/app:/app/shared:$PYTHONPATH

# Expose WebSocket port
EXPOSE 8001

# Run with eventlet for WebSocket support
CMD ["python", "app/main.py"]
