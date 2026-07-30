import json
import os
import hashlib
import secrets
import re
import base64
import uuid
from datetime import datetime, timedelta
import psycopg2
import boto3
import pyotp


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    salt = os.environ.get('AWS_SECRET_ACCESS_KEY', 'fixkey_salt')[:16]
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()


def make_token() -> str:
    return secrets.token_hex(32)


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400'
    }


def response(status: int, body: dict):
    return {
        'statusCode': status,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str)
    }


def get_current_user(cur, event):
    headers = event.get('headers') or {}
    token = headers.get('X-Authorization') or headers.get('x-authorization') or ''
    token = token.replace('Bearer ', '')
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.company_id, u.role, u.full_name FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2], 'full_name': row[3]}


def handle_auth(method, event, conn, cur, action):
    if method == 'POST' and action == 'register':
        body = json.loads(event.get('body') or '{}')
        full_name = (body.get('full_name') or '').strip()
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''
        company_name = (body.get('company_name') or '').strip() or full_name

        if len(full_name) < 2:
            return response(400, {'error': 'Введите имя'})
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return response(400, {'error': 'Некорректный email'})
        if len(password) < 6:
            return response(400, {'error': 'Пароль должен быть не короче 6 символов'})

        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return response(409, {'error': 'Пользователь с таким email уже зарегистрирован'})

        cur.execute("INSERT INTO companies (name) VALUES (%s) RETURNING id", (company_name,))
        company_id = cur.fetchone()[0]

        pwd_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (company_id, full_name, email, password_hash, role) VALUES (%s, %s, %s, %s, 'owner') RETURNING id",
            (company_id, full_name, email, pwd_hash)
        )
        user_id = cur.fetchone()[0]

        token = make_token()
        expires_at = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires_at)
        )
        conn.commit()

        return response(200, {
            'token': token,
            'user': {'id': user_id, 'full_name': full_name, 'email': email, 'role': 'owner', 'company_id': company_id, 'company_name': company_name}
        })

    if method == 'POST' and action == 'login':
        body = json.loads(event.get('body') or '{}')
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''

        cur.execute(
            "SELECT u.id, u.full_name, u.email, u.role, u.company_id, c.name, u.password_hash, u.totp_enabled, u.totp_secret, u.is_active "
            "FROM users u JOIN companies c ON c.id = u.company_id WHERE u.email = %s",
            (email,)
        )
        row = cur.fetchone()
        if not row:
            return response(401, {'error': 'Неверный email или пароль'})

        user_id, full_name, user_email, role, company_id, company_name, stored_hash, totp_enabled, totp_secret, is_active = row

        if stored_hash != hash_password(password):
            return response(401, {'error': 'Неверный email или пароль'})

        if not is_active:
            return response(403, {'error': 'Доступ отключён. Обратитесь к владельцу компании'})

        if totp_enabled:
            challenge_token = make_token()
            expires_at = datetime.utcnow() + timedelta(minutes=10)
            cur.execute(
                "INSERT INTO two_factor_challenges (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user_id, challenge_token, expires_at)
            )
            conn.commit()
            return response(200, {'requires_2fa': True, 'challenge_token': challenge_token})

        token = make_token()
        expires_at = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires_at)
        )
        cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (user_id,))
        conn.commit()

        return response(200, {
            'token': token,
            'user': {'id': user_id, 'full_name': full_name, 'email': user_email, 'role': role, 'company_id': company_id, 'company_name': company_name}
        })

    if method == 'POST' and action == 'verify_2fa':
        body = json.loads(event.get('body') or '{}')
        challenge_token = body.get('challenge_token') or ''
        code = (body.get('code') or '').strip()

        cur.execute(
            "SELECT user_id FROM two_factor_challenges WHERE token = %s AND expires_at > NOW()",
            (challenge_token,)
        )
        row = cur.fetchone()
        if not row:
            return response(401, {'error': 'Сессия подтверждения истекла, войдите заново'})
        user_id = row[0]

        cur.execute(
            "SELECT u.full_name, u.email, u.role, u.company_id, c.name, u.totp_secret "
            "FROM users u JOIN companies c ON c.id = u.company_id WHERE u.id = %s",
            (user_id,)
        )
        urow = cur.fetchone()
        if not urow:
            return response(404, {'error': 'Пользователь не найден'})
        full_name, user_email, role, company_id, company_name, totp_secret = urow

        totp = pyotp.TOTP(totp_secret)
        if not totp.verify(code, valid_window=1):
            return response(401, {'error': 'Неверный код'})

        cur.execute("DELETE FROM two_factor_challenges WHERE token = %s", (challenge_token,))

        token = make_token()
        expires_at = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires_at)
        )
        cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (user_id,))
        conn.commit()

        return response(200, {
            'token': token,
            'user': {'id': user_id, 'full_name': full_name, 'email': user_email, 'role': role, 'company_id': company_id, 'company_name': company_name}
        })

    if method == 'GET' and action == 'me':
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Сессия истекла'})

        cur.execute(
            "SELECT c.name FROM companies c WHERE c.id = %s",
            (user['company_id'],)
        )
        company_row = cur.fetchone()
        company_name = company_row[0] if company_row else ''

        cur.execute("SELECT email, totp_enabled FROM users WHERE id = %s", (user['user_id'],))
        email, totp_enabled = cur.fetchone()

        return response(200, {
            'user': {
                'id': user['user_id'], 'full_name': user['full_name'], 'email': email,
                'role': user['role'], 'company_id': user['company_id'], 'company_name': company_name,
                'totp_enabled': totp_enabled
            }
        })

    return response(404, {'error': 'Неизвестное действие'})


