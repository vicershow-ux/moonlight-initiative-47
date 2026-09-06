#!/bin/bash
# Исправляет замечания поисковиков:
#  1. дубли страниц (адрес с косой чертой и без)
#  2. несуществующие страницы должны отдавать код 404, а не 200
# Личный кабинет при этом продолжает работать как раньше.
# Запуск:  bash /var/www/fixkey/selfhost/fix-seo.sh

set -e

DOMAIN="${DOMAIN:-fixkey.ru}"
CONF="/etc/nginx/sites-available/fixkey"

echo "=== Исправление замечаний поисковиков ==="

[ -f "$CONF" ] || { echo "ОШИБКА: не найдена настройка $CONF"; exit 1; }
[ -f /var/www/fixkey/dist/404.html ] || {
  echo "ОШИБКА: страница ошибки не найдена."
  echo "Сначала обновитесь: bash /var/www/fixkey/selfhost/update.sh"
  exit 1
}

BACKUP="$CONF.backup-$(date +%Y%m%d-%H%M)"
cp "$CONF" "$BACKUP"
echo "Старая настройка сохранена: $BACKUP"

echo "--- 1/3 Правлю настройку сайта"

python3 - "$CONF" <<'PY'
import re, sys

path = sys.argv[1]
conf = open(path, encoding='utf-8').read()

block = '''    location /cabinet {
        try_files $uri /index.html;
    }

    location / {
        try_files $uri $uri/index.html =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
'''

old = re.compile(
    r'[ \t]*location /cabinet \{.*?\}\s*'
    r'|[ \t]*error_page 404[^\n]*\n'
    r'|[ \t]*location = /404\.html \{.*?\}\s*'
    r'|[ \t]*location / \{\s*try_files[^\}]*\}\s*',
    re.S)

conf_new = old.sub('', conf)

# Вставляем блок в КАЖДЫЙ server-блок сайта (их два: обычный и защищённый)
conf_new, n = re.subn(
    r'(server\s*\{[^{}]*?root\s+/var/www/fixkey/dist;[^{}]*?index\s+index\.html;[ \t]*\n)',
    lambda m: m.group(1) + '\n' + block + '\n',
    conf_new, flags=re.S)

if n == 0:
    print('НЕ УДАЛОСЬ применить автоматически.')
    print('Поправьте вручную по чек-листу, шаг 9.')
    sys.exit(2)

print(f'Обновлено блоков сайта: {n}')

open(path, 'w', encoding='utf-8').write(conf_new)
print('Настройка обновлена')
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

echo ""
echo "--- Проверка результата"
check() {
  CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "https://$DOMAIN$1" || echo "нет")
  printf '  %-40s %s   (ожидали %s)\n' "$1" "$CODE" "$2"
}
check "/" 200
check "/uslugi" 200
check "/uslugi/elektromontazhnye-raboty" 200
check "/robots.txt" 200
check "/cabinet" 200
check "/takoy-stranicy-net-123" 404

BAD=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "https://$DOMAIN/takoy-stranicy-net-123" || echo "нет")

if [ "$BAD" != "404" ]; then
  echo ""
  echo "=== Несуществующие страницы всё ещё отдают $BAD ==="
  echo "Похоже, сайт обслуживает другая настройка. Проверяю..."
  echo ""
  echo "--- Все настройки с папкой сайта:"
  grep -rl "/var/www/fixkey/dist" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null || echo "  не найдено"
  echo ""
  echo "--- Включённые настройки:"
  ls -l /etc/nginx/sites-enabled/ 2>/dev/null
  echo ""
  echo "Пришлите этот текст в чат — подскажу, что поправить."
  exit 1
fi

echo ""
echo "=== ГОТОВО ==="
echo "Все проверки пройдены."