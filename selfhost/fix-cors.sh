#!/bin/bash
# Чинит вход в личный кабинет.
# Проблема: сервер добавляет свой заголовок разрешения поверх того,
# который уже отдаёт функция. Они склеиваются в «*https://fixkey.ru»,
# браузер считает это ошибкой и не пускает в кабинет.
# Решение: убрать заголовки на стороне сервера — функции отдают их сами.
#
# Запуск:  bash /var/www/fixkey/selfhost/fix-cors.sh

set -e

CONF="/etc/nginx/sites-available/fixkey"
DOMAIN="${FIXKEY_DOMAIN:-fixkey.ru}"
API="api.$DOMAIN"
BACKUP="$CONF.bak-cors-$(date +%Y%m%d-%H%M%S)"

if [ ! -f "$CONF" ]; then
  echo "ОШИБКА: не найдена настройка сайта: $CONF"
  exit 1
fi

echo "=== Чиню вход в кабинет ==="
echo ""
echo "--- Было (заголовок разрешения):"
curl -sS -i --max-time 15 "https://$API/site?resource=public" \
  -H "Origin: https://$DOMAIN" 2>/dev/null \
  | grep -i "access-control-allow-origin" || echo "  (не отвечает)"

cp "$CONF" "$BACKUP"
echo ""
echo "--- Копия старой настройки: $BACKUP"

echo "--- 1/3 Убираю лишние заголовки"
python3 - "$CONF" "$API" <<'PY'
import re, sys

path, api_host = sys.argv[1], sys.argv[2]
conf = open(path, encoding='utf-8').read()

# Убираем все add_header Access-Control-* внутри блоков api-домена
before = conf
conf = re.sub(r'[ \t]*add_header\s+[\'"]?Access-Control-[^\n;]*;[ \t]*\n', '', conf)

# Убираем ручную обработку OPTIONS (функции делают это сами)
conf = re.sub(
    r'[ \t]*if\s*\(\s*\$request_method\s*=\s*[\'"]?OPTIONS[\'"]?\s*\)\s*\{[^{}]*\}\s*\n',
    '', conf)

# Гарантируем, что заголовки от функции доходят без изменений
if 'proxy_pass_header' not in conf:
    conf = conf.replace(
        'proxy_pass http://127.0.0.1:8000;',
        'proxy_pass http://127.0.0.1:8000;\n        proxy_pass_header Access-Control-Allow-Origin;')

if conf == before and 'proxy_pass_header' in before:
    print('Лишних заголовков не найдено — настройка уже чистая')
else:
    open(path, 'w', encoding='utf-8').write(conf)
    print('Настройка очищена')
PY

echo "--- 2/3 Проверяю"
if ! nginx -t; then
  echo "ОШИБКА в настройке — возвращаю прежнюю"
  cp "$BACKUP" "$CONF"
  nginx -t
  exit 1
fi

echo "--- 3/3 Применяю"
systemctl reload nginx
sleep 2

echo ""
echo "--- Стало (заголовок разрешения):"
RESULT=$(curl -sS -i --max-time 15 "https://$API/site?resource=public" \
  -H "Origin: https://$DOMAIN" 2>/dev/null \
  | grep -i "access-control-allow-origin" || echo "")
echo "  ${RESULT:-(не отвечает)}"

echo ""
case "$RESULT" in
  *"*"*"http"*)
    echo "=== ЗАГОЛОВОК ВСЁ ЕЩЁ СКЛЕЕН ==="
    echo "Пришлите в чат строку выше — разберу."
    exit 1
    ;;
  *)
    echo "=== ГОТОВО ==="
    echo "Откройте сайт, нажмите Ctrl+F5 и войдите в кабинет."
    ;;
esac
