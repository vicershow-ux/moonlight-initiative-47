import json
import os
import base64
import uuid
import psycopg2
import boto3

LANDING_COMPANY_ID = 2

SETTINGS_FIELDS = [
    'brand_name', 'logo_url', 'favicon_url', 'meta_title', 'meta_description',
    'meta_keywords', 'og_image', 'seo_region',
    'phone', 'email', 'telegram_url', 'vk_url', 'max_url',
    'hero_eyebrow', 'hero_title_line1', 'hero_title_line2', 'hero_bg_image', 'hero_fg_image',
    'about_eyebrow', 'about_title_line1', 'about_title_highlight', 'about_description', 'about_image',
    'projects_eyebrow', 'projects_title',
    'services_eyebrow', 'services_title_highlight', 'services_title_rest', 'services_description',
    'faq_eyebrow', 'faq_title',
    'cta_eyebrow', 'cta_title_line1', 'cta_title_highlight', 'cta_description',
    'footer_description', 'copyright_text',
    'analytics_head',
    'legal_company_name', 'legal_updated_at',
    'privacy_intro', 'privacy_body',
    'terms_intro', 'terms_body',
    'cookies_intro', 'cookies_body',
    'lead_notify_email',
    'calc_enabled', 'calc_eyebrow', 'calc_title', 'calc_description', 'calc_note',
    'calc_price_cosmetic', 'calc_price_standard', 'calc_price_premium',
    'calc_k_apartment', 'calc_k_newbuild', 'calc_k_house', 'calc_k_bathroom', 'calc_k_commercial',
]

NUMERIC_SETTINGS = {
    'calc_price_cosmetic', 'calc_price_standard', 'calc_price_premium',
    'calc_k_apartment', 'calc_k_newbuild', 'calc_k_house', 'calc_k_bathroom', 'calc_k_commercial',
}

BOOLEAN_SETTINGS = {'calc_enabled'}


def settings_dict(row):
    '''Собирает настройки сайта, приводя числовые поля к числам для фронтенда'''
    if not row:
        return {}
    data = dict(zip(SETTINGS_FIELDS, row))
    for key in NUMERIC_SETTINGS:
        value = data.get(key)
        if value is not None:
            data[key] = float(value)
    return data

PHILOSOPHY_FIELDS = ['id', 'sort_order', 'title', 'description']
PROJECTS_FIELDS = ['id', 'sort_order', 'title', 'category', 'location', 'year', 'image_url']
EXPERTISE_FIELDS = ['id', 'sort_order', 'title', 'description', 'icon']
FAQ_FIELDS = ['id', 'sort_order', 'question', 'answer']

LIST_CONFIG = {
    'philosophy': {'table': 'site_philosophy_items', 'fields': PHILOSOPHY_FIELDS, 'text_fields': ['title', 'description']},
    'projects': {'table': 'site_projects', 'fields': PROJECTS_FIELDS, 'text_fields': ['title', 'category', 'location', 'year', 'image_url']},
    'expertise': {'table': 'site_expertise_items', 'fields': EXPERTISE_FIELDS, 'text_fields': ['title', 'description', 'icon']},
    'faq': {'table': 'site_faq_items', 'fields': FAQ_FIELDS, 'text_fields': ['question', 'answer']},
}


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
        "SELECT u.id, u.company_id, u.role, u.position FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2], 'position': row[3]}


