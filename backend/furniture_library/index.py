import base64
import json
import os
import uuid

import boto3
import psycopg2

MAX_MODEL = 20 * 1024 * 1024


def upload_model(company_id, b64):
    '''Сохраняет 3D-модель GLB в хранилище и возвращает ссылку'''
    try:
        data = base64.b64decode(b64.split(',', 1)[-1])
    except Exception:
        return None, 'Не удалось прочитать файл модели'
    if len(data) > MAX_MODEL:
        return None, 'Модель больше 20 МБ — упростите её или сожмите (например, в Blender с Draco)'
    if data[:4] != b'glTF':
        return None, 'Нужен файл .glb (бинарный glTF)'
    key = f"furniture/{company_id}/{uuid.uuid4().hex}.glb"
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType='model/gltf-binary')
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}", None

BASE_KINDS = {
    'bed_double', 'bed_single', 'sofa', 'armchair', 'wardrobe', 'dresser', 'nightstand',
    'table', 'desk', 'chair', 'tv_stand', 'shelf', 'kitchen_base', 'kitchen_wall', 'fridge',
    'stove', 'sink_kitchen', 'dishwasher', 'bath', 'shower', 'toilet_f', 'washbasin', 'washer',
    'boiler_f', 'towel_rail', 'curtain', 'tulle', 'rug_round', 'rug', 'custom',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400',
    }


def response(status, body):
    return {
        'statusCode': status,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str),
    }


def get_current_user(cur, event):
    headers = event.get('headers') or {}
    token = (headers.get('X-Authorization') or headers.get('x-authorization') or '').replace('Bearer ', '')
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.company_id FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,),
    )
    row = cur.fetchone()
    return {'user_id': row[0], 'company_id': row[1]} if row else None


def size(v, lo=0.05, hi=10.0):
    try:
        x = float(v)
    except (TypeError, ValueError):
        return None
    return x if lo <= x <= hi else None


COLS = ['id', 'name', 'base_kind', 'width', 'depth', 'height', 'at_wall', 'blocks_heating', 'blocks_sockets', 'color', 'material', 'model_url']


def row_to_item(r):
    d = dict(zip(COLS, r))
    for k in ('width', 'depth', 'height'):
        d[k] = float(d[k])
    return d


def validate(body):
    name = (body.get('name') or '').strip()[:120]
    if not name:
        return None, 'Укажите название предмета'
    w, d, h = size(body.get('width')), size(body.get('depth')), size(body.get('height'), 0.01, 5.0)
    if not w or not d or not h:
        return None, 'Размеры: ширина и глубина от 50 мм до 10 м, высота до 5 м'
    kind = body.get('base_kind') if body.get('base_kind') in BASE_KINDS else 'custom'
    color = (body.get('color') or '').strip()[:16] or None
    mat = body.get('material')
    mat = json.dumps(mat) if isinstance(mat, dict) and mat.get('url') else None
    model = (body.get('model_url') or '').strip()
    model = model if model.startswith('https://cdn.poehali.dev/') and model.endswith('.glb') else None
    return (name, kind, w, d, h, bool(body.get('at_wall', True)), bool(body.get('blocks_heating', True)),
            bool(body.get('blocks_sockets', False)), color, mat, model), None


def handler(event: dict, context) -> dict:
    '''Библиотека своих предметов мебели компании: название, размеры и свойства — для расстановки на любых объектах'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = get_conn()
    cur = conn.cursor()
    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        company = user['company_id']
        params = event.get('queryStringParameters') or {}

        if method == 'GET':
            cur.execute(
                f"SELECT {', '.join(COLS)} FROM furniture_library WHERE company_id = %s ORDER BY name",
                (company,),
            )
            return response(200, {'items': [row_to_item(r) for r in cur.fetchall()]})

        body = json.loads(event.get('body') or '{}')

        # Загрузка модели отдельным запросом: в ответ ссылка, её сохраняют в предмет
        if method == 'POST' and body.get('action') == 'model':
            url, err = upload_model(company, body.get('data') or '')
            if err:
                return response(400, {'error': err})
            return response(200, {'url': url})

        if method == 'POST':
            vals, err = validate(body)
            if err:
                return response(400, {'error': err})
            cur.execute(
                "INSERT INTO furniture_library (company_id, name, base_kind, width, depth, height, at_wall, "
                "blocks_heating, blocks_sockets, color, material, model_url, created_by) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
                f"RETURNING {', '.join(COLS)}",
                (company, *vals, user['user_id']),
            )
            item = row_to_item(cur.fetchone())
            conn.commit()
            return response(200, {'item': item})

        if method == 'PUT':
            item_id = body.get('id')
            vals, err = validate(body)
            if err:
                return response(400, {'error': err})
            cur.execute(
                "UPDATE furniture_library SET name = %s, base_kind = %s, width = %s, depth = %s, height = %s, "
                "at_wall = %s, blocks_heating = %s, blocks_sockets = %s, color = %s, material = %s, model_url = %s, updated_at = now() "
                f"WHERE id = %s AND company_id = %s RETURNING {', '.join(COLS)}",
                (*vals, item_id, company),
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Предмет не найден'})
            conn.commit()
            return response(200, {'item': row_to_item(row)})

        if method == 'DELETE':
            item_id = params.get('id') or body.get('id')
            cur.execute("DELETE FROM furniture_library WHERE id = %s AND company_id = %s", (item_id, company))
            conn.commit()
            return response(200, {'success': cur.rowcount > 0})

        return response(400, {'error': 'Неизвестный запрос'})
    except Exception as e:
        conn.rollback()
        return response(500, {'error': str(e)})
    finally:
        cur.close()
        conn.close()
