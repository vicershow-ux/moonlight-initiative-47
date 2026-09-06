#!/bin/bash
# Резервная копия базы FixKey.
# Сохраняет объекты, сметы, договоры, акты, склад и настройки.
# Копии лежат в /var/backups/fixkey, хранятся 14 дней.
# Ручной запуск:  bash /var/www/fixkey/selfhost/backup.sh

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fixkey}"
KEEP_DAYS="${KEEP_DAYS:-14}"
LOG="/var/log/fixkey-backup.log"

exec > >(tee -a "$LOG") 2>&1

echo ""
echo "=== Копия базы: $(date '+%d.%m.%Y %H:%M') ==="

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR/selfhost"

STAMP=$(date '+%Y-%m-%d_%H-%M')
FILE="$BACKUP_DIR/fixkey-$STAMP.sql.gz"

docker compose exec -T db pg_dump -U fixkey -d fixkey --clean --if-exists \
  | gzip -9 > "$FILE"

SIZE=$(du -h "$FILE" | cut -f1)

if [ ! -s "$FILE" ]; then
  echo "ОШИБКА: копия пустая, база могла быть недоступна"
  rm -f "$FILE"
  exit 1
fi

echo "Копия готова: $FILE ($SIZE)"

DELETED=$(find "$BACKUP_DIR" -name 'fixkey-*.sql.gz' -mtime +$KEEP_DAYS -print -delete | wc -l)
[ "$DELETED" -gt 0 ] && echo "Удалено старых копий: $DELETED"

TOTAL=$(find "$BACKUP_DIR" -name 'fixkey-*.sql.gz' | wc -l)
echo "Всего копий на сервере: $TOTAL"
echo "=== Готово ==="
