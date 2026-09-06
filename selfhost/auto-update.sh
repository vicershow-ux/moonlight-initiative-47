#!/bin/bash
# Автообновление: проверяет, появились ли новые правки, и если да — обновляет сайт.
# Запускается сам по расписанию. Вручную запускать не нужно.

APP_DIR="${APP_DIR:-/var/www/fixkey}"
REPO="${FIXKEY_REPO:-https://github.com/vicershow-ux/moonlight-initiative-47.git}"
LOG="/var/log/fixkey-update.log"
LOCK="/tmp/fixkey-update.lock"

log() { echo "$(date '+%d.%m.%Y %H:%M') $*" >> "$LOG"; }

exec 9>"$LOCK"
if ! flock -n 9; then
  log "Обновление уже идёт — пропускаю"
  exit 0
fi

cd "$APP_DIR" || { log "ОШИБКА: нет папки $APP_DIR"; exit 1; }

# Самопроверка адреса репозитория: если сбит или подставлена заглушка — чиним
CURRENT=$(git remote get-url origin 2>/dev/null || echo "")
case "$CURRENT" in
  *ваш-логин*|*your-login*|*USERNAME*|"")
    log "Адрес репозитория был сбит ($CURRENT) — восстанавливаю"
    git remote set-url origin "$REPO" 2>>"$LOG" || git remote add origin "$REPO" 2>>"$LOG"
    ;;
esac

if ! git fetch --quiet --all 2>>"$LOG"; then
  log "ОШИБКА: не удалось связаться с GitHub. Проверьте доступ в сеть и адрес репозитория."
  exit 1
fi

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

if [ -z "$REMOTE" ]; then
  log "ОШИБКА: ветка main не найдена в репозитории"
  exit 1
fi

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "" >> "$LOG"
log "Найдены новые правки — запускаю обновление"

if bash "$APP_DIR/selfhost/update.sh"; then
  log "Обновление завершено успешно"
else
  log "ОШИБКА: обновление не удалось (подробности выше)"
  exit 1
fi
