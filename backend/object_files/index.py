import base64
import json
import os
import uuid
import boto3
import psycopg2


ALLOWED = {
    'jpg': ('image/jpeg', 'photo'),
    'jpeg': ('image/jpeg', 'photo'),
    'png': ('image/png', 'photo'),
    'webp': ('image/webp', 'photo'),
    'heic': ('image/heic', 'photo'),
    'pdf': ('application/pdf', 'pdf'),
    'xls': ('application/vnd.ms-excel', 'excel'),
    'xlsx': ('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'excel'),
    'csv': ('text/csv', 'excel'),
}

MAX_SIZE = 15 * 1024 * 1024

KEYS = ['id', 'object_id', 'user_id', 'file_name', 'file_url', 'file_type',
        'file_size', 'created_at', 'uploader_name']


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
        "SELECT u.id, u.company_id, u.role, u.position, u.full_name FROM sessions s "
        "JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2],
            'position': row[3], 'full_name': row[4]}


def restricted(user):
    '''Дизайнер и клиент видят только привязанные объекты'''
    return user['role'] == 'client' or user['position'] == 'designer'


def has_access(cur, user, object_id):
    cur.execute(
        "SELECT 1 FROM objects WHERE id = %s AND company_id = %s",
        (object_id, user['company_id'])
    )
    if not cur.fetchone():
        return False
    if not restricted(user):
        return True
    cur.execute(
        "SELECT 1 FROM object_access WHERE user_id = %s AND object_id = %s",
        (user['user_id'], object_id)
    )
    return cur.fetchone() is not None


def upload_to_s3(company_id, object_id, file_name, b64data):
    if ',' in b64data:
        b64data = b64data.split(',', 1)[1]
    file_bytes = base64.b64decode(b64data)
    if len(file_bytes) > MAX_SIZE:
        return None, None, 'Файл больше 15 МБ'

    ext = (file_name.rsplit('.', 1)[-1] if '.' in file_name else '').lower()
    if ext not in ALLOWED:
        return None, None, 'Можно загружать фото, PDF и Excel'

    content_type, kind = ALLOWED[ext]
    key = f"objects/{company_id}/{object_id}/{uuid.uuid4().hex}.{ext}"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=file_bytes, ContentType=content_type)
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return url, (kind, len(file_bytes)), None


def handler(event: dict, context) -> dict:
    '''Файлы объекта: загрузка фото, PDF и Excel дизайнером и сотрудниками'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = get_conn()
    cur = conn.cursor()

    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})

        params = event.get('queryStringParameters') or {}
        object_id = params.get('object_id')
        row_id = params.get('id')

        if method == 'GET':
            if not object_id:
                return response(400, {'error': 'Не указан объект'})
            if not has_access(cur, user, object_id):
                return response(403, {'error': 'Нет доступа к объекту'})
            cur.execute(
                "SELECT f.id, f.object_id, f.user_id, f.file_name, f.file_url, f.file_type, "
                "f.file_size, f.created_at, u.full_name "
                "FROM object_files f JOIN users u ON u.id = f.user_id "
                "WHERE f.object_id = %s AND f.company_id = %s ORDER BY f.created_at DESC",
                (object_id, user['company_id'])
            )
            files = [dict(zip(KEYS, r)) for r in cur.fetchall()]
            return response(200, {'files': files})

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            obj_id = body.get('object_id')
            if not obj_id:
                return response(400, {'error': 'Не указан объект'})
            if not has_access(cur, user, obj_id):
                return response(403, {'error': 'Нет доступа к объекту'})

            file_name = (body.get('file_name') or '').strip()
            data = body.get('data') or ''
            if not file_name or not data:
                return response(400, {'error': 'Выберите файл'})

            url, meta, err = upload_to_s3(user['company_id'], obj_id, file_name, data)
            if err:
                return response(400, {'error': err})

            kind, size = meta
            cur.execute(
                "INSERT INTO object_files (company_id, object_id, user_id, file_name, "
                "file_url, file_type, file_size) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (user['company_id'], obj_id, user['user_id'], file_name, url, kind, size)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': new_id, 'url': url})

        if method == 'DELETE':
            if not row_id:
                return response(400, {'error': 'Не указан файл'})
            cur.execute(
                "SELECT object_id, user_id FROM object_files WHERE id = %s AND company_id = %s",
                (row_id, user['company_id'])
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Файл не найден'})
            if restricted(user) and row[1] != user['user_id']:
                return response(403, {'error': 'Можно удалять только свои файлы'})
            if not has_access(cur, user, row[0]):
                return response(403, {'error': 'Нет доступа к объекту'})
            cur.execute(
                "DELETE FROM object_files WHERE id = %s AND company_id = %s",
                (row_id, user['company_id'])
            )
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
