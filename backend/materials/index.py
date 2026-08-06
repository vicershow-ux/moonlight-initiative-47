import json
import os

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
        "SELECT u.id, u.company_id FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1]}


FIELDS = ['name', 'category', 'unit', 'price', 'shop_name', 'shop_address',
          'shop_phone', 'shop_url', 'note']

KEYS = ['id'] + FIELDS + ['created_at']

COLS = 'id, ' + ', '.join(FIELDS) + ', created_at'


def to_num(v, default=0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def handler(event: dict, context) -> dict:
    '''Справочник материалов: цены, магазины и адреса поставщиков'''
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
        row_id = params.get('id')

        if method == 'GET':
            cur.execute(
                f"SELECT {COLS} FROM materials WHERE company_id = %s ORDER BY created_at DESC",
                (company_id,)
            )
            return response(200, {
                'materials': [dict(zip(KEYS, r)) for r in cur.fetchall()]
            })

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            name = (body.get('name') or '').strip()
            if len(name) < 2:
                return response(400, {'error': 'Введите название материала'})
            cur.execute(
                "INSERT INTO materials (company_id, name, category, unit, price, shop_name, "
                "shop_address, shop_phone, shop_url, note) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, name, (body.get('category') or '').strip(),
                 (body.get('unit') or 'шт').strip(), to_num(body.get('price')),
                 (body.get('shop_name') or '').strip(), (body.get('shop_address') or '').strip(),
                 (body.get('shop_phone') or '').strip(), (body.get('shop_url') or '').strip(),
                 (body.get('note') or '').strip())
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'PUT':
            if not row_id:
                return response(400, {'error': 'Не указан материал'})
            fields = []
            values = []
            for key in FIELDS:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(to_num(body[key]) if key == 'price' else body[key])
            if fields:
                values.extend([row_id, company_id])
                cur.execute(
                    f"UPDATE materials SET {', '.join(fields)}, updated_at = now() "
                    "WHERE id = %s AND company_id = %s",
                    values
                )
                conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE':
            if not row_id:
                return response(400, {'error': 'Не указан материал'})
            cur.execute(
                "DELETE FROM materials WHERE id = %s AND company_id = %s",
                (row_id, company_id)
            )
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})

    finally:
        cur.close()
        conn.close()