def handle_team(method, event, conn, cur):
    user = get_current_user(cur, event)
    if not user:
        return response(401, {'error': 'Не авторизован'})
    company_id = user['company_id']

    if user['role'] not in ('owner', 'admin', 'employee'):
        return response(403, {'error': 'Недостаточно прав'})

    params = event.get('queryStringParameters') or {}
    member_id = params.get('id')

    if method == 'GET':
        cur.execute(
            "SELECT id, full_name, email, role, phone, created_at, is_active, last_login_at FROM users WHERE company_id = %s ORDER BY created_at DESC",
            (company_id,)
        )
        rows = cur.fetchall()
        keys = ['id', 'full_name', 'email', 'role', 'phone', 'created_at', 'is_active', 'last_login_at']
        members = []
        for r in rows:
            m = dict(zip(keys, r))
            if m['role'] == 'client':
                cur.execute(
                    "SELECT o.id, o.object_code, o.client_name FROM object_access oa JOIN objects o ON o.id = oa.object_id WHERE oa.user_id = %s",
                    (m['id'],)
                )
                obj_keys = ['id', 'object_code', 'client_name']
                m['objects'] = [dict(zip(obj_keys, o)) for o in cur.fetchall()]
            members.append(m)
        return response(200, {'members': members})

    if method == 'POST':
        if user['role'] not in ('owner', 'admin'):
            return response(403, {'error': 'Только владелец или админ могут приглашать людей'})

        body = json.loads(event.get('body') or '{}')
        full_name = (body.get('full_name') or '').strip()
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''
        role = (body.get('role') or 'employee').strip()
        phone = (body.get('phone') or '').strip()
        object_ids = body.get('object_ids') or []

        if role not in ('employee', 'client'):
            return response(400, {'error': 'Недопустимая роль'})
        if len(full_name) < 2:
            return response(400, {'error': 'Введите имя'})
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return response(400, {'error': 'Некорректный email'})
        if len(password) < 6:
            return response(400, {'error': 'Пароль должен быть не короче 6 символов'})
        if role == 'client' and not object_ids:
            return response(400, {'error': 'Выберите хотя бы один объект для заказчика'})

        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return response(409, {'error': 'Пользователь с таким email уже существует'})

        pwd_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (company_id, full_name, email, password_hash, role, phone) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, created_at",
            (company_id, full_name, email, pwd_hash, role, phone)
        )
        new_id, created_at = cur.fetchone()

        if role == 'client':
            for obj_id in object_ids:
                cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (obj_id, company_id))
                if cur.fetchone():
                    cur.execute(
                        "INSERT INTO object_access (user_id, object_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (new_id, obj_id)
                    )

        conn.commit()

        return response(200, {
            'id': new_id, 'full_name': full_name, 'email': email,
            'role': role, 'phone': phone, 'created_at': created_at,
            'is_active': True, 'last_login_at': None
        })

    if method == 'PUT':
        if not member_id:
            return response(400, {'error': 'Не указан id пользователя'})
        if user['role'] not in ('owner', 'admin'):
            return response(403, {'error': 'Недостаточно прав'})

        body = json.loads(event.get('body') or '{}')
        cur.execute("SELECT id, role FROM users WHERE id = %s AND company_id = %s", (member_id, company_id))
        row = cur.fetchone()
        if not row:
            return response(404, {'error': 'Пользователь не найден'})

        if 'object_ids' in body and row[1] == 'client':
            cur.execute("DELETE FROM object_access WHERE user_id = %s", (member_id,))
            for obj_id in body['object_ids']:
                cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (obj_id, company_id))
                if cur.fetchone():
                    cur.execute(
                        "INSERT INTO object_access (user_id, object_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (member_id, obj_id)
                    )
            conn.commit()

        new_password = body.get('password')
        if new_password:
            if len(new_password) < 6:
                return response(400, {'error': 'Пароль должен быть не короче 6 символов'})
            cur.execute(
                "UPDATE users SET password_hash = %s WHERE id = %s AND company_id = %s",
                (hash_password(new_password), member_id, company_id)
            )
            cur.execute("DELETE FROM sessions WHERE user_id = %s", (member_id,))
            conn.commit()

        if 'is_active' in body:
            if row[1] == 'owner':
                return response(400, {'error': 'Нельзя отключить владельца компании'})
            if int(member_id) == user['user_id']:
                return response(400, {'error': 'Нельзя отключить самого себя'})
            new_active = bool(body['is_active'])
            cur.execute(
                "UPDATE users SET is_active = %s WHERE id = %s AND company_id = %s",
                (new_active, member_id, company_id)
            )
            if not new_active:
                cur.execute("DELETE FROM sessions WHERE user_id = %s", (member_id,))
            conn.commit()

        return response(200, {'success': True})

    if method == 'DELETE':
        if not member_id:
            return response(400, {'error': 'Не указан id пользователя'})
        if user['role'] not in ('owner', 'admin'):
            return response(403, {'error': 'Недостаточно прав'})
        if int(member_id) == user['user_id']:
            return response(400, {'error': 'Нельзя удалить самого себя'})

        cur.execute("SELECT role FROM users WHERE id = %s AND company_id = %s", (member_id, company_id))
        row = cur.fetchone()
        if not row:
            return response(404, {'error': 'Пользователь не найден'})
        if row[0] == 'owner':
            return response(400, {'error': 'Нельзя удалить владельца компании'})

        cur.execute("DELETE FROM object_access WHERE user_id = %s", (member_id,))
        cur.execute("DELETE FROM sessions WHERE user_id = %s", (member_id,))
        cur.execute("DELETE FROM users WHERE id = %s AND company_id = %s", (member_id, company_id))
        conn.commit()
        return response(200, {'success': True})

    return response(405, {'error': 'Метод не поддерживается'})


