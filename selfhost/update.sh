#!/bin/bash
# Обновление сайта FixKey на своём сервере.
# Забирает свежую версию из GitHub, пересобирает сайт и перезапускает сервер.
# Запуск:  bash /var/www/fixkey/selfhost/update.sh

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"
LOG="/var/log/fixkey-update.log"

exec > >(tee -a "$LOG") 2>&1

echo ""
echo "=== Обновление начато: $(date '+%d.%m.%Y %H:%M') ==="

cd "$APP_DIR"

echo "--- 1/4 Забираю свежую версию из GitHub"
git fetch --all
git reset --hard origin/main

if [ ! -f .env.production ]; then
  echo "VITE_API_BASE=https://api.fixkey.ru" > .env.production
  echo "Создан .env.production — проверьте адрес внутри, если домен другой"
fi

echo "--- 2/4 Ставлю зависимости"
npm install --no-audit --no-fund

echo "--- 3/4 Собираю сайт (3-7 минут, это нормально)"
NODE_OPTIONS=--max-old-space-size=3072 npm run build

if ! grep -rqo "$(grep VITE_API_BASE .env.production | cut -d/ -f3)" dist/assets/ 2>/dev/null; then
  echo "ВНИМАНИЕ: адрес сервера не попал в сборку — проверьте .env.production"
fi

echo "--- 4/4 Обновляю серверную часть"
cd "$APP_DIR/selfhost"
docker compose build api
docker compose up -d

echo ""
echo "=== ГОТОВО: $(date '+%d.%m.%Y %H:%M') ==="
echo "Откройте сайт и нажмите Ctrl+F5, чтобы увидеть изменения."
