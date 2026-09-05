# Кабинет на своём сервере

Здесь всё, что нужно, чтобы кабинет работал на вашем хостинге,
без лимитов платформы. Все функции сохраняются: сотрудники, вход по паролю,
двухфакторная защита, объекты, сметы, склад, аренда, договоры, PDF.

Кабинет состоит из двух частей:

- **сервер** — папка `backend`, отвечает за данные (запускается из этой папки);
- **сайт** — папка `src`, то, что видят в браузере (собирается в обычные файлы).

---

## Что нужно от хостинга

- VPS с Linux, от 2 ГБ оперативной памяти;
- домен, направленный на этот сервер;
- установленный Docker (проще всего) либо Python 3.11 и PostgreSQL 14+.

---

## Вариант 1. Через Docker (рекомендуется)

Всё поднимается одной командой вместе с базой данных.

```bash
cd selfhost
cp .env.example .env
nano .env          # впишите DB_PASSWORD и свой домен в CORS_ORIGIN
docker compose up -d --build
```

Проверка, что сервер жив:

```bash
curl http://localhost:8000/health
```

Ответ должен содержать `"status": "ok"` и список из 16 функций.
Таблицы в базе создаются автоматически при первом запуске.

---

## Вариант 2. Без Docker

Понадобится PostgreSQL и Python 3.11.

```bash
cd selfhost
cp .env.example .env
nano .env          # укажите DATABASE_URL от вашей базы
chmod +x start.sh
./start.sh
```

Скрипт сам создаст окружение, применит миграции и запустит сервер.

Чтобы сервер работал постоянно и поднимался после перезагрузки,
оформите его службой systemd — пример в конце файла.

---

## Сборка сайта

Сайт нужно собрать так, чтобы он обращался к вашему серверу, а не к платформе.
В корне проекта создайте файл `.env.production`:

```
VITE_API_BASE=https://api.вашдомен.ru
VITE_SITE_URL=https://вашдомен.ru
```

Затем соберите:

```bash
npm install
npm run build
```

Готовые файлы появятся в папке `dist` — их раздаёт nginx.

Если переменную `VITE_API_BASE` не задать, сайт продолжит работать
через платформу, как раньше. Это удобно для проверки.

---

## Настройка nginx

```nginx
# Сайт
server {
    listen 80;
    server_name вашдомен.ru;
    root /var/www/fixkey/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Сервер данных
server {
    listen 80;
    server_name api.вашдомен.ru;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

Бесплатный SSL-сертификат:

```bash
certbot --nginx -d вашдомен.ru -d api.вашдомен.ru
```

`client_max_body_size 20M` обязателен — иначе не будут загружаться
фото и документы объектов.

---

## Перенос данных с платформы

Выгрузка текущей базы и загрузка в новую:

```bash
pg_dump "СТАРЫЙ_АДРЕС_БАЗЫ" -Fc -f fixkey.dump
pg_restore -d "postgresql://fixkey:ПАРОЛЬ@localhost:5432/fixkey" --no-owner fixkey.dump
```

Файлы (фото, планы, логотипы) хранятся отдельно. Если оставить поля
`S3_ENDPOINT` и `S3_PUBLIC_URL` пустыми, старые файлы продолжат
открываться со ссылок платформы. Для полной независимости подключите
своё хранилище — подойдёт любое S3-совместимое, например Selectel
или Yandex Object Storage.

---

## Обслуживание

Резервная копия базы раз в сутки:

```bash
0 3 * * * docker compose -f /путь/selfhost/docker-compose.yml exec -T db \
  pg_dump -U fixkey fixkey | gzip > /backup/fixkey-$(date +\%F).sql.gz
```

Обновление после правок кода:

```bash
git pull
docker compose up -d --build     # сервер
npm run build                    # сайт
```

Логи сервера:

```bash
docker compose logs -f api
```

---

## Служба systemd (для варианта без Docker)

Файл `/etc/systemd/system/fixkey.service`:

```ini
[Unit]
Description=Кабинет FixKey
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/fixkey/selfhost
ExecStart=/var/www/fixkey/selfhost/start.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

Включение:

```bash
systemctl enable --now fixkey
```

---

## Если что-то не работает

**Сервер не стартует, жалуется на DATABASE_URL** — не заполнен файл `.env`.

**Сайт открывается, но данные не грузятся** — проверьте, что в `.env.production`
указан правильный `VITE_API_BASE`, и сайт пересобран после этого.

**Ошибка доступа в браузере** — впишите свой домен в `CORS_ORIGIN` и перезапустите сервер.

**Не загружаются файлы** — увеличьте `client_max_body_size` в nginx
и проверьте настройки хранилища.