COMPANY_FIELDS = [
    'entity_type', 'contact_full_name', 'phone', 'email', 'website', 'activity_type',
    'inn', 'legal_address', 'bank_name', 'bik', 'account_number', 'bank_inn', 'bank_kpp',
    'correspondent_account', 'estimate_mode', 'currency', 'unit_system', 'signature_url'
]


def handle_company(method, event, conn, cur):
    user = get_current_user(cur, event)
    if not user:
        return response(401, {'error': 'Не авторизован'})
    company_id = user['company_id']

    if method == 'GET':
        cur.execute(
            f"SELECT name, {', '.join(COMPANY_FIELDS)} FROM companies WHERE id = %s",
            (company_id,)
        )
        row = cur.fetchone()
        if not row:
            return response(404, {'error': 'Компания не найдена'})
        keys = ['name'] + COMPANY_FIELDS
        return response(200, dict(zip(keys, row)))

    if method == 'PUT':
        if user['role'] not in ('owner', 'admin'):
            return response(403, {'error': 'Недостаточно прав'})

        body = json.loads(event.get('body') or '{}')

        signature_url = None
        signature_file = body.get('signature_file')
        if signature_file:
            try:
                header, b64data = signature_file.split(',', 1) if ',' in signature_file else ('', signature_file)
                file_bytes = base64.b64decode(b64data)
                ext = 'png'
                if 'jpeg' in header or 'jpg' in header:
                    ext = 'jpg'
                key = f"signatures/{company_id}/{uuid.uuid4().hex}.{ext}"
                s3 = boto3.client(
                    's3',
                    endpoint_url='https://bucket.poehali.dev',
                    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
                )
                content_type = 'image/jpeg' if ext == 'jpg' else 'image/png'
                s3.put_object(Bucket='files', Key=key, Body=file_bytes, ContentType=content_type)
                signature_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            except Exception:
                return response(400, {'error': 'Не удалось загрузить файл подписи'})

        set_clauses = []
        values = []

        name = body.get('name')
        if name is not None:
            set_clauses.append('name = %s')
            values.append(name.strip())

        for field in COMPANY_FIELDS:
            if field == 'signature_url':
                continue
            if field in body:
                set_clauses.append(f'{field} = %s')
                values.append(body[field])

        if signature_url:
            set_clauses.append('signature_url = %s')
            values.append(signature_url)

        if not set_clauses:
            return response(400, {'error': 'Нет данных для обновления'})

        set_clauses.append('updated_at = NOW()')
        values.append(company_id)

        cur.execute(
            f"UPDATE companies SET {', '.join(set_clauses)} WHERE id = %s",
            values
        )
        conn.commit()

        cur.execute(
            f"SELECT name, {', '.join(COMPANY_FIELDS)} FROM companies WHERE id = %s",
            (company_id,)
        )
        row = cur.fetchone()
        keys = ['name'] + COMPANY_FIELDS
        return response(200, dict(zip(keys, row)))

    return response(405, {'error': 'Метод не поддерживается'})


