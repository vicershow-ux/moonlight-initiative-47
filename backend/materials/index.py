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
          'shop_phone', 'shop_url', 'note', 'consumption', 'consumption_unit']

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
        entity = params.get('entity') or 'material'

        if method == 'GET':
            cur.execute(
                f"SELECT {COLS} FROM materials WHERE company_id = %s ORDER BY created_at DESC",
                (company_id,)
            )
            materials = [dict(zip(KEYS, r)) for r in cur.fetchall()]

            cur.execute(
                "SELECT id, object_code, client_name, address FROM objects "
                "WHERE company_id = %s ORDER BY created_at DESC",
                (company_id,)
            )
            okeys = ['id', 'object_code', 'client_name', 'address']
            objects = [dict(zip(okeys, r)) for r in cur.fetchall()]

            cur.execute(
                "SELECT om.id, om.object_id, om.material_id, om.name, om.unit, om.qty, "
                "om.price, om.shop_name, om.note, om.created_at, om.room_id, om.room_name "
                "FROM object_materials om WHERE om.company_id = %s ORDER BY om.created_at DESC",
                (company_id,)
            )
            mkeys = ['id', 'object_id', 'material_id', 'name', 'unit', 'qty',
                     'price', 'shop_name', 'note', 'created_at', 'room_id', 'room_name']
            object_materials = [dict(zip(mkeys, r)) for r in cur.fetchall()]

            cur.execute(
                "SELECT r.id, r.object_id, r.name, r.room_type, r.area, r.perimeter, "
                "r.ceiling_height, r.wall_area FROM object_rooms r "
                "JOIN objects o ON o.id = r.object_id "
                "WHERE o.company_id = %s ORDER BY r.id",
                (company_id,)
            )
            rkeys = ['id', 'object_id', 'name', 'room_type', 'area', 'perimeter',
                     'ceiling_height', 'wall_area']
            rooms = [dict(zip(rkeys, r)) for r in cur.fetchall()]

            return response(200, {
                'materials': materials,
                'objects': objects,
                'object_materials': object_materials,
                'rooms': rooms,
            })

        body = json.loads(event.get('body') or '{}')

        if method == 'POST' and entity == 'object_material':
            object_id = body.get('object_id')
            if not object_id:
                return response(400, {'error': 'Выберите объект'})
            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s",
                        (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            material_id = body.get('material_id') or None
            name = (body.get('name') or '').strip()
            unit = (body.get('unit') or 'шт').strip()
            price = to_num(body.get('price'))
            shop_name = (body.get('shop_name') or '').strip()

            if material_id:
                cur.execute(
                    "SELECT name, unit, price, shop_name FROM materials "
                    "WHERE id = %s AND company_id = %s",
                    (material_id, company_id)
                )
                m = cur.fetchone()
                if not m:
                    return response(404, {'error': 'Материал не найден в справочнике'})
                name = name or m[0]
                unit = m[1]
                if not body.get('price'):
                    price = float(m[2])
                shop_name = shop_name or m[3]

            if len(name) < 2:
                return response(400, {'error': 'Выберите материал из справочника'})

            qty = to_num(body.get('qty'))
            if qty <= 0:
                return response(400, {'error': 'Укажите количество больше нуля'})

            room_id = body.get('room_id') or None
            room_name = (body.get('room_name') or '').strip()
            note = (body.get('note') or '').strip()

            if body.get('merge') and material_id and room_id:
                cur.execute(
                    "SELECT id, qty FROM object_materials WHERE company_id = %s AND object_id = %s "
                    "AND material_id = %s AND room_id = %s LIMIT 1",
                    (company_id, object_id, material_id, room_id)
                )
                existing = cur.fetchone()
                if existing:
                    cur.execute(
                        "UPDATE object_materials SET qty = qty + %s, price = %s, note = %s "
                        "WHERE id = %s",
                        (qty, price, note, existing[0])
                    )
                    conn.commit()
                    return response(200, {
                        'success': True,
                        'id': existing[0],
                        'merged': True,
                        'qty': float(existing[1]) + qty,
                    })

            cur.execute(
                "INSERT INTO object_materials (company_id, object_id, material_id, name, unit, "
                "qty, price, shop_name, note, room_id, room_name) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, object_id, material_id, name, unit, qty, price, shop_name,
                 note, room_id, room_name)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'PUT' and entity == 'object_material':
            if not row_id:
                return response(400, {'error': 'Не указана запись'})
            fields = []
            values = []
            for key in ['name', 'unit', 'qty', 'price', 'shop_name', 'note', 'object_id']:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(to_num(body[key]) if key in ('qty', 'price') else body[key])
            if fields:
                values.extend([row_id, company_id])
                cur.execute(
                    f"UPDATE object_materials SET {', '.join(fields)} "
                    "WHERE id = %s AND company_id = %s",
                    values
                )
                conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE' and entity == 'object_material':
            if not row_id:
                return response(400, {'error': 'Не указана запись'})
            cur.execute(
                "DELETE FROM object_materials WHERE id = %s AND company_id = %s",
                (row_id, company_id)
            )
            conn.commit()
            return response(200, {'success': True})

        if method == 'POST':
            name = (body.get('name') or '').strip()
            if len(name) < 2:
                return response(400, {'error': 'Введите название материала'})
            cur.execute(
                "INSERT INTO materials (company_id, name, category, unit, price, shop_name, "
                "shop_address, shop_phone, shop_url, note, consumption, consumption_unit) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, name, (body.get('category') or '').strip(),
                 (body.get('unit') or 'шт').strip(), to_num(body.get('price')),
                 (body.get('shop_name') or '').strip(), (body.get('shop_address') or '').strip(),
                 (body.get('shop_phone') or '').strip(), (body.get('shop_url') or '').strip(),
                 (body.get('note') or '').strip(), to_num(body.get('consumption')),
                 (body.get('consumption_unit') or 'м²').strip())
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
                    values.append(
                        to_num(body[key]) if key in ('price', 'consumption') else body[key]
                    )
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
                "UPDATE object_materials SET material_id = NULL "
                "WHERE material_id = %s AND company_id = %s",
                (row_id, company_id)
            )
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

