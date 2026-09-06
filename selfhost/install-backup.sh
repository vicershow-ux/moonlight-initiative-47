#!/bin/bash
# Включает ежедневное резервное копирование базы. Запустить один раз:
#   bash /var/www/fixkey/selfhost/install-backup.sh

set -e

APP_DIR="${APP_DIR:-/var/www/fixkey}"

chmod +x "$APP_DIR/selfhost/backup.sh" "$APP_DIR/selfhost/restore.sh"
mkdir -p /var/backups/fixkey

cat > /etc/systemd/system/fixkey-backup.service <<EOF
[Unit]
Description=Резервная копия базы FixKey
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/nice -n 15 /bin/bash $APP_DIR/selfhost/backup.sh
TimeoutStartSec=1800
EOF

cat > /etc/systemd/system/fixkey-backup.timer <<EOF
[Unit]
Description=Ежедневная копия базы FixKey в 03:30

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true
Unit=fixkey-backup.service

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now fixkey-backup.timer

echo ""
echo "--- Делаю первую копию прямо сейчас"
bash "$APP_DIR/selfhost/backup.sh"

echo ""
echo "=== Резервное копирование включено ==="
echo "Копия создаётся каждую ночь в 03:30, хранится 14 дней."
echo "Папка с копиями: /var/backups/fixkey"
echo ""
echo "Посмотреть список копий:"
echo "  bash $APP_DIR/selfhost/restore.sh"
echo ""
systemctl list-timers fixkey-backup.timer --no-pager
