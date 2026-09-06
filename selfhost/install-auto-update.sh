#!/bin/bash
# Включает автообновление сайта. Запустить один раз:
#   bash /var/www/fixkey/selfhost/install-auto-update.sh

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"
REPO="${FIXKEY_REPO:-https://github.com/vicershow-ux/moonlight-initiative-47.git}"

echo "--- 1/4 Проверяю адрес репозитория"
cd "$APP_DIR"
CURRENT=$(git remote get-url origin 2>/dev/null || echo "")
case "$CURRENT" in
  *ваш-логин*|*your-login*|*USERNAME*|"")
    echo "Адрес был сбит — прописываю правильный"
    git remote set-url origin "$REPO" 2>/dev/null || git remote add origin "$REPO"
    ;;
  *)
    echo "Адрес в порядке"
    ;;
esac

if ! git fetch --quiet --all 2>/dev/null; then
  echo ""
  echo "ОШИБКА: не удаётся связаться с GitHub."
  echo "Репозиторий закрытый или нет доступа в сеть."
  echo "Автообновление не включено — сначала почините доступ."
  exit 1
fi
echo "Связь с GitHub есть"

echo "--- 2/4 Готовлю скрипты"
chmod +x "$APP_DIR/selfhost/update.sh" "$APP_DIR/selfhost/auto-update.sh"
touch /var/log/fixkey-update.log

# Короткая команда для обновления вручную — показывает весь ход работы
cat > /usr/local/bin/fixkey-update <<EOF
#!/bin/bash
exec /bin/bash $APP_DIR/selfhost/update.sh "\$@"
EOF
chmod +x /usr/local/bin/fixkey-update
echo "Команда fixkey-update готова"

echo "--- 3/4 Настраиваю расписание"
cat > /etc/systemd/system/fixkey-update.service <<EOF
[Unit]
Description=Автообновление сайта FixKey
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=oneshot
WorkingDirectory=$APP_DIR
Environment=FIXKEY_REPO=$REPO
ExecStart=/usr/bin/nice -n 15 /bin/bash $APP_DIR/selfhost/auto-update.sh
TimeoutStartSec=3600
EOF

cat > /etc/systemd/system/fixkey-update.timer <<EOF
[Unit]
Description=Проверка новых правок раз в час

[Timer]
OnBootSec=5min
OnUnitActiveSec=1h
Persistent=true
Unit=fixkey-update.service

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now fixkey-update.timer

echo "--- 4/4 Первый запуск"
systemctl start fixkey-update.service || true
sleep 3

echo ""
echo "=== Автообновление включено ==="
echo "Сервер сам проверяет новую версию раз в час и обновляется."
echo ""
echo "Полезные команды:"
echo "  обновить сейчас    — fixkey-update      (показывает весь ход работы)"
echo "  что было           — tail -30 /var/log/fixkey-update.log"
echo "  выключить          — systemctl disable --now fixkey-update.timer"
echo ""
systemctl list-timers fixkey-update.timer --no-pager