def handle_profile(method, event, conn, cur):
    user = get_current_user(cur, event)
    if not user:
        return response(401, {'error': 'Не авторизован'})
    user_id = user['user_id']

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')

        full_name = body.get('full_name')
        email = body.get('email')
        current_password = body.get('current_password')
        new_password = body.get('new_password')

        set_clauses = []
        values = []

        if full_name is not None:
            full_name = full_name.strip()
            if len(full_name) < 2:
                return response(400, {'error': 'Введите имя'})
            set_clauses.append('full_name = %s')
            values.append(full_name)

        if email is not None:
            email = email.strip().lower()
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                return response(400, {'error': 'Некорректный email'})
            cur.execute("SELECT id FROM users WHERE email = %s AND id != %s", (email, user_id))
            if cur.fetchone():
                return response(409, {'error': 'Этот email уже используется'})
            set_clauses.append('email = %s')
            values.append(email)

        if new_password:
            if not current_password:
                return response(400, {'error': 'Введите текущий пароль'})
            cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
            stored_hash = cur.fetchone()[0]
            if stored_hash != hash_password(current_password):
                return response(401, {'error': 'Неверный текущий пароль'})
            if len(new_password) < 6:
                return response(400, {'error': 'Новый пароль должен быть не короче 6 символов'})
            set_clauses.append('password_hash = %s')
            values.append(hash_password(new_password))

        if not set_clauses:
            return response(400, {'error': 'Нет данных для обновления'})

        values.append(user_id)
        cur.execute(f"UPDATE users SET {', '.join(set_clauses)} WHERE id = %s", values)
        conn.commit()

        cur.execute("SELECT full_name, email FROM users WHERE id = %s", (user_id,))
        updated_name, updated_email = cur.fetchone()

        return response(200, {'full_name': updated_name, 'email': updated_email})

    if method == 'DELETE':
        cur.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if row and row[0] == 'owner':
            return response(400, {'error': 'Владелец не может удалить свой аккаунт. Передайте права другому пользователю или обратитесь в поддержку'})

        cur.execute("DELETE FROM object_access WHERE user_id = %s", (user_id,))
        cur.execute("DELETE FROM two_factor_challenges WHERE user_id = %s", (user_id,))
        cur.execute("DELETE FROM sessions WHERE user_id = %s", (user_id,))
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        return response(200, {'success': True})

    return response(405, {'error': 'Метод не поддерживается'})


