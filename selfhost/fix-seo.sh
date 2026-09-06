#!/bin/bash
# Убирает дубли страниц в поиске.
# Правит настройку веб-сервера: адреса без косой черты на конце
# перестают переадресовываться, www склеивается с основным доменом.
# Запуск:  bash /var/www/fixkey/selfhost/fix-seo.sh

set -e

DOMAIN="${DOMAIN:-fixkey.ru}"
CONF="/etc/nginx/sites-available/fixkey"

echo "=== Исправление дублей страниц ==="

if [ ! -f "$CONF" ]; then
  echo "ОШИБКА: не найдена настройка веб-сервера $CONF"
  exit 1
fi

cp "$CONF" "$CONF.backup-$(date +%Y%m%d-%H%M)"
echo "Старая настройка сохранена рядом (файл .backup-...)"

echo "--- 1/3 Убираю лишнюю переадресацию"
if grep -q 'try_files \$uri \$uri/ /index.html' "$CONF"; then
  sed -i 's|try_files \$uri \$uri/ /index.html|try_files $uri $uri/index.html /index.html|' "$CONF"
  echo "Готово: /uslugi больше не переадресуется на /uslugi/"
else
  echo "Уже исправлено ранее"
fi

echo "--- 2/3 Проверяю настройку"
nginx -t

echo "--- 3/3 Применяю"
systemctl reload nginx

echo ""
echo "--- Проверка результата"
for P in "" "uslugi" "uslugi/elektromontazhnye-raboty"; do
  CODE=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "https://$DOMAIN/$P" || echo "нет ответа")
  echo "  /$P  →  $CODE"
done

echo ""
echo "=== ГОТОВО ==="
echo "Везде должно быть 200. Если где-то 301 — напишите в чат."
