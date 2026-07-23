import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    '''Создание и просмотр смет по объектам с позициями услуг FixKey'''
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
        estimate_id = params.get('id')
        object_id = params.get('object_id')

        if method == 'GET':
            if estimate_id:
                cur.execute(
                    "SELECT id, object_id, total_amount, created_at FROM estimates WHERE id = %s AND company_id = %s",
                    (estimate_id, company_id)
                )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Смета не найдена'})
                est_keys = ['id', 'object_id', 'total_amount', 'created_at']
                estimate = dict(zip(est_keys, row))

                cur.execute(
                    "SELECT id, name, unit, price, quantity, amount FROM estimate_items WHERE estimate_id = %s ORDER BY id",
                    (estimate_id,)
                )
                item_keys = ['id', 'name', 'unit', 'price', 'quantity', 'amount']
                estimate['items'] = [dict(zip(item_keys, r)) for r in cur.fetchall()]
                return response(200, estimate)

            if object_id:
                cur.execute(
                    "SELECT id, object_id, total_amount, created_at FROM estimates WHERE object_id = %s AND company_id = %s ORDER BY created_at DESC",
                    (object_id, company_id)
                )
                rows = cur.fetchall()
                keys = ['id', 'object_id', 'total_amount', 'created_at']
                return response(200, {'estimates': [dict(zip(keys, r)) for r in rows]})

            cur.execute(
                "SELECT id, object_id, total_amount, created_at FROM estimates WHERE company_id = %s ORDER BY created_at DESC",
                (company_id,)
            )
            rows = cur.fetchall()
            keys = ['id', 'object_id', 'total_amount', 'created_at']
            return response(200, {'estimates': [dict(zip(keys, r)) for r in rows]})

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            obj_id = body.get('object_id')
            items = body.get('items') or []

            if not obj_id:
                return response(400, {'error': 'Не указан объект'})
            if not items:
                return response(400, {'error': 'Добавьте хотя бы одну позицию сметы'})

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (obj_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            total = 0
            clean_items = []
            for it in items:
                name = (it.get('name') or '').strip()
                unit = (it.get('unit') or 'м²').strip()
                price = float(it.get('price') or 0)
                quantity = float(it.get('quantity') or 0)
                if not name or quantity <= 0:
                    continue
                amount = round(price * quantity, 2)
                total += amount
                clean_items.append({
                    'service_id': it.get('service_id'),
                    'name': name, 'unit': unit, 'price': price,
                    'quantity': quantity, 'amount': amount
                })

            if not clean_items:
                return response(400, {'error': 'Добавьте хотя бы одну корректную позицию'})

            cur.execute(
                "INSERT INTO estimates (company_id, object_id, total_amount) VALUES (%s, %s, %s) RETURNING id, created_at",
                (company_id, obj_id, total)
            )
            new_id, created_at = cur.fetchone()

            for it in clean_items:
                cur.execute(
                    "INSERT INTO estimate_items (estimate_id, service_id, name, unit, price, quantity, amount) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (new_id, it['service_id'], it['name'], it['unit'], it['price'], it['quantity'], it['amount'])
                )

            conn.commit()

            return response(200, {
                'id': new_id, 'object_id': obj_id, 'total_amount': total,
                'created_at': created_at, 'items': clean_items
            })

        if method == 'DELETE':
            if not estimate_id:
                return response(400, {'error': 'Не указан id сметы'})
            cur.execute("DELETE FROM estimate_items WHERE estimate_id = %s", (estimate_id,))
            cur.execute("DELETE FROM estimates WHERE id = %s AND company_id = %s", (estimate_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