def handle_2fa(method, event, conn, cur, action):
    user = get_current_user(cur, event)
    if not user:
        return response(401, {'error': 'Не авторизован'})
    user_id = user['user_id']

    if method == 'POST' and action == 'setup':
        cur.execute("SELECT email, totp_enabled FROM users WHERE id = %s", (user_id,))
        email, totp_enabled = cur.fetchone()
        if totp_enabled:
            return response(400, {'error': '2FA уже включена'})

        secret = pyotp.random_base32()
        cur.execute("UPDATE users SET pending_totp_secret = %s WHERE id = %s", (secret, user_id))
        conn.commit()

        otp_uri = pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name='FixKey')
        return response(200, {'secret': secret, 'otp_uri': otp_uri})

    if method == 'POST' and action == 'confirm':
        body = json.loads(event.get('body') or '{}')
        code = (body.get('code') or '').strip()

        cur.execute("SELECT pending_totp_secret FROM users WHERE id = %s", (user_id,))
        pending_secret = cur.fetchone()[0]
        if not pending_secret:
            return response(400, {'error': 'Сначала запросите настройку 2FA'})

        totp = pyotp.TOTP(pending_secret)
        if not totp.verify(code, valid_window=1):
            return response(401, {'error': 'Неверный код'})

        cur.execute(
            "UPDATE users SET totp_secret = %s, totp_enabled = TRUE, pending_totp_secret = '' WHERE id = %s",
            (pending_secret, user_id)
        )
        conn.commit()
        return response(200, {'success': True, 'totp_enabled': True})

    if method == 'POST' and action == 'disable':
        body = json.loads(event.get('body') or '{}')
        password = body.get('password') or ''

        cur.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        stored_hash = cur.fetchone()[0]
        if stored_hash != hash_password(password):
            return response(401, {'error': 'Неверный пароль'})

        cur.execute(
            "UPDATE users SET totp_secret = '', totp_enabled = FALSE, pending_totp_secret = '' WHERE id = %s",
            (user_id,)
        )
        conn.commit()
        return response(200, {'success': True, 'totp_enabled': False})

    return response(404, {'error': 'Неизвестное действие'})


def handle_notifications(method, event, conn, cur):
    user = get_current_user(cur, event)
    if not user:
        return response(401, {'error': 'Не авторизован'})
    company_id = user['company_id']

    params = event.get('queryStringParameters') or {}
    notif_id = params.get('id')

    if method == 'GET':
        cur.execute(
            "SELECT id, type, title, message, payload, is_read, created_at FROM notifications WHERE company_id = %s ORDER BY created_at DESC LIMIT 50",
            (company_id,)
        )
        rows = cur.fetchall()
        keys = ['id', 'type', 'title', 'message', 'payload', 'is_read', 'created_at']
        notifications = [dict(zip(keys, r)) for r in rows]

        cur.execute(
            "SELECT COUNT(*) FROM notifications WHERE company_id = %s AND is_read = FALSE",
            (company_id,)
        )
        unread_count = cur.fetchone()[0]

        return response(200, {'notifications': notifications, 'unread_count': unread_count})

    if method == 'PUT':
        if notif_id:
            cur.execute(
                "UPDATE notifications SET is_read = TRUE WHERE id = %s AND company_id = %s",
                (notif_id, company_id)
            )
        else:
            cur.execute(
                "UPDATE notifications SET is_read = TRUE WHERE company_id = %s AND is_read = FALSE",
                (company_id,)
            )
        conn.commit()
        return response(200, {'success': True})

    return response(405, {'error': 'Метод не поддерживается'})


def handler(event: dict, context) -> dict:
    '''Аутентификация, 2FA, профиль пользователя, управление командой (сотрудники/заказчики) и уведомления FixKey'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', 'auth')
    action = params.get('action', '')

    conn = get_conn()
    cur = conn.cursor()

    try:
        if resource == 'team':
            return handle_team(method, event, conn, cur)
        if resource == 'notifications':
            return handle_notifications(method, event, conn, cur)
        if resource == 'company':
            return handle_company(method, event, conn, cur)
        if resource == 'profile':
            return handle_profile(method, event, conn, cur)
        if resource == '2fa':
            return handle_2fa(method, event, conn, cur, action)
        return handle_auth(method, event, conn, cur, action)
    finally:
        cur.close()
        conn.close()