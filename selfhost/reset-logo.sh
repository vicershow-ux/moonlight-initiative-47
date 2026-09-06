#!/bin/bash
# Убирает логотип, загруженный вручную через кабинет.
#
# Зачем: если в кабинете когда-то загружали свой файл логотипа, он
# сохраняется в базе сервера и перекрывает логотип из проекта. Сколько
# ни обновляй сайт — в шапке остаётся старая картинка.
#
# Скрипт очищает эту запись. Пустое значение означает «брать логотип
# из проекта», то есть текущий, актуальный.
#
# Запуск:  bash /var/www/fixkey/selfhost/reset-logo.sh

APP_DIR="${APP_DIR:-/var/www/fixkey}"
DOMAIN="${FIXKEY_DOMAIN:-fixkey.ru}"
DB_USER="${DB_USER:-fixkey}"
DB_NAME="${DB_NAME:-fixkey}"

cd "$APP_DIR/selfhost" || { echo "ОШИБКА: нет папки $APP_DIR/selfhost"; exit 1; }

echo "=== Убираю старый логотип из настроек ==="
echo ""

echo "--- Сейчас в базе записано:"
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -A -F' | ' \
  -c "SELECT company_id, coalesce(nullif(logo_url,''),'(из проекта)'), coalesce(nullif(favicon_url,''),'(из проекта)') FROM site_settings ORDER BY company_id;" \
  2>/dev/null | sed 's/^/    /' || {
    echo "ОШИБКА: не удалось подключиться к базе."
    echo "Проверьте, запущен ли сервер: docker compose ps"
    exit 1
  }

echo ""
echo "--- Очищаю"
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -q \
  -c "UPDATE site_settings SET logo_url = '', favicon_url = '';" 2>/dev/null

echo "--- Стало:"
docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -t -A -F' | ' \
  -c "SELECT company_id, coalesce(nullif(logo_url,''),'(из проекта)'), coalesce(nullif(favicon_url,''),'(из проекта)') FROM site_settings ORDER BY company_id;" \
  2>/dev/null | sed 's/^/    /'

echo ""
echo "--- Проверяю, что отдаёт сайт"
sleep 2
RESULT=$(curl -sS --max-time 20 "https://api.$DOMAIN/site?resource=public" 2>/dev/null \
  | python3 -c "import sys,json;print(json.load(sys.stdin).get('settings',{}).get('logo_url') or '(из проекта)')" 2>/dev/null \
  || echo "нет ответа")
echo "    логотип: $RESULT"

echo ""
if [ "$RESULT" = "(из проекта)" ]; then
  echo "=== ГОТОВО ==="
  echo "Теперь сайт берёт логотип из проекта."
  echo "Откройте сайт и нажмите Ctrl+F5."
else
  echo "=== Сайт всё ещё отдаёт: $RESULT ==="
  echo "Пришлите эту строку в чат — разберу."
fi