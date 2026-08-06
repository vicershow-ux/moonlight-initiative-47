import json
import os
from datetime import datetime
import psycopg2


FIELDS = [
    'client_name', 'client_phone', 'object_type', 'area', 'status',
    'email', 'legal_status', 'address', 'payment_type',
    'has_elevator', 'residence_during_works', 'material_unloading',
    'completion_type', 'warranty_waiver',
    'rough_material', 'finish_material', 'kitchen_furniture',
    'measurer_comment', 'design_project',
]

ALL_KEYS = ['id', 'object_code'] + FIELDS + ['created_at', 'updated_at']


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
        "SELECT u.id, u.company_id, u.role, u.position FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2], 'position': row[3]}


def handler(event: dict, context) -> dict:
    '''CRUD объектов недвижимости: доступ по роли и должности'''
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
        is_designer = user['position'] == 'designer' and user['role'] == 'employee'
        only_own = is_client or is_designer

        params = event.get('queryStringParameters') or {}
        object_id = params.get('id')

        select_cols = ', '.join(ALL_KEYS)

        if method == 'GET':
            if object_id:
                if only_own:
                    cur.execute(
                        f"SELECT o.{f', o.'.join(ALL_KEYS)} FROM objects o JOIN object_access oa ON oa.object_id = o.id "
                        "WHERE o.id = %s AND o.company_id = %s AND oa.user_id = %s",
                        (object_id, company_id, user['user_id'])
                    )
                else:
                    cur.execute(
                        f"SELECT {select_cols} FROM objects WHERE id = %s AND company_id = %s",
                        (object_id, company_id)
                    )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Объект не найден'})
                return response(200, dict(zip(ALL_KEYS, row)))

            if only_own:
                cur.execute(
                    f"SELECT o.{f', o.'.join(ALL_KEYS)} FROM objects o JOIN object_access oa ON oa.object_id = o.id "
                    "WHERE o.company_id = %s AND oa.user_id = %s ORDER BY o.created_at DESC",
                    (company_id, user['user_id'])
                )
            else:
                cur.execute(
                    f"SELECT {select_cols} FROM objects WHERE company_id = %s ORDER BY created_at DESC",
                    (company_id,)
                )
            rows = cur.fetchall()
            return response(200, {'objects': [dict(zip(ALL_KEYS, r)) for r in rows]})

        if method == 'POST':
            if is_client or is_designer:
                return response(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            client_name = (body.get('client_name') or '').strip()

            if len(client_name) < 2:
                return response(400, {'error': 'Введите имя клиента'})

            design_project = body.get('design_project')
            if isinstance(design_project, list):
                design_project = json.dumps(design_project, ensure_ascii=False)
            else:
                design_project = (design_project or '').strip()

            values_map = {
                'client_name': client_name,
                'client_phone': (body.get('client_phone') or '').strip(),
                'object_type': (body.get('object_type') or 'вторичка').strip(),
                'area': body.get('area') or 0,
                'status': (body.get('status') or 'лид').strip(),
                'email': (body.get('email') or '').strip(),
                'legal_status': (body.get('legal_status') or 'физическое лицо').strip(),
                'address': (body.get('address') or '').strip(),
                'payment_type': (body.get('payment_type') or 'наличный расчет').strip(),
                'has_elevator': (body.get('has_elevator') or '').strip(),
                'residence_during_works': bool(body.get('residence_during_works', False)),
                'material_unloading': (body.get('material_unloading') or '').strip(),
                'completion_type': (body.get('completion_type') or 'стандарт').strip(),
                'warranty_waiver': bool(body.get('warranty_waiver', False)),
                'rough_material': (body.get('rough_material') or '').strip(),
                'finish_material': (body.get('finish_material') or '').strip(),
                'kitchen_furniture': (body.get('kitchen_furniture') or '').strip(),
                'measurer_comment': (body.get('measurer_comment') or '').strip(),
                'design_project': design_project,
            }

            year = datetime.utcnow().strftime('%y')
            cur.execute("SELECT COUNT(*) FROM objects WHERE company_id = %s", (company_id,))
            seq = cur.fetchone()[0] + 1
            object_code = f"{company_id:03d}-20{year}-{seq:04d}"

            insert_cols = ['company_id', 'object_code'] + FIELDS
            insert_vals = [company_id, object_code] + [values_map[f] for f in FIELDS]
            placeholders = ', '.join(['%s'] * len(insert_vals))

            cur.execute(
                f"INSERT INTO objects ({', '.join(insert_cols)}) VALUES ({placeholders}) RETURNING id, created_at, updated_at",
                insert_vals
            )
            new_id, created_at, updated_at = cur.fetchone()
            conn.commit()

            return response(200, {
                'id': new_id, 'object_code': object_code, 'created_at': created_at,
                'updated_at': updated_at, **values_map
            })

        if method == 'PUT':
            if is_client or is_designer:
                return response(403, {'error': 'Недостаточно прав'})
            if not object_id:
                return response(400, {'error': 'Не указан id объекта'})
            body = json.loads(event.get('body') or '{}')

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            fields = []
            values = []
            for key in FIELDS:
                if key in body:
                    value = body[key]
                    if key == 'design_project' and isinstance(value, list):
                        value = json.dumps(value, ensure_ascii=False)
                    fields.append(f"{key} = %s")
                    values.append(value)

            if fields:
                fields.append("updated_at = NOW()")
                values.append(object_id)
                values.append(company_id)
                cur.execute(f"UPDATE objects SET {', '.join(fields)} WHERE id = %s AND company_id = %s", values)
                conn.commit()

            return response(200, {'success': True})

        if method == 'DELETE':
            if is_client or is_designer:
                return response(403, {'error': 'Недостаточно прав'})
            if not object_id:
                return response(400, {'error': 'Не указан id объекта'})

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            cur.execute("DELETE FROM acts WHERE object_id = %s AND company_id = %s", (object_id, company_id))
            cur.execute("DELETE FROM contracts WHERE object_id = %s AND company_id = %s", (object_id, company_id))
            cur.execute(
                "DELETE FROM estimate_items WHERE estimate_id IN "
                "(SELECT id FROM estimates WHERE object_id = %s AND company_id = %s)",
                (object_id, company_id)
            )
            cur.execute("DELETE FROM estimates WHERE object_id = %s AND company_id = %s", (object_id, company_id))
            cur.execute("DELETE FROM object_rooms WHERE object_id = %s", (object_id,))
            cur.execute("DELETE FROM object_access WHERE object_id = %s", (object_id,))
            cur.execute("DELETE FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
