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


ITEM_KEYS = [
    'id', 'warehouse_id', 'name', 'kind', 'unit', 'qty', 'price',
    'object_id', 'issued_qty', 'issued_at', 'used_qty', 'used_at', 'created_at'
]

ITEM_COLS = (
    "i.id, i.warehouse_id, i.name, i.kind, i.unit, i.qty, i.price, "
    "i.object_id, i.issued_qty, i.issued_at, i.used_qty, i.used_at, i.created_at"
)


def to_num(v, default=0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def load_warehouses(cur, company_id):
    cur.execute(
        "SELECT w.id, w.name, w.address, w.responsible, w.created_at, "
        "(SELECT COUNT(*) FROM warehouse_items i WHERE i.warehouse_id = w.id AND i.object_id IS NULL) "
        "FROM warehouses w WHERE w.company_id = %s ORDER BY w.created_at DESC",
        (company_id,)
    )
    keys = ['id', 'name', 'address', 'responsible', 'created_at', 'positions']
    return [dict(zip(keys, r)) for r in cur.fetchall()]


def load_items(cur, company_id):
    cur.execute(
        f"SELECT {ITEM_COLS}, w.name, o.object_code, o.client_name, o.address "
        "FROM warehouse_items i "
        "LEFT JOIN warehouses w ON w.id = i.warehouse_id "
        "LEFT JOIN objects o ON o.id = i.object_id "
        "WHERE i.company_id = %s ORDER BY i.created_at DESC",
        (company_id,)
    )
    keys = ITEM_KEYS + ['warehouse_name', 'object_code', 'object_client', 'object_address']
    return [dict(zip(keys, r)) for r in cur.fetchall()]


def load_objects(cur, company_id):
    cur.execute(
        "SELECT id, object_code, client_name, address FROM objects "
        "WHERE company_id = %s ORDER BY created_at DESC",
        (company_id,)
    )
    keys = ['id', 'object_code', 'client_name', 'address']
    return [dict(zip(keys, r)) for r in cur.fetchall()]


def handler(event: dict, context) -> dict:
    '''Склад: справочник складов, позиции (материалы и инструменты), выдача на объекты и возврат'''
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
        entity = params.get('entity') or 'item'
        action = params.get('action') or ''
        row_id = params.get('id')

        if method == 'GET':
            return response(200, {
                'warehouses': load_warehouses(cur, company_id),
                'items': load_items(cur, company_id),
                'objects': load_objects(cur, company_id),
            })

        body = json.loads(event.get('body') or '{}')

        if method == 'POST' and entity == 'warehouse':
            name = (body.get('name') or '').strip()
            if len(name) < 2:
                return response(400, {'error': 'Введите название склада'})
            cur.execute(
                "INSERT INTO warehouses (company_id, name, address, responsible) "
                "VALUES (%s, %s, %s, %s) RETURNING id",
                (company_id, name, (body.get('address') or '').strip(),
                 (body.get('responsible') or '').strip())
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'POST' and entity == 'item':
            name = (body.get('name') or '').strip()
            if len(name) < 2:
                return response(400, {'error': 'Введите название позиции'})
            kind = (body.get('kind') or 'материал').strip()
            if kind not in ('материал', 'инструмент', 'оборудование', 'расходник'):
                kind = 'материал'
            cur.execute(
                "INSERT INTO warehouse_items (company_id, warehouse_id, name, kind, unit, qty, price) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, body.get('warehouse_id') or None, name, kind,
                 (body.get('unit') or 'шт').strip(), to_num(body.get('qty')), to_num(body.get('price')))
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'PUT' and action == 'issue':
            if not row_id:
                return response(400, {'error': 'Не указана позиция'})
            object_id = body.get('object_id')
            if not object_id:
                return response(400, {'error': 'Выберите объект'})
            qty = to_num(body.get('qty'))
            if qty <= 0:
                return response(400, {'error': 'Укажите количество больше нуля'})

            cur.execute(
                "SELECT warehouse_id, name, kind, unit, qty, price FROM warehouse_items "
                "WHERE id = %s AND company_id = %s AND object_id IS NULL",
                (row_id, company_id)
            )
            src = cur.fetchone()
            if not src:
                return response(404, {'error': 'Позиция не найдена на складе'})

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            wh_id, name, kind, unit, stock_qty, price = src
            stock_qty = float(stock_qty)
            if qty > stock_qty:
                return response(400, {'error': f'На складе только {stock_qty:g} {unit}'})

            cur.execute(
                "UPDATE warehouse_items SET qty = qty - %s, updated_at = now() WHERE id = %s AND company_id = %s",
                (qty, row_id, company_id)
            )
            cur.execute(
                "INSERT INTO warehouse_items "
                "(company_id, warehouse_id, name, kind, unit, qty, price, object_id, issued_qty, issued_at) "
                "VALUES (%s, %s, %s, %s, %s, 0, %s, %s, %s, now()) RETURNING id",
                (company_id, wh_id, name, kind, unit, price, object_id, qty)
            )
            issued_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': issued_id})

        if method == 'PUT' and action == 'restock':
            if not row_id:
                return response(400, {'error': 'Не указана позиция'})
            qty = to_num(body.get('qty'))
            if qty <= 0:
                return response(400, {'error': 'Укажите количество больше нуля'})
            cur.execute(
                "SELECT id FROM warehouse_items WHERE id = %s AND company_id = %s AND object_id IS NULL",
                (row_id, company_id)
            )
            if not cur.fetchone():
                return response(404, {'error': 'Позиция не найдена на складе'})
            price = body.get('price')
            if price is not None and str(price) != '':
                cur.execute(
                    "UPDATE warehouse_items SET qty = qty + %s, price = %s, updated_at = now() "
                    "WHERE id = %s AND company_id = %s",
                    (qty, to_num(price), row_id, company_id)
                )
            else:
                cur.execute(
                    "UPDATE warehouse_items SET qty = qty + %s, updated_at = now() "
                    "WHERE id = %s AND company_id = %s",
                    (qty, row_id, company_id)
                )
            conn.commit()
            return response(200, {'success': True})

        if method == 'PUT' and action == 'consume':
            if not row_id:
                return response(400, {'error': 'Не указана позиция'})
            cur.execute(
                "SELECT issued_qty, used_qty, kind FROM warehouse_items "
                "WHERE id = %s AND company_id = %s AND object_id IS NOT NULL",
                (row_id, company_id)
            )
            src = cur.fetchone()
            if not src:
                return response(404, {'error': 'Выданная позиция не найдена'})

            issued_qty, used_qty, kind = float(src[0]), float(src[1]), src[2]
            available = issued_qty - used_qty
            qty = to_num(body.get('qty'), available)
            if qty <= 0:
                return response(400, {'error': 'Укажите количество больше нуля'})
            if qty > available:
                return response(400, {'error': f'Доступно к списанию только {available:g}'})

            cur.execute(
                "UPDATE warehouse_items SET used_qty = used_qty + %s, used_at = now(), updated_at = now() "
                "WHERE id = %s AND company_id = %s",
                (qty, row_id, company_id)
            )
            conn.commit()
            return response(200, {'success': True})

        if method == 'PUT' and action == 'return':
            if not row_id:
                return response(400, {'error': 'Не указана позиция'})

            cur.execute(
                "SELECT warehouse_id, name, kind, unit, price, issued_qty, used_qty FROM warehouse_items "
                "WHERE id = %s AND company_id = %s AND object_id IS NOT NULL",
                (row_id, company_id)
            )
            src = cur.fetchone()
            if not src:
                return response(404, {'error': 'Выданная позиция не найдена'})

            wh_id, name, kind, unit, price, issued_qty, used_qty = src
            issued_qty = float(issued_qty)
            used_qty = float(used_qty)
            available = issued_qty - used_qty
            if available <= 0:
                return response(400, {'error': 'Всё выданное уже списано — возвращать нечего'})

            back_qty = to_num(body.get('qty'), available)
            if back_qty <= 0 or back_qty > available:
                back_qty = available

            cur.execute(
                "SELECT id FROM warehouse_items WHERE company_id = %s AND object_id IS NULL "
                "AND name = %s AND kind = %s AND unit = %s "
                "AND (warehouse_id IS NOT DISTINCT FROM %s) LIMIT 1",
                (company_id, name, kind, unit, wh_id)
            )
            existing = cur.fetchone()

            if existing:
                cur.execute(
                    "UPDATE warehouse_items SET qty = qty + %s, updated_at = now() WHERE id = %s",
                    (back_qty, existing[0])
                )
            else:
                cur.execute(
                    "INSERT INTO warehouse_items (company_id, warehouse_id, name, kind, unit, qty, price) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (company_id, wh_id, name, kind, unit, back_qty, price)
                )

            rest = issued_qty - back_qty
            if rest > 0:
                cur.execute(
                    "UPDATE warehouse_items SET issued_qty = %s, updated_at = now() "
                    "WHERE id = %s AND company_id = %s",
                    (rest, row_id, company_id)
                )
            else:
                cur.execute(
                    "UPDATE warehouse_items SET issued_qty = 0, object_id = NULL, warehouse_id = %s, "
                    "qty = 0, updated_at = now() WHERE id = %s AND company_id = %s",
                    (wh_id, row_id, company_id)
                )
                cur.execute(
                    "DELETE FROM warehouse_items WHERE id = %s AND company_id = %s AND qty = 0 AND issued_qty = 0",
                    (row_id, company_id)
                )

            conn.commit()
            return response(200, {'success': True})

        if method == 'PUT' and entity == 'item':
            if not row_id:
                return response(400, {'error': 'Не указана позиция'})
            fields = []
            values = []
            for key in ['name', 'kind', 'unit', 'qty', 'price', 'warehouse_id']:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(body[key])
            if fields:
                values.extend([row_id, company_id])
                cur.execute(
                    f"UPDATE warehouse_items SET {', '.join(fields)}, updated_at = now() "
                    "WHERE id = %s AND company_id = %s",
                    values
                )
                conn.commit()
            return response(200, {'success': True})

        if method == 'PUT' and entity == 'warehouse':
            if not row_id:
                return response(400, {'error': 'Не указан склад'})
            fields = []
            values = []
            for key in ['name', 'address', 'responsible']:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(body[key])
            if fields:
                values.extend([row_id, company_id])
                cur.execute(
                    f"UPDATE warehouses SET {', '.join(fields)} WHERE id = %s AND company_id = %s",
                    values
                )
                conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE' and entity == 'warehouse':
            if not row_id:
                return response(400, {'error': 'Не указан склад'})
            cur.execute(
                "UPDATE warehouse_items SET warehouse_id = NULL WHERE warehouse_id = %s AND company_id = %s",
                (row_id, company_id)
            )
            cur.execute("DELETE FROM warehouses WHERE id = %s AND company_id = %s", (row_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE' and entity == 'item':
            if not row_id:
                return response(400, {'error': 'Не указана позиция'})
            cur.execute("DELETE FROM warehouse_items WHERE id = %s AND company_id = %s", (row_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})

    finally:
        cur.close()
        conn.close()