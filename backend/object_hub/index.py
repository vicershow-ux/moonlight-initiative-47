import base64
import json
import os
import uuid
from datetime import date

import boto3
import psycopg2

IMAGE_EXT = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp'}
MAX_PHOTO = 8 * 1024 * 1024
MAX_PHOTOS = 10
STAFF_ROLES = ('owner', 'admin', 'employee')


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400'
    }


def response(status, body):
    return {
        'statusCode': status,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str)
    }


def get_current_user(cur, event):
    headers = event.get('headers') or {}
    token = (headers.get('X-Authorization') or headers.get('x-authorization') or '').replace('Bearer ', '')
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.company_id, u.role, u.full_name FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    r = cur.fetchone()
    if not r:
        return None
    return {'user_id': r[0], 'company_id': r[1], 'role': r[2], 'full_name': r[3] or ''}


def has_access(cur, user, object_id):
    cur.execute("SELECT 1 FROM objects WHERE id = %s AND company_id = %s", (object_id, user['company_id']))
    if not cur.fetchone():
        return False
    if user['role'] in ('owner', 'admin'):
        return True
    if user['role'] == 'client':
        cur.execute("SELECT 1 FROM object_access WHERE user_id = %s AND object_id = %s", (user['user_id'], object_id))
        return cur.fetchone() is not None
    return True


def upload_photos(company_id, object_id, folder, photos):
    '''Загружает фото (base64) в хранилище, возвращает список ссылок'''
    if not photos:
        return [], None
    if len(photos) > MAX_PHOTOS:
        return None, f'Можно приложить не больше {MAX_PHOTOS} фото'
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    cdn = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket"
    urls = []
    for p in photos:
        name = str(p.get('name') or 'photo.jpg')
        data = str(p.get('data') or '')
        ext = (name.rsplit('.', 1)[-1] if '.' in name else 'jpg').lower()
        if data.startswith('data:image/jpeg'):
            ext = 'jpg'
        if ext not in IMAGE_EXT:
            return None, 'Можно прикладывать только фото (JPG, PNG, WEBP)'
        raw = data.split(',', 1)[1] if ',' in data else data
        blob = base64.b64decode(raw)
        if len(blob) > MAX_PHOTO:
            return None, 'Фото больше 8 МБ'
        key = f"objects/{company_id}/{object_id}/{folder}/{uuid.uuid4().hex}.{ext}"
        s3.put_object(Bucket='files', Key=key, Body=blob, ContentType=IMAGE_EXT[ext])
        urls.append(f"{cdn}/{key}")
    return urls, None


def notify(cur, company_id, ntype, title, message, payload):
    cur.execute(
        "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
        (company_id, ntype, title, message[:500], json.dumps(payload))
    )


def object_code(cur, object_id):
    cur.execute("SELECT object_code FROM objects WHERE id = %s", (object_id,))
    r = cur.fetchone()
    return r[0] if r else ''


# ---------- Чат ----------

MSG_KEYS = ['id', 'user_id', 'body', 'photos', 'created_at', 'author_name', 'author_role']


