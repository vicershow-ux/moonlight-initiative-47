import json
import os
from datetime import datetime
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400'
    }


def response(status: int, body):
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
        "SELECT u.id, u.company_id FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1]}


def handler(event: dict, context) -> dict:
    '''CRUD объектов недвижимости компании FixKey'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = get_conn()
    cur = conn.cursor()

    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        company_id = user['company_id']

        params = event.get('queryStringParameters') or {}
        object_id = params.get('id')

        if method == 'GET':
            if object_id:
                cur.execute(
                    "SELECT id, object_code, client_name, client_phone, object_type, area, status, created_at FROM objects WHERE id = %s AND company_id = %s",
                    (object_id, company_id)
                )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Объект не найден'})
                keys = ['id', 'object_code', 'client_name', 'client_phone', 'object_type', 'area', 'status', 'created_at']
                return response(200, dict(zip(keys, row)))

            cur.execute(
                "SELECT id, object_code, client_name, client_phone, object_type, area, status, created_at FROM objects WHERE company_id = %s ORDER BY created_at DESC",
                (company_id,)
            )
            rows = cur.fetchall()
            keys = ['id', 'object_code', 'client_name', 'client_phone', 'object_type', 'area', 'status', 'created_at']
            return response(200, {'objects': [dict(zip(keys, r)) for r in rows]})

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            client_name = (body.get('client_name') or '').strip()
            client_phone = (body.get('client_phone') or '').strip()
            object_type = (body.get('object_type') or 'вторичка').strip()
            area = body.get('area') or 0
            status = (body.get('status') or 'лид').strip()

            if len(client_name) < 2:
                return response(400, {'error': 'Введите имя клиента'})

            year = datetime.utcnow().strftime('%y')
            cur.execute("SELECT COUNT(*) FROM objects WHERE company_id = %s", (company_id,))
            seq = cur.fetchone()[0] + 1
            object_code = f"{company_id:03d}-20{year}-{seq:04d}"

            cur.execute(
                "INSERT INTO objects (company_id, object_code, client_name, client_phone, object_type, area, status) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id, created_at",
                (company_id, object_code, client_name, client_phone, object_type, area, status)
            )
            new_id, created_at = cur.fetchone()
            conn.commit()

            return response(200, {
                'id': new_id, 'object_code': object_code, 'client_name': client_name,
                'client_phone': client_phone, 'object_type': object_type, 'area': area,
                'status': status, 'created_at': created_at
            })

        if method == 'PUT':
            if not object_id:
                return response(400, {'error': 'Не указан id объекта'})
            body = json.loads(event.get('body') or '{}')

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            fields = []
            values = []
            for key in ['client_name', 'client_phone', 'object_type', 'area', 'status']:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(body[key])

            if fields:
                values.append(object_id)
                values.append(company_id)
                cur.execute(f"UPDATE objects SET {', '.join(fields)} WHERE id = %s AND company_id = %s", values)
                conn.commit()

            return response(200, {'success': True})

        if method == 'DELETE':
            if not object_id:
                return response(400, {'error': 'Не указан id объекта'})
            cur.execute("DELETE FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
# touch
