#!/bin/bash
# Чинит вход в личный кабинет.
#
# Причина: в настройках сервера (.env) параметр CORS_ORIGIN склеился
# в «*https://fixkey.ru». Браузер принимает либо «*», либо ровно один
# адрес — склейку он считает ошибкой и отменяет вход в кабинет.
#
# Скрипт чинит .env, убирает дублирующие заголовки в nginx
# и перезапускает серверную часть.
#
# Запуск:  bash /var/www/fixkey/selfhost/fix-cors.sh

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"
CONF="/etc/nginx/sites-available/fixkey"
DOMAIN="${FIXKEY_DOMAIN:-fixkey.ru}"
API="api.$DOMAIN"
STAMP=$(date +%Y%m%d-%H%M%S)

check_header() {
  curl -sS -i --max-time 15 "https://$API/site?resource=public" \
    -H "Origin: https://$DOMAIN" 2>/dev/null \
    | grep -i "access-control-allow-origin" | tr -d '\r' || true
}

echo "=== Чиню вход в кабинет ==="
echo ""
echo "--- Сейчас сервер отвечает:"
BEFORE=$(check_header)
echo "  ${BEFORE:-(нет ответа)}"

# --- 1. Главная причина: значение в .env
echo ""
echo "--- 1/4 Проверяю настройки сервера (.env)"
ENV_FILE="$APP_DIR/selfhost/.env"
[ -f "$ENV_FILE" ] || ENV_FILE="$APP_DIR/.env"

if [ -f "$ENV_FILE" ]; then
  CURRENT=$(grep -E "^CORS_ORIGIN=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs || echo "")
  echo "    было: ${CURRENT:-(не задано)}"

  FIXED="$CURRENT"
  case "$FIXED" in
    \**http*) FIXED="${FIXED#\*}"; FIXED="${FIXED#,}" ;;
  esac
  FIXED=$(echo "$FIXED" | cut -d, -f1 | xargs)
  FIXED="${FIXED%/}"
  [ -z "$FIXED" ] && FIXED="https://$DOMAIN"
  case "$FIXED" in http*) : ;; *) FIXED="https://$DOMAIN" ;; esac

  if [ "$CURRENT" != "$FIXED" ]; then
    cp "$ENV_FILE" "$ENV_FILE.bak-$STAMP"
    if grep -qE "^CORS_ORIGIN=" "$ENV_FILE"; then
      sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=$FIXED|" "$ENV_FILE"
    else
      echo "CORS_ORIGIN=$FIXED" >> "$ENV_FILE"
    fi
    echo "    стало: $FIXED  (копия: $ENV_FILE.bak-$STAMP)"
  else
    echo "    значение корректное"
  fi
else
  echo "    файл .env не найден — пропускаю"
fi

# --- 2. Дублирующие заголовки в nginx
echo "--- 2/4 Убираю дублирующие заголовки в nginx"
if [ -f "$CONF" ]; then
  cp "$CONF" "$CONF.bak-cors-$STAMP"
  python3 - "$CONF" <<'PY'
import re, sys
path = sys.argv[1]
conf = open(path, encoding='utf-8').read()
before = conf
conf = re.sub(r'[ \t]*add_header\s+[\'"]?Access-Control-[^\n;]*;[ \t]*\n', '', conf)
conf = re.sub(
    r'[ \t]*if\s*\(\s*\$request_method\s*=\s*[\'"]?OPTIONS[\'"]?\s*\)\s*\{[^{}]*\}\s*\n',
    '', conf)
if conf != before:
    open(path, 'w', encoding='utf-8').write(conf)
    print('    лишние заголовки убраны')
else:
    print('    настройка уже чистая')
PY
  if nginx -t 2>/dev/null; then
    systemctl reload nginx
  else
    echo "    ОШИБКА в настройке nginx — возвращаю прежнюю"
    cp "$CONF.bak-cors-$STAMP" "$CONF"
    nginx -t
  fi
else
  echo "    настройка nginx не найдена — пропускаю"
fi

# --- 3. Перезапуск серверной части
echo "--- 3/4 Перезапускаю серверную часть"
cd "$APP_DIR/selfhost"
docker compose up -d --force-recreate api >/dev/null 2>&1 || docker compose up -d >/dev/null 2>&1
sleep 6

# --- 4. Проверка
echo "--- 4/4 Проверяю результат"
AFTER=$(check_header)
echo ""
echo "  было:  ${BEFORE:-(нет ответа)}"
echo "  стало: ${AFTER:-(нет ответа)}"
echo ""

VALUE=$(echo "$AFTER" | cut -d: -f2- | xargs)

if [ -z "$AFTER" ]; then
  echo "=== Сервер не ответил на проверку ==="
  echo "Это не всегда ошибка. Откройте сайт, нажмите Ctrl+F5 и войдите."
  echo "Если не пустит — пришлите в чат вывод команды:"
  echo "  curl -sI https://$API/site?resource=public | grep -i access-control"
  exit 0
fi

case "$VALUE" in
  \**http*|*,*)
    echo "=== Значение всё ещё склеено: $VALUE ==="
    echo "Пришлите эту строку в чат — разберу."
    exit 1
    ;;
  *)
    echo "=== ГОТОВО ==="
    echo "Разрешение корректное: $VALUE"
    echo "Откройте сайт, нажмите Ctrl+F5 и войдите в кабинет."
    ;;
esac
