#!/bin/sh
# Запуск сервера кабинета на своём хостинге.
set -e

cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
else
  echo "Нет файла .env — скопируйте .env.example в .env и заполните его"
  exit 1
fi

if [ ! -d .venv ]; then
  echo "Готовлю окружение..."
  python3 -m venv .venv
  .venv/bin/pip install --quiet --upgrade pip
  .venv/bin/pip install --quiet -r requirements.txt
fi

echo "Применяю миграции базы данных..."
.venv/bin/python migrate.py

echo "Запускаю сервер..."
exec .venv/bin/gunicorn \
  --chdir "$(pwd)" \
  --bind "${HOST:-0.0.0.0}:${PORT:-8000}" \
  --workers "${WORKERS:-3}" \
  --timeout "${TIMEOUT:-120}" \
  server:application
