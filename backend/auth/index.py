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
        'body': json.dumps(body)
    }


def handler(event: dict, context) -> dict:
    '''Регистрация, вход и проверка сессии пользователя FixKey'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    conn = get_conn()
    cur = conn.cursor()

    try:
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
            headers = event.get('headers') or {}
            token = headers.get('X-Authorization') or headers.get('x-authorization') or ''
            token = token.replace('Bearer ', '')

            if not token:
                return response(401, {'error': 'Не авторизован'})

            cur.execute(
                "SELECT u.id, u.full_name, u.email, u.role, u.company_id, c.name FROM sessions s JOIN users u ON u.id = s.user_id JOIN companies c ON c.id = u.company_id WHERE s.token = %s AND s.expires_at > NOW()",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return response(401, {'error': 'Сессия истекла'})

            user_id, full_name, email, role, company_id, company_name = row
            return response(200, {
                'user': {'id': user_id, 'full_name': full_name, 'email': email, 'role': role, 'company_id': company_id, 'company_name': company_name}
            })

        return response(404, {'error': 'Неизвестное действие'})
    finally:
        cur.close()
        conn.close()

# touch
