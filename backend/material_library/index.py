import base64
import json
import os
import uuid

import boto3
import psycopg2

CATEGORIES = {'wallpaper', 'fresco', 'tile', 'floor', 'fabric', 'wood', 'stone', 'paint', 'other'}
MODES = {'repeat', 'panel'}
MAX_BYTES = 8 * 1024 * 1024
COLS = ['id', 'name', 'category', 'image_url', 'width', 'height', 'mode', 'gloss', 'unit', 'note', 'shop_material_id']


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400',
    }


def response(status, body):
    return {'statusCode': status, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps(body, default=str)}


def get_current_user(cur, event):
    headers = event.get('headers') or {}
    token = (headers.get('X-Authorization') or headers.get('x-authorization') or '').replace('Bearer ', '')
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.company_id FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,),
    )
    row = cur.fetchone()
    return {'user_id': row[0], 'company_id': row[1]} if row else None


def row_to_item(r):
    d = dict(zip(COLS, r))
    d['width'] = float(d['width'])
    d['height'] = float(d['height'])
    return d


def upload_image(company_id, b64, content_type):
    data = base64.b64decode(b64.split(',', 1)[-1])
    if len(data) > MAX_BYTES:
        return None, 'Файл больше 8 МБ — уменьшите картинку'
    ext = {'image/png': 'png', 'image/webp': 'webp'}.get(content_type, 'jpg')
    key = f"materials/{company_id}/{uuid.uuid4().hex}.{ext}"
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type or 'image/jpeg')
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}", None


def size(v, lo=0.01, hi=20.0):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    return x if lo <= x <= hi else None


def validate(body):
    name = (body.get('name') or '').strip()[:160]
    if not name:
        return None, 'Укажите название материала'
    w, h = size(body.get('width')), size(body.get('height'))
    if not w or not h:
        return None, 'Размер рисунка: от 10 мм до 20 м'
    return {
        'name': name,
        'category': body.get('category') if body.get('category') in CATEGORIES else 'other',
        'width': w,
        'height': h,
        'mode': body.get('mode') if body.get('mode') in MODES else 'repeat',
        'gloss': bool(body.get('gloss')),
        'unit': 'pcs' if body.get('unit') == 'pcs' else 'm2',
        'note': (body.get('note') or '').strip()[:200] or None,
        'shop': int(body['shop_material_id']) if str(body.get('shop_material_id') or '').isdigit() else None,
    }, None


def handler(event: dict, context) -> dict:
    '''Библиотека своих материалов компании: фото обоев, фресок, плитки, тканей и дерева с реальным размером рисунка для 3D и развёрток'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        company = user['company_id']
        params = event.get('queryStringParameters') or {}

        if method == 'GET':
            cur.execute(f"SELECT {', '.join(COLS)} FROM material_library WHERE company_id = %s ORDER BY category, name", (company,))
            return response(200, {'items': [row_to_item(r) for r in cur.fetchall()]})

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            v, err = validate(body)
            if err:
                return response(400, {'error': err})
            if not body.get('image'):
                return response(400, {'error': 'Загрузите фото материала'})
            url, err = upload_image(company, body['image'], body.get('content_type') or 'image/jpeg')
            if err:
                return response(400, {'error': err})
            if v['shop']:
                cur.execute("SELECT 1 FROM materials WHERE id = %s AND company_id = %s", (v['shop'], company))
                if not cur.fetchone():
                    v['shop'] = None
            cur.execute(
                "INSERT INTO material_library (company_id, name, category, image_url, width, height, mode, gloss, unit, note, shop_material_id, created_by) "
                f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING {', '.join(COLS)}",
                (company, v['name'], v['category'], url, v['width'], v['height'], v['mode'], v['gloss'], v['unit'], v['note'], v['shop'], user['user_id']),
            )
            item = row_to_item(cur.fetchone())
            conn.commit()
            return response(200, {'item': item})

        if method == 'PUT':
            v, err = validate(body)
            if err:
                return response(400, {'error': err})
            image_sql, image_args = '', ()
            if body.get('image'):
                url, err = upload_image(company, body['image'], body.get('content_type') or 'image/jpeg')
                if err:
                    return response(400, {'error': err})
                image_sql, image_args = ', image_url = %s', (url,)
            cur.execute(
                "UPDATE material_library SET name = %s, category = %s, width = %s, height = %s, mode = %s, gloss = %s, unit = %s, note = %s, shop_material_id = COALESCE(%s, shop_material_id)"
                f"{image_sql}, updated_at = now() "
                f"WHERE id = %s AND company_id = %s RETURNING {', '.join(COLS)}",
                (v['name'], v['category'], v['width'], v['height'], v['mode'], v['gloss'], v['unit'], v['note'], v['shop'], *image_args, body.get('id'), company),
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Материал не найден'})
            conn.commit()
            return response(200, {'item': row_to_item(row)})

        if method == 'DELETE':
            cur.execute("DELETE FROM material_library WHERE id = %s AND company_id = %s", (params.get('id') or body.get('id'), company))
            conn.commit()
            return response(200, {'success': cur.rowcount > 0})

        return response(400, {'error': 'Неизвестный запрос'})
    except Exception as e:
        conn.rollback()
        return response(500, {'error': str(e)})
    finally:
        cur.close()
        conn.close()