def chat(cur, conn, user, method, params, body):
    object_id = params.get('object_id') or body.get('object_id')
    if not object_id or not has_access(cur, user, object_id):
        return response(403, {'error': 'Нет доступа к объекту'})

    if method == 'GET':
        after = int(params.get('after_id') or 0)
        cur.execute(
            "SELECT m.id, m.user_id, m.body, m.photos, m.created_at, u.full_name, u.role "
            "FROM object_messages m JOIN users u ON u.id = m.user_id "
            "WHERE m.object_id = %s AND m.company_id = %s AND m.id > %s ORDER BY m.id DESC LIMIT 200",
            (object_id, user['company_id'], after)
        )
        msgs = [dict(zip(MSG_KEYS, r)) for r in cur.fetchall()][::-1]
        if msgs:
            cur.execute(
                "INSERT INTO object_message_reads (user_id, object_id, last_read_id) VALUES (%s, %s, %s) "
                "ON CONFLICT (user_id, object_id) DO UPDATE SET last_read_id = GREATEST(object_message_reads.last_read_id, EXCLUDED.last_read_id)",
                (user['user_id'], object_id, msgs[-1]['id'])
            )
            conn.commit()
        return response(200, {'messages': msgs})

    if method == 'POST':
        text = str(body.get('body') or '').strip()[:4000]
        urls, err = upload_photos(user['company_id'], object_id, 'chat', body.get('photos') or [])
        if err:
            return response(400, {'error': err})
        if not text and not urls:
            return response(400, {'error': 'Напишите сообщение или приложите фото'})
        cur.execute(
            "INSERT INTO object_messages (company_id, object_id, user_id, body, photos) VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at",
            (user['company_id'], object_id, user['user_id'], text, json.dumps(urls))
        )
        new_id, created = cur.fetchone()
        cur.execute(
            "INSERT INTO object_message_reads (user_id, object_id, last_read_id) VALUES (%s, %s, %s) "
            "ON CONFLICT (user_id, object_id) DO UPDATE SET last_read_id = EXCLUDED.last_read_id",
            (user['user_id'], object_id, new_id)
        )
        if user['role'] == 'client':
            preview = text[:120] or f'Фото: {len(urls)}'
            notify(cur, user['company_id'], 'chat_message', 'Новое сообщение от заказчика',
                   f"{user['full_name']} · {object_code(cur, object_id)}: {preview}", {'object_id': int(object_id)})
        conn.commit()
        return response(200, {'id': new_id, 'created_at': created, 'photos': urls})

    return response(405, {'error': 'Метод не поддерживается'})


# ---------- Фотоотчёты ----------

REPORT_KEYS = ['id', 'stage', 'caption', 'photos', 'created_at', 'user_id', 'author_name']


