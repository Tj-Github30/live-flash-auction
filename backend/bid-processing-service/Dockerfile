FROM python:3.11-slim

WORKDIR /app/backend

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

#    Result: /app/backend/shared
#    Result: /app/backend/bid-processing-service
COPY shared shared
COPY bid-processing-service bid-processing-service

# 4. Enter the service directory
WORKDIR /app/backend/bid-processing-service


RUN pip install --no-cache-dir -r requirements.txt


ENV PYTHONPATH="/app/backend:/app/backend/shared:${PYTHONPATH}"

EXPOSE 8002

CMD ["gunicorn", "--bind", "0.0.0.0:8002", "--workers", "4", "--timeout", "60", "app.main:app"]