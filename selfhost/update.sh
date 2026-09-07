#!/bin/bash
# Обновление FixKey на своём сервере.
# Сайт уже собран платформой и лежит в репозитории (папка dist),
# поэтому сервер просто забирает готовое — секунды вместо минут.
#
# Запуск:  bash /var/www/fixkey/selfhost/update.sh

APP_DIR="${APP_DIR:-/var/www/fixkey}"
LOG="/var/log/fixkey-update.log"
DOMAIN="${FIXKEY_DOMAIN:-fixkey.ru}"

exec > >(tee -a "$LOG") 2>&1

echo ""
echo "=== Обновление начато: $(date '+%d.%m.%Y %H:%M') ==="

cd "$APP_DIR" || { echo "ОШИБКА: нет папки $APP_DIR"; exit 1; }

BEFORE=$(git rev-parse --short HEAD 2>/dev/null || echo "?")

echo "--- 1/4 Забираю свежую версию из GitHub"
if ! git fetch --all --quiet 2>&1; then
  echo "ОШИБКА: не удалось связаться с GitHub."
  echo "Проверьте интернет на сервере и адрес репозитория:"
  echo "  git -C $APP_DIR remote -v"
  exit 1
fi

REMOTE=$(git rev-parse --short origin/main 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
  echo "ОШИБКА: ветка main не найдена в репозитории"
  exit 1
fi

echo "    на сервере было: $BEFORE"
echo "    в GitHub сейчас: $REMOTE"

if [ "$BEFORE" = "$REMOTE" ]; then
  echo ""
  echo "=== Сервер уже на последней версии ==="
  echo "Если на сайте всё равно старое — очистите кэш браузера: Ctrl+F5."
  echo "Если не помогло — попробуйте режим инкогнито (Ctrl+Shift+N)."
  exit 0
fi

git reset --hard origin/main --quiet
git clean -fd dist --quiet 2>/dev/null || true
AFTER=$(git rev-parse --short HEAD)
echo "    обновлено до:    $AFTER"

echo "--- 2/4 Проверяю готовую сборку"
if [ ! -f "$APP_DIR/dist/index.html" ]; then
  echo "ОШИБКА: готовой сборки нет в репозитории."
  echo "Откройте проект на poehali.dev, нажмите «Опубликовать»,"
  echo "дождитесь окончания и повторите обновление."
  exit 1
fi

FILES=$(find "$APP_DIR/dist" -type f | wc -l)
echo "    сборка на месте: $FILES файлов"

if ! grep -rq "api.$DOMAIN" "$APP_DIR/dist/assets/" 2>/dev/null; then
  echo "    ВНИМАНИЕ: в сборке не найден адрес api.$DOMAIN —"
  echo "    личный кабинет может не подключиться к серверу."
fi

echo "--- 3/4 Обновляю серверную часть"
cd "$APP_DIR/selfhost"
if ! docker compose build api; then
  echo "ОШИБКА: не удалось пересобрать серверную часть"
  exit 1
fi
docker compose up -d

# Ждём, пока сервер поднимется и применит миграции при старте.
sleep 8

# Подстраховка: если таблицы из новых миграций не появились, применяем вручную.
HAS=$(docker compose exec -T db psql -U "${DB_USER:-fixkey}" -d "${DB_NAME:-fixkey}" -t -A \
  -c "SELECT count(*) FROM information_schema.tables WHERE table_name = 'material_offers';" \
  2>/dev/null | tr -d '[:space:]')
if [ "$HAS" = "0" ]; then
  echo "    обновляю таблицы базы данных"
  docker compose exec -T api python migrate.py 2>&1 | tail -5
fi

echo "--- 4/4 Проверяю сайт"
sleep 5
CODE=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 20 "https://$DOMAIN/" 2>/dev/null || echo "нет ответа")
echo "    сайт отвечает: $CODE"

# Сверяем, что браузеру отдаётся именно свежая сборка.
# Проверяем несколько раз: сразу после обновления сайт пару секунд
# может отдавать прежние файлы, и одна проверка даёт ложную тревогу.
WANT=$(grep -o 'assets/index-[^"]*\.js' "$APP_DIR/dist/index.html" | head -1)
if [ -n "$WANT" ]; then
  GOT=""
  for _ in 1 2 3 4 5 6; do
    GOT=$(curl -sS --max-time 20 "https://$DOMAIN/?c=$$" 2>/dev/null \
      | grep -o 'assets/index-[^"]*\.js' | head -1)
    [ "$WANT" = "$GOT" ] && break
    sleep 5
  done

  if [ "$WANT" = "$GOT" ]; then
    echo "    версия сайта: свежая"
  elif [ -z "$GOT" ]; then
    echo "    версию сайта проверить не удалось — откройте сайт вручную"
  else
    echo "    ВНИМАНИЕ: сайт отдаёт старую версию"
    echo "      ожидалось: $WANT"
    echo "      отдаётся:  $GOT"
    echo "    Обычно помогает перезапуск веб-сервера: systemctl reload nginx"
  fi
fi

# Проверяем, что таблицы из новых миграций действительно создались.
MISSING=$(docker compose exec -T db psql -U "${DB_USER:-fixkey}" -d "${DB_NAME:-fixkey}" -t -A \
  -c "SELECT count(*) FROM information_schema.tables WHERE table_name = 'material_offers';" \
  2>/dev/null | tr -d '[:space:]')
if [ "$MISSING" = "1" ]; then
  echo "    база данных: таблицы обновлены"
elif [ -n "$MISSING" ]; then
  echo "    ВНИМАНИЕ: таблица магазинов не создалась — посмотрите:"
  echo "      docker compose logs api | tail -30"
fi

echo ""
echo "=== ГОТОВО: $(date '+%d.%m.%Y %H:%M') ==="
echo "Версия на сервере: $BEFORE  ->  $AFTER"
echo "Откройте сайт и нажмите Ctrl+F5, чтобы увидеть изменения."