def reports(cur, conn, user, method, params, body):
    if method == 'DELETE':
        rid = params.get('id')
        cur.execute("SELECT object_id FROM object_photo_reports WHERE id = %s AND company_id = %s", (rid, user['company_id']))
        r = cur.fetchone()
        if not r or user['role'] not in STAFF_ROLES:
            return response(403, {'error': 'Недостаточно прав'})
        cur.execute("DELETE FROM object_photo_reports WHERE id = %s", (rid,))
        conn.commit()
        return response(200, {'success': True})

    object_id = params.get('object_id') or body.get('object_id')
    if not object_id or not has_access(cur, user, object_id):
        return response(403, {'error': 'Нет доступа к объекту'})

    if method == 'GET':
        cur.execute(
            "SELECT r.id, r.stage, r.caption, r.photos, r.created_at, r.user_id, u.full_name "
            "FROM object_photo_reports r JOIN users u ON u.id = r.user_id "
            "WHERE r.object_id = %s AND r.company_id = %s ORDER BY r.created_at DESC",
            (object_id, user['company_id'])
        )
        return response(200, {'reports': [dict(zip(REPORT_KEYS, r)) for r in cur.fetchall()]})

    if method == 'POST':
        if user['role'] not in STAFF_ROLES:
            return response(403, {'error': 'Фотоотчёты добавляют сотрудники'})
        stage = str(body.get('stage') or '').strip()[:100]
        caption = str(body.get('caption') or '').strip()[:2000]
        if not stage:
            return response(400, {'error': 'Укажите этап ремонта'})
        urls, err = upload_photos(user['company_id'], object_id, 'reports', body.get('photos') or [])
        if err:
            return response(400, {'error': err})
        if not urls:
            return response(400, {'error': 'Приложите хотя бы одно фото'})
        cur.execute(
            "INSERT INTO object_photo_reports (company_id, object_id, user_id, stage, caption, photos) "
            "VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
            (user['company_id'], object_id, user['user_id'], stage, caption, json.dumps(urls))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return response(200, {'id': new_id, 'photos': urls})

    return response(405, {'error': 'Метод не поддерживается'})


# ---------- График платежей ----------

PAY_KEYS = ['id', 'title', 'amount', 'due_date', 'paid_amount', 'paid_at', 'sort_order', 'note']


def to_num(v):
    try:
        return max(0.0, round(float(str(v).replace(',', '.').replace(' ', '') or 0), 2))
    except ValueError:
        return 0.0


def to_date(v):
    v = str(v or '').strip()[:10]
    if not v:
        return None
    try:
        return date.fromisoformat(v).isoformat()
    except ValueError:
        return None


def payments(cur, conn, user, method, params, body):
    object_id = params.get('object_id') or body.get('object_id')
    if not object_id or not has_access(cur, user, object_id):
        return response(403, {'error': 'Нет доступа к объекту'})

    if method == 'GET':
        cur.execute(
            f"SELECT {', '.join(PAY_KEYS)} FROM object_payments WHERE object_id = %s AND company_id = %s ORDER BY sort_order, id",
            (object_id, user['company_id'])
        )
        return response(200, {'payments': [dict(zip(PAY_KEYS, r)) for r in cur.fetchall()]})

    if method == 'PUT':
        if user['role'] not in STAFF_ROLES:
            return response(403, {'error': 'Недостаточно прав'})
        rows = body.get('payments') or []
        if len(rows) > 50:
            return response(400, {'error': 'Слишком много этапов'})
        clean = []
        for i, r in enumerate(rows):
            title = str(r.get('title') or '').strip()[:255]
            if not title:
                continue
            amount = to_num(r.get('amount'))
            paid = min(to_num(r.get('paid_amount')), amount) if amount else to_num(r.get('paid_amount'))
            clean.append((title, amount, to_date(r.get('due_date')), paid,
                          to_date(r.get('paid_at')) if paid > 0 else None, i, str(r.get('note') or '').strip()[:500]))
        cur.execute("DELETE FROM object_payments WHERE object_id = %s AND company_id = %s", (object_id, user['company_id']))
        for c in clean:
            cur.execute(
                "INSERT INTO object_payments (company_id, object_id, title, amount, due_date, paid_amount, paid_at, sort_order, note) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (user['company_id'], object_id) + c
            )
        conn.commit()
        return payments(cur, conn, user, 'GET', {'object_id': object_id}, {})

    return response(405, {'error': 'Метод не поддерживается'})


def unread(cur, user):
    '''Непрочитанные сообщения чата по объектам пользователя'''
    access = ''
    args = [user['user_id'], user['company_id'], user['user_id']]
    if user['role'] == 'client':
        access = " AND m.object_id IN (SELECT object_id FROM object_access WHERE user_id = %s)"
        args.append(user['user_id'])
    cur.execute(
        "SELECT m.object_id, COUNT(*) FROM object_messages m "
        "LEFT JOIN object_message_reads r ON r.object_id = m.object_id AND r.user_id = %s "
        "WHERE m.company_id = %s AND m.user_id <> %s AND m.id > COALESCE(r.last_read_id, 0)" + access +
        " GROUP BY m.object_id",
        args
    )
    return response(200, {'unread': {str(r[0]): r[1] for r in cur.fetchall()}})


def handler(event: dict, context) -> dict:
    '''Кабинет объекта: чат заказчика с сотрудниками, фотоотчёты по этапам ремонта и график платежей'''
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
        body = json.loads(event.get('body') or '{}') if method in ('POST', 'PUT') else {}
        resource = params.get('resource') or ''
        if resource == 'chat':
            return chat(cur, conn, user, method, params, body)
        if resource == 'reports':
            return reports(cur, conn, user, method, params, body)
        if resource == 'payments':
            return payments(cur, conn, user, method, params, body)
        if resource == 'unread' and method == 'GET':
            return unread(cur, user)
        return response(400, {'error': 'Неизвестный раздел'})
    finally:
        cur.close()
        conn.close()
