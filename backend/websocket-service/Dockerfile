FROM python:3.11-slim

WORKDIR /app/backend

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

#    Result: /app/backend/shared
#    Result: /app/backend/websocket-service
COPY shared shared
COPY websocket-service websocket-service

WORKDIR /app/backend/websocket-service


RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONPATH="/app/backend:/app/backend/shared:${PYTHONPATH}"

EXPOSE 8001

CMD ["python", "app/main.py"]