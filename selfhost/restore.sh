#!/bin/bash
# Восстановление базы FixKey из резервной копии.
# ВНИМАНИЕ: текущие данные будут заменены данными из копии.
#
# Посмотреть список копий:
#   bash /var/www/fixkey/selfhost/restore.sh
# Восстановить конкретную:
#   bash /var/www/fixkey/selfhost/restore.sh /var/backups/fixkey/fixkey-2026-09-06_03-00.sql.gz

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fixkey}"
FILE="$1"

if [ -z "$FILE" ]; then
  echo "Доступные копии (свежие сверху):"
  echo ""
  ls -lht "$BACKUP_DIR"/fixkey-*.sql.gz 2>/dev/null | awk '{print "  " $9 "   " $5}' || {
    echo "  копий пока нет"
    exit 1
  }
  echo ""
  echo "Чтобы восстановить, укажите файл:"
  echo "  bash $APP_DIR/selfhost/restore.sh ПУТЬ_К_ФАЙЛУ"
  exit 0
fi

if [ ! -f "$FILE" ]; then
  echo "ОШИБКА: файл не найден: $FILE"
  exit 1
fi

echo "ВНИМАНИЕ: все текущие данные будут заменены копией от:"
echo "  $FILE"
read -p "Продолжить? Напишите ДА и нажмите Enter: " CONFIRM
[ "$CONFIRM" = "ДА" ] || { echo "Отменено."; exit 0; }

cd "$APP_DIR/selfhost"

echo "--- Делаю страховочную копию текущего состояния"
bash "$APP_DIR/selfhost/backup.sh" || echo "(не удалось, продолжаю)"

echo "--- Восстанавливаю данные"
gunzip -c "$FILE" | docker compose exec -T db psql -U fixkey -d fixkey

echo "--- Перезапускаю сервер"
docker compose restart api

echo ""
echo "=== ГОТОВО: данные восстановлены ==="
