FROM python:3.11-slim

WORKDIR /app/backend

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

#    /app/backend/shared
#    /app/backend/auction-management-service
COPY shared shared
COPY auction-management-service auction-management-service

WORKDIR /app/backend/auction-management-service


RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONPATH="/app/backend:/app/backend/shared:${PYTHONPATH}"

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "app.main:app"]