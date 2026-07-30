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
        "SELECT u.id, u.company_id, u.role, u.position FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2], 'position': row[3]}


STATUS_KEYS = ['id', 'name', 'color', 'sort_order', 'is_default', 'is_active_stage', 'is_final', 'is_archived']


def handler(event: dict, context) -> dict:
    '''Управление настраиваемой воронкой статусов объектов: список статусов, сортировка, архивирование и разрешённые переходы между статусами'''
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

        can_manage = user['role'] == 'owner' or user['position'] in ('super_admin', 'director')

        params = event.get('queryStringParameters') or {}
        status_id = params.get('id')
        action = params.get('action')

        if method == 'GET' and action == 'transitions':
            if not status_id:
                return response(400, {'error': 'Не указан id статуса'})
            cur.execute(
                "SELECT to_status_id FROM object_status_transitions WHERE company_id = %s AND from_status_id = %s",
                (company_id, status_id)
            )
            to_ids = [r[0] for r in cur.fetchall()]
            return response(200, {'to_status_ids': to_ids})

        if method == 'GET':
            cur.execute(
                f"SELECT {', '.join(STATUS_KEYS)} FROM object_statuses WHERE company_id = %s ORDER BY is_archived, sort_order",
                (company_id,)
            )
            rows = cur.fetchall()
            statuses = [dict(zip(STATUS_KEYS, r)) for r in rows]

            cur.execute(
                "SELECT status, COUNT(*) FROM objects WHERE company_id = %s GROUP BY status",
                (company_id,)
            )
            counts = {r[0]: r[1] for r in cur.fetchall()}
            for s in statuses:
                s['object_count'] = counts.get(s['name'], 0)

            cur.execute(
                "SELECT from_status_id, to_status_id FROM object_status_transitions WHERE company_id = %s",
                (company_id,)
            )
            transitions = [{'from_status_id': r[0], 'to_status_id': r[1]} for r in cur.fetchall()]

            return response(200, {'statuses': statuses, 'transitions': transitions})

        if method == 'POST':
            if not can_manage:
                return response(403, {'error': 'Управление статусами доступно только директору и супер-администратору'})
            body = json.loads(event.get('body') or '{}')
            name = (body.get('name') or '').strip()
            color = (body.get('color') or 'gray').strip()
            is_active_stage = bool(body.get('is_active_stage', False))
            is_final = bool(body.get('is_final', False))

            if len(name) < 1:
                return response(400, {'error': 'Введите название статуса'})

            cur.execute("SELECT id FROM object_statuses WHERE company_id = %s AND name = %s", (company_id, name))
            if cur.fetchone():
                return response(409, {'error': 'Статус с таким названием уже существует'})

            cur.execute(
                "SELECT COALESCE(MAX(sort_order), 0) FROM object_statuses WHERE company_id = %s",
                (company_id,)
            )
            next_order = (cur.fetchone()[0] or 0) + 10

            cur.execute(
                "INSERT INTO object_statuses (company_id, name, color, sort_order, is_active_stage, is_final) "
                "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, name, color, next_order, is_active_stage, is_final)
            )
            new_id = cur.fetchone()[0]
            conn.commit()

            return response(200, {
                'id': new_id, 'name': name, 'color': color, 'sort_order': next_order,
                'is_default': False, 'is_active_stage': is_active_stage, 'is_final': is_final,
                'is_archived': False, 'object_count': 0
            })

        if method == 'PUT' and action == 'reorder':
            if not can_manage:
                return response(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            order = body.get('order') or []
            for idx, sid in enumerate(order):
                cur.execute(
                    "UPDATE object_statuses SET sort_order = %s WHERE id = %s AND company_id = %s",
                    ((idx + 1) * 10, sid, company_id)
                )
            conn.commit()
            return response(200, {'success': True})

        if method == 'PUT' and action == 'transitions':
            if not can_manage:
                return response(403, {'error': 'Недостаточно прав'})
            if not status_id:
                return response(400, {'error': 'Не указан id статуса'})
            body = json.loads(event.get('body') or '{}')
            to_ids = body.get('to_status_ids') or []

            cur.execute("SELECT id FROM object_statuses WHERE id = %s AND company_id = %s", (status_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Статус не найден'})

            cur.execute(
                "DELETE FROM object_status_transitions WHERE company_id = %s AND from_status_id = %s",
                (company_id, status_id)
            )
            for to_id in to_ids:
                cur.execute("SELECT id FROM object_statuses WHERE id = %s AND company_id = %s", (to_id, company_id))
                if cur.fetchone():
                    cur.execute(
                        "INSERT INTO object_status_transitions (company_id, from_status_id, to_status_id) VALUES (%s, %s, %s) "
                        "ON CONFLICT (from_status_id, to_status_id) DO NOTHING",
                        (company_id, status_id, to_id)
                    )
            conn.commit()
            return response(200, {'success': True})

        if method == 'PUT':
            if not can_manage:
                return response(403, {'error': 'Управление статусами доступно только директору и супер-администратору'})
            if not status_id:
                return response(400, {'error': 'Не указан id статуса'})
            body = json.loads(event.get('body') or '{}')

            cur.execute("SELECT id, name, is_default FROM object_statuses WHERE id = %s AND company_id = %s", (status_id, company_id))
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Статус не найден'})

            fields = []
            values = []

            if 'name' in body:
                new_name = (body.get('name') or '').strip()
                if len(new_name) < 1:
                    return response(400, {'error': 'Введите название статуса'})
                fields.append("name = %s")
                values.append(new_name)
            if 'color' in body:
                fields.append("color = %s")
                values.append(body['color'])
            if 'is_active_stage' in body:
                fields.append("is_active_stage = %s")
                values.append(bool(body['is_active_stage']))
            if 'is_final' in body:
                fields.append("is_final = %s")
                values.append(bool(body['is_final']))
            if 'is_archived' in body:
                fields.append("is_archived = %s")
                values.append(bool(body['is_archived']))

            if fields:
                values.append(status_id)
                values.append(company_id)
                cur.execute(f"UPDATE object_statuses SET {', '.join(fields)} WHERE id = %s AND company_id = %s", values)

                if 'name' in body and body['name'] != row[1]:
                    cur.execute(
                        "UPDATE objects SET status = %s WHERE company_id = %s AND status = %s",
                        (body['name'], company_id, row[1])
                    )
                conn.commit()

            return response(200, {'success': True})

        if method == 'DELETE':
            if not can_manage:
                return response(403, {'error': 'Недостаточно прав'})
            if not status_id:
                return response(400, {'error': 'Не указан id статуса'})

            cur.execute("SELECT name, is_default FROM object_statuses WHERE id = %s AND company_id = %s", (status_id, company_id))
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Статус не найден'})
            if row[1]:
                return response(400, {'error': 'Нельзя удалить статус по умолчанию'})

            cur.execute("SELECT COUNT(*) FROM objects WHERE company_id = %s AND status = %s", (company_id, row[0]))
            if cur.fetchone()[0] > 0:
                return response(400, {'error': 'Нельзя удалить статус, который используется объектами. Перенесите объекты в другой статус или используйте архив'})

            cur.execute(
                "DELETE FROM object_status_transitions WHERE company_id = %s AND (from_status_id = %s OR to_status_id = %s)",
                (company_id, status_id, status_id)
            )
            cur.execute("DELETE FROM object_statuses WHERE id = %s AND company_id = %s", (status_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()