def upload_image(company_id, data_url, folder):
    header, b64data = data_url.split(',', 1) if ',' in data_url else ('', data_url)
    file_bytes = base64.b64decode(b64data)
    ext = 'png'
    if 'jpeg' in header or 'jpg' in header:
        ext = 'jpg'
    elif 'svg' in header:
        ext = 'svg'
    elif 'webp' in header:
        ext = 'webp'
    key = f"site/{company_id}/{folder}/{uuid.uuid4().hex}.{ext}"
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    content_types = {'png': 'image/png', 'jpg': 'image/jpeg', 'svg': 'image/svg+xml', 'webp': 'image/webp'}
    s3.put_object(Bucket='files', Key=key, Body=file_bytes, ContentType=content_types[ext])
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event: dict, context) -> dict:
    '''Управление контентом лендинга: бренд (лого, favicon), тексты блоков и списки (о компании, проекты, услуги, FAQ)'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = get_conn()
    cur = conn.cursor()

    try:
        params = event.get('queryStringParameters') or {}
        resource = params.get('resource') or 'settings'

        if method == 'GET' and resource == 'public':
            company_id = LANDING_COMPANY_ID
            cur.execute(f"SELECT {', '.join(SETTINGS_FIELDS)} FROM site_settings WHERE company_id = %s", (company_id,))
            row = cur.fetchone()
            settings = settings_dict(row)

            result = {'settings': settings}
            for key, cfg in LIST_CONFIG.items():
                cur.execute(
                    f"SELECT {', '.join(cfg['fields'])} FROM {cfg['table']} WHERE company_id = %s ORDER BY sort_order",
                    (company_id,)
                )
                result[key] = [dict(zip(cfg['fields'], r)) for r in cur.fetchall()]

            return response(200, result)

        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        company_id = user['company_id']
        can_manage = user['role'] == 'owner' or user['position'] == 'super_admin'

        if not can_manage:
            return response(403, {'error': 'Редактировать сайт может только владелец или супер-администратор'})

        if resource == 'settings':
            if method == 'GET':
                cur.execute(f"SELECT {', '.join(SETTINGS_FIELDS)} FROM site_settings WHERE company_id = %s", (company_id,))
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Настройки сайта не найдены'})
                return response(200, settings_dict(row))

            if method == 'PUT':
                body = json.loads(event.get('body') or '{}')

                logo_file = body.get('logo_file')
                if logo_file:
                    body['logo_url'] = upload_image(company_id, logo_file, 'brand')

                favicon_file = body.get('favicon_file')
                if favicon_file:
                    body['favicon_url'] = upload_image(company_id, favicon_file, 'brand')

                image_file_map = {
                    'hero_bg_image_file': 'hero_bg_image',
                    'hero_fg_image_file': 'hero_fg_image',
                    'about_image_file': 'about_image',
                }
                for file_key, target_field in image_file_map.items():
                    file_data = body.get(file_key)
                    if file_data:
                        body[target_field] = upload_image(company_id, file_data, 'blocks')

                set_clauses = []
                values = []
                for field in SETTINGS_FIELDS:
                    if field not in body:
                        continue
                    raw = body[field]
                    if field in BOOLEAN_SETTINGS:
                        raw = str(raw).lower() not in ('false', '0', 'none', '')
                    elif field in NUMERIC_SETTINGS:
                        try:
                            raw = float(str(raw).replace(',', '.'))
                        except (TypeError, ValueError):
                            continue
                        if raw <= 0:
                            continue
                    set_clauses.append(f'{field} = %s')
                    values.append(raw)

                if not set_clauses:
                    return response(400, {'error': 'Нет данных для обновления'})

                set_clauses.append('updated_at = NOW()')
                values.append(company_id)

                cur.execute(
                    f"UPDATE site_settings SET {', '.join(set_clauses)} WHERE company_id = %s",
                    values
                )
                conn.commit()

                cur.execute(f"SELECT {', '.join(SETTINGS_FIELDS)} FROM site_settings WHERE company_id = %s", (company_id,))
                row = cur.fetchone()
                return response(200, settings_dict(row))

            return response(405, {'error': 'Метод не поддерживается'})

        if resource in LIST_CONFIG:
            cfg = LIST_CONFIG[resource]
            item_id = params.get('id')

            if method == 'GET':
                cur.execute(
                    f"SELECT {', '.join(cfg['fields'])} FROM {cfg['table']} WHERE company_id = %s ORDER BY sort_order",
                    (company_id,)
                )
                items = [dict(zip(cfg['fields'], r)) for r in cur.fetchall()]
                return response(200, {'items': items})

            if method == 'POST':
                body = json.loads(event.get('body') or '{}')

                image_file = body.get('image_file')
                if image_file and 'image_url' in cfg['text_fields']:
                    body['image_url'] = upload_image(company_id, image_file, resource)

                cur.execute(
                    f"SELECT COALESCE(MAX(sort_order), 0) FROM {cfg['table']} WHERE company_id = %s",
                    (company_id,)
                )
                next_order = (cur.fetchone()[0] or 0) + 10

                insert_fields = ['company_id', 'sort_order'] + cfg['text_fields']
                insert_values = [company_id, next_order] + [body.get(f, '') for f in cfg['text_fields']]
                placeholders = ', '.join(['%s'] * len(insert_values))

                cur.execute(
                    f"INSERT INTO {cfg['table']} ({', '.join(insert_fields)}) VALUES ({placeholders}) RETURNING id",
                    insert_values
                )
                new_id = cur.fetchone()[0]
                conn.commit()

                result = {'id': new_id, 'sort_order': next_order}
                for f in cfg['text_fields']:
                    result[f] = body.get(f, '')
                return response(200, result)

            if method == 'PUT' and params.get('action') == 'reorder':
                body = json.loads(event.get('body') or '{}')
                order = body.get('order') or []
                for idx, oid in enumerate(order):
                    cur.execute(
                        f"UPDATE {cfg['table']} SET sort_order = %s WHERE id = %s AND company_id = %s",
                        ((idx + 1) * 10, oid, company_id)
                    )
                conn.commit()
                return response(200, {'success': True})

            if method == 'PUT' and item_id:
                body = json.loads(event.get('body') or '{}')

                cur.execute(f"SELECT id FROM {cfg['table']} WHERE id = %s AND company_id = %s", (item_id, company_id))
                if not cur.fetchone():
                    return response(404, {'error': 'Запись не найдена'})

                image_file = body.get('image_file')
                if image_file and 'image_url' in cfg['text_fields']:
                    body['image_url'] = upload_image(company_id, image_file, resource)

                set_clauses = []
                values = []
                for f in cfg['text_fields']:
                    if f in body:
                        set_clauses.append(f'{f} = %s')
                        values.append(body[f])

                if not set_clauses:
                    return response(400, {'error': 'Нет данных для обновления'})

                values.append(item_id)
                values.append(company_id)
                cur.execute(
                    f"UPDATE {cfg['table']} SET {', '.join(set_clauses)} WHERE id = %s AND company_id = %s",
                    values
                )
                conn.commit()
                return response(200, {'success': True})

            if method == 'DELETE' and item_id:
                cur.execute(f"DELETE FROM {cfg['table']} WHERE id = %s AND company_id = %s", (item_id, company_id))
                conn.commit()
                return response(200, {'success': True})

            return response(405, {'error': 'Метод не поддерживается'})

        return response(404, {'error': 'Неизвестный ресурс'})
    finally:
        cur.close()
        conn.close()