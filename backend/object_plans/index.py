import base64
import json
import os
import uuid

import boto3
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
        "SELECT u.id, u.company_id, u.role FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2]}


def has_access(cur, user, object_id):
    cur.execute(
        "SELECT 1 FROM objects WHERE id = %s AND company_id = %s",
        (object_id, user['company_id'])
    )
    return cur.fetchone() is not None


def to_num(v, default=0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


MAX_SIZE = 15 * 1024 * 1024


def upload_pdf(company_id, object_id, file_name, b64data):
    try:
        file_bytes = base64.b64decode(b64data)
    except Exception:
        return None, None, 'Не удалось прочитать файл'

    if len(file_bytes) > MAX_SIZE:
        return None, None, 'Файл больше 15 МБ'

    key = f"objects/{company_id}/{object_id}/plan-{uuid.uuid4().hex}.pdf"
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=file_bytes,
                  ContentType='application/pdf')
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return url, len(file_bytes), None


def sync_rooms(cur, company_id, object_id, rooms):
    """Переносит комнаты из плана в помещения объекта: обновляет существующие по имени, добавляет новые."""
    if not isinstance(rooms, list):
        return 0

    cur.execute(
        "SELECT id, name FROM object_rooms WHERE object_id = %s", (object_id,)
    )
    existing = {(r[1] or '').strip().lower(): r[0] for r in cur.fetchall()}
    saved = 0

    for room in rooms:
        name = (room.get('name') or '').strip()
        if not name:
            continue
        area = to_num(room.get('area'))
        perimeter = to_num(room.get('perimeter'))
        height = to_num(room.get('height'))
        wall_area = to_num(room.get('wall_area_net'), to_num(room.get('wall_area')))
        room_type = (room.get('room_type') or '').strip()

        found = existing.get(name.lower())
        if found:
            cur.execute(
                "UPDATE object_rooms SET area = %s, perimeter = %s, ceiling_height = %s, "
                "wall_area = %s, room_type = COALESCE(NULLIF(%s, ''), room_type), "
                "updated_at = now() WHERE id = %s",
                (area, perimeter, height, wall_area, room_type, found)
            )
        else:
            cur.execute(
                "INSERT INTO object_rooms (object_id, name, room_type, area, perimeter, "
                "ceiling_height, wall_area, notes) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (object_id, name, room_type, area, perimeter, height, wall_area,
                 'Создано планировщиком')
            )
        saved += 1

    return saved


def handler(event: dict, context) -> dict:
    '''Планировщик помещений: хранение схемы объекта, расчёт метража и выгрузка плана в PDF с заменой прежнего файла'''
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
        object_id = params.get('object_id')

        if method == 'GET':
            if not object_id:
                return response(400, {'error': 'Не указан объект'})
            if not has_access(cur, user, object_id):
                return response(403, {'error': 'Нет доступа к объекту'})

            cur.execute(
                "SELECT p.id, p.scheme, p.default_height, p.total_floor_area, "
                "p.total_wall_area, p.total_perimeter, p.file_id, p.updated_at, f.file_url "
                "FROM object_plans p LEFT JOIN object_files f ON f.id = p.file_id "
                "WHERE p.object_id = %s AND p.company_id = %s ORDER BY p.id DESC LIMIT 1",
                (object_id, company_id)
            )
            row = cur.fetchone()
            if not row:
                return response(200, {'plan': None})

            keys = ['id', 'scheme', 'default_height', 'total_floor_area',
                    'total_wall_area', 'total_perimeter', 'file_id', 'updated_at', 'file_url']
            return response(200, {'plan': dict(zip(keys, row))})

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            obj_id = body.get('object_id')
            if not obj_id:
                return response(400, {'error': 'Не указан объект'})
            if not has_access(cur, user, obj_id):
                return response(403, {'error': 'Нет доступа к объекту'})

            scheme = body.get('scheme') or {}
            totals = body.get('totals') or {}
            pdf_data = body.get('pdf_data') or ''
            sync = bool(body.get('sync_rooms'))

            cur.execute(
                "SELECT id, file_id FROM object_plans WHERE object_id = %s AND company_id = %s "
                "ORDER BY id DESC LIMIT 1",
                (obj_id, company_id)
            )
            existing = cur.fetchone()
            plan_id = existing[0] if existing else None
            old_file_id = existing[1] if existing else None

            new_file_id = old_file_id
            file_url = None

            if pdf_data:
                file_name = (body.get('file_name') or 'План помещений.pdf').strip()
                if not file_name.lower().endswith('.pdf'):
                    file_name += '.pdf'

                url, size, err = upload_pdf(company_id, obj_id, file_name, pdf_data)
                if err:
                    return response(400, {'error': err})
                file_url = url

                if old_file_id:
                    cur.execute(
                        "UPDATE object_files SET file_name = %s, file_url = %s, "
                        "file_size = %s, created_at = now() "
                        "WHERE id = %s AND company_id = %s RETURNING id",
                        (file_name, url, size, old_file_id, company_id)
                    )
                    updated = cur.fetchone()
                    new_file_id = updated[0] if updated else None

                if not new_file_id:
                    cur.execute(
                        "INSERT INTO object_files (company_id, object_id, user_id, file_name, "
                        "file_url, file_type, file_size) VALUES (%s, %s, %s, %s, %s, 'pdf', %s) "
                        "RETURNING id",
                        (company_id, obj_id, user['user_id'], file_name, url, size)
                    )
                    new_file_id = cur.fetchone()[0]

            if plan_id:
                cur.execute(
                    "UPDATE object_plans SET scheme = %s, default_height = %s, "
                    "total_floor_area = %s, total_wall_area = %s, total_perimeter = %s, "
                    "file_id = %s, updated_at = now() WHERE id = %s AND company_id = %s",
                    (json.dumps(scheme), to_num(body.get('default_height'), 2.7),
                     to_num(totals.get('floor')), to_num(totals.get('wall')),
                     to_num(totals.get('perimeter')), new_file_id, plan_id, company_id)
                )
            else:
                cur.execute(
                    "INSERT INTO object_plans (company_id, object_id, scheme, default_height, "
                    "total_floor_area, total_wall_area, total_perimeter, file_id, created_by) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (company_id, obj_id, json.dumps(scheme),
                     to_num(body.get('default_height'), 2.7),
                     to_num(totals.get('floor')), to_num(totals.get('wall')),
                     to_num(totals.get('perimeter')), new_file_id, user['user_id'])
                )
                plan_id = cur.fetchone()[0]

            synced = 0
            if sync:
                synced = sync_rooms(cur, company_id, obj_id, scheme.get('rooms') or [])

            conn.commit()
            return response(200, {
                'success': True,
                'id': plan_id,
                'file_id': new_file_id,
                'file_url': file_url,
                'synced_rooms': synced,
            })

        return response(400, {'error': 'Неизвестный запрос'})

    except Exception as e:
        conn.rollback()
        return response(500, {'error': str(e)})
    finally:
        cur.close()
        conn.close()
