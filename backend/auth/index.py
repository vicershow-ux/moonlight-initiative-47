import json
import os
import hashlib
import secrets
import re
from datetime import datetime, timedelta
import psycopg2


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
        "SELECT u.id, u.company_id, u.role, u.full_name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
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
            "SELECT u.id, u.full_name, u.email, u.role, u.company_id, c.name, u.password_hash FROM users u JOIN companies c ON c.id = u.company_id WHERE u.email = %s",
            (email,)
        )
        row = cur.fetchone()
        if not row:
            return response(401, {'error': 'Неверный email или пароль'})

        user_id, full_name, user_email, role, company_id, company_name, stored_hash = row

        if stored_hash != hash_password(password):
            return response(401, {'error': 'Неверный email или пароль'})

        token = make_token()
        expires_at = datetime.utcnow() + timedelta(days=30)
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires_at)
        )
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

        cur.execute("SELECT email FROM users WHERE id = %s", (user['user_id'],))
        email = cur.fetchone()[0]

        return response(200, {
            'user': {
                'id': user['user_id'], 'full_name': user['full_name'], 'email': email,
                'role': user['role'], 'company_id': user['company_id'], 'company_name': company_name
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
            "SELECT id, full_name, email, role, phone, created_at FROM users WHERE company_id = %s ORDER BY created_at DESC",
            (company_id,)
        )
        rows = cur.fetchall()
        keys = ['id', 'full_name', 'email', 'role', 'phone', 'created_at']
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
            'role': role, 'phone': phone, 'created_at': created_at
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
    '''Аутентификация, управление командой (сотрудники/заказчики) и уведомления FixKey'''
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
        return handle_auth(method, event, conn, cur, action)
    finally:
        cur.close()
        conn.close()