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

# Expose port (for health checks)
EXPOSE 8003

# Run timer service (single instance)
CMD ["python", "app/main.py"]
