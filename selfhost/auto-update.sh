#!/bin/bash
# Автообновление: проверяет, появились ли новые правки, и если да — обновляет сайт.
# Запускается сам по расписанию. Вручную запускать не нужно.

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"
LOG="/var/log/fixkey-update.log"
LOCK="/tmp/fixkey-update.lock"

exec 9>"$LOCK"
if ! flock -n 9; then
  echo "$(date '+%d.%m.%Y %H:%M') Обновление уже идёт — пропускаю" >> "$LOG"
  exit 0
fi

cd "$APP_DIR"

git fetch --quiet --all

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "" >> "$LOG"
echo "$(date '+%d.%m.%Y %H:%M') Найдены новые правки — запускаю обновление" >> "$LOG"

bash "$APP_DIR/selfhost/update.sh"
