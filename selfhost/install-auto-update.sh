#!/bin/bash
# Включает автообновление сайта. Запустить один раз:
#   bash /var/www/fixkey/selfhost/install-auto-update.sh

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"

chmod +x "$APP_DIR/selfhost/update.sh" "$APP_DIR/selfhost/auto-update.sh"

cat > /etc/systemd/system/fixkey-update.service <<EOF
[Unit]
Description=Автообновление сайта FixKey
After=network-online.target docker.service

[Service]
Type=oneshot
WorkingDirectory=$APP_DIR
ExecStart=/bin/bash $APP_DIR/selfhost/auto-update.sh
TimeoutStartSec=3600
EOF

cat > /etc/systemd/system/fixkey-update.timer <<EOF
[Unit]
Description=Проверка новых правок каждые 5 минут

[Timer]
OnBootSec=3min
OnUnitActiveSec=5min
Unit=fixkey-update.service

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now fixkey-update.timer

echo ""
echo "=== Автообновление включено ==="
echo "Сервер проверяет новые правки каждые 5 минут и обновляется сам."
echo ""
systemctl list-timers fixkey-update.timer --no-pager
