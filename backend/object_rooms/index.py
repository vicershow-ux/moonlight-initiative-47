import json
import os

import psycopg2


FIELDS = ['name', 'room_type', 'area', 'perimeter', 'ceiling_height', 'wall_area', 'notes']
ALL_KEYS = ['id', 'object_id'] + FIELDS + ['created_at', 'updated_at']


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
        "SELECT u.id, u.company_id, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2]}


def has_object_access(cur, user, object_id):
    if user['role'] != 'client':
        return True
    cur.execute(
        "SELECT 1 FROM object_access WHERE user_id = %s AND object_id = %s",
        (user['user_id'], object_id)
    )
    return cur.fetchone() is not None


def handler(event: dict, context) -> dict:
    '''CRUD эталонных помещений объекта (комнаты с параметрами для оценки работ)'''
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
        is_client = user['role'] == 'client'

        params = event.get('queryStringParameters') or {}
        room_id = params.get('id')
        object_id = params.get('object_id')

        if method == 'GET':
            if not object_id:
                return response(400, {'error': 'Не указан object_id'})
            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})
            if not has_object_access(cur, user, object_id):
                return response(403, {'error': 'Недостаточно прав'})

            cur.execute(
                f"SELECT {', '.join(ALL_KEYS)} FROM object_rooms WHERE object_id = %s ORDER BY created_at",
                (object_id,)
            )
            rows = cur.fetchall()
            return response(200, {'rooms': [dict(zip(ALL_KEYS, r)) for r in rows]})

        if method == 'POST':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            obj_id = body.get('object_id')
            name = (body.get('name') or '').strip()

            if not obj_id:
                return response(400, {'error': 'Не указан object_id'})
            if len(name) < 1:
                return response(400, {'error': 'Введите название помещения'})

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (obj_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            values_map = {
                'name': name,
                'room_type': (body.get('room_type') or '').strip(),
                'area': body.get('area') or 0,
                'perimeter': body.get('perimeter') or 0,
                'ceiling_height': body.get('ceiling_height') or 0,
                'wall_area': body.get('wall_area') or 0,
                'notes': (body.get('notes') or '').strip(),
            }

            insert_cols = ['object_id'] + FIELDS
            insert_vals = [obj_id] + [values_map[f] for f in FIELDS]
            placeholders = ', '.join(['%s'] * len(insert_vals))

            cur.execute(
                f"INSERT INTO object_rooms ({', '.join(insert_cols)}) VALUES ({placeholders}) RETURNING id, created_at, updated_at",
                insert_vals
            )
            new_id, created_at, updated_at = cur.fetchone()
            conn.commit()

            return response(200, {
                'id': new_id, 'object_id': obj_id, 'created_at': created_at,
                'updated_at': updated_at, **values_map
            })

        if method == 'PUT':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not room_id:
                return response(400, {'error': 'Не указан id помещения'})
            body = json.loads(event.get('body') or '{}')

            cur.execute(
                "SELECT r.id FROM object_rooms r JOIN objects o ON o.id = r.object_id WHERE r.id = %s AND o.company_id = %s",
                (room_id, company_id)
            )
            if not cur.fetchone():
                return response(404, {'error': 'Помещение не найдено'})

            fields = []
            values = []
            for key in FIELDS:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(body[key])

            if fields:
                fields.append("updated_at = NOW()")
                values.append(room_id)
                cur.execute(f"UPDATE object_rooms SET {', '.join(fields)} WHERE id = %s", values)
                conn.commit()

            return response(200, {'success': True})

        if method == 'DELETE':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not room_id:
                return response(400, {'error': 'Не указан id помещения'})
            cur.execute(
                "SELECT r.id FROM object_rooms r JOIN objects o ON o.id = r.object_id WHERE r.id = %s AND o.company_id = %s",
                (room_id, company_id)
            )
            if not cur.fetchone():
                return response(404, {'error': 'Помещение не найдено'})
            cur.execute("DELETE FROM object_rooms WHERE id = %s", (room_id,))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()