#!/bin/bash
# Обновление FixKey на своём сервере.
# Сайт уже собран платформой и лежит в репозитории (папка dist),
# поэтому сервер просто забирает готовое — секунды вместо минут,
# без нагрузки на память.
# Запуск:  bash /var/www/fixkey/selfhost/update.sh

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"
LOG="/var/log/fixkey-update.log"

exec > >(tee -a "$LOG") 2>&1

echo ""
echo "=== Обновление начато: $(date '+%d.%m.%Y %H:%M') ==="

cd "$APP_DIR"

echo "--- 1/3 Забираю свежую версию из GitHub"
git fetch --all --quiet
git reset --hard origin/main --quiet
git clean -fd dist --quiet 2>/dev/null || true

echo "--- 2/3 Проверяю готовую сборку"
if [ ! -f "$APP_DIR/dist/index.html" ]; then
  echo "ОШИБКА: готовой сборки нет в репозитории."
  echo "Откройте проект на poehali.dev и нажмите «Опубликовать»,"
  echo "затем повторите обновление."
  exit 1
fi

FILES=$(find "$APP_DIR/dist" -type f | wc -l)
echo "Сборка на месте: $FILES файлов"

if ! grep -rq "api.fixkey.ru" "$APP_DIR/dist/assets/" 2>/dev/null; then
  echo "ВНИМАНИЕ: в сборке не найден адрес api.fixkey.ru —"
  echo "личный кабинет может не подключиться к серверу."
fi

echo "--- 3/3 Обновляю серверную часть"
cd "$APP_DIR/selfhost"
docker compose build api
docker compose up -d

echo ""
echo "=== ГОТОВО: $(date '+%d.%m.%Y %H:%M') ==="
echo "Откройте сайт и нажмите Ctrl+F5, чтобы увидеть изменения."
