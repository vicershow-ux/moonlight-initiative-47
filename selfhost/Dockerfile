FROM python:3.11-slim

WORKDIR /app

COPY selfhost/requirements.txt /app/selfhost/requirements.txt
RUN pip install --no-cache-dir -r /app/selfhost/requirements.txt

COPY backend /app/backend
COPY db_migrations /app/db_migrations
COPY selfhost /app/selfhost

WORKDIR /app/selfhost

EXPOSE 8000

CMD ["sh", "-c", "python migrate.py || echo 'Миграции пропущены — см. сообщение выше'; gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 server:application"]