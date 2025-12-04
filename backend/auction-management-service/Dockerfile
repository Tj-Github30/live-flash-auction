FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
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

# Expose port
EXPOSE 8000

# Run with gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "app.main:app"]
