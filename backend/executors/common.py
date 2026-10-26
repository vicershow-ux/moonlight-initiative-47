import base64
import json
import os
import re
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
        'Access-Control-Max-Age': '86400',
    }


def response(status, body):
    return {'statusCode': status, 'headers': {**cors_headers(), 'Content-Type': 'application/json'},
            'body': json.dumps(body, default=str, ensure_ascii=False)}


def token_of(event):
    headers = event.get('headers') or {}
    return (headers.get('X-Authorization') or headers.get('x-authorization') or '').replace('Bearer ', '').strip()


def num(v):
    try:
        return round(float(str(v or 0).replace(',', '.').replace(' ', '')), 2)
    except ValueError:
        return None


def f(v):
    return float(v or 0)


KINDS = ('individual', 'self_employed', 'foreign_citizen', 'entrepreneur', 'legal')

FIELDS = ['kind', 'full_name', 'org_name', 'director_position', 'director_name', 'gender', 'inn', 'ogrnip',
          'passport', 'country', 'phone', 'email', 'address', 'account', 'bank_name', 'bik', 'corr_account',
          'specialty', 'note']

LIMITS = {'passport': 500, 'address': 500, 'note': 2000}


def clean_executor(body):
    out = {}
    for k in FIELDS:
        v = str(body.get(k) or '').strip()
        out[k] = v[:LIMITS.get(k, 255)]
    if out['kind'] not in KINDS:
        out['kind'] = 'self_employed'
    if out['gender'] not in ('m', 'f'):
        out['gender'] = 'm'
    for k in ('inn', 'ogrnip', 'account', 'bik', 'corr_account'):
        out[k] = re.sub(r'\D', '', out[k])[:40]
    return out


def display_name(e):
    if e.get('kind') == 'legal':
        return e.get('org_name') or e.get('full_name') or ''
    if e.get('kind') == 'entrepreneur':
        return f"ИП {e.get('full_name') or ''}".strip()
    return e.get('full_name') or ''


PHOTO_EXT = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp', 'heic': 'image/heic'}
MAX_PHOTO = 10 * 1024 * 1024


def cdn_prefix(company_id):
    return f"https://cdn.poehali.dev/projects/{os.environ.get('AWS_ACCESS_KEY_ID', '')}/bucket/executor-reports/{company_id}/"


def upload_photo(company_id, file_name, b64data):
    if ',' in b64data:
        b64data = b64data.split(',', 1)[1]
    data = base64.b64decode(b64data)
    if len(data) > MAX_PHOTO:
        return None, 'Фото больше 10 МБ'
    ext = (file_name.rsplit('.', 1)[-1] if '.' in file_name else 'jpg').lower()
    if ext not in PHOTO_EXT:
        return None, 'Можно загружать только фото'
    key = f"executor-reports/{company_id}/{uuid.uuid4().hex}.{ext}"
    s3 = boto3.client('s3', endpoint_url='https://bucket.poehali.dev',
                      aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                      aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=PHOTO_EXT[ext])
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}", None


def clean_photos(company_id, items):
    prefix = cdn_prefix(company_id)
    out = []
    for u in items or []:
        u = str(u or '')
        if u.startswith(prefix) and re.match(r'^[0-9a-f]{32}\.\w{3,4}$', u[len(prefix):]):
            out.append(u)
    return out[:10]


def executor_object_ids_sql():
    '''Объекты исполнителя: привязанные вручную и те, где с ним есть договор'''
    return ("(SELECT object_id FROM executor_objects WHERE executor_id = %s "
            "UNION SELECT object_id FROM contracts WHERE company_id = %s AND options->>'executor_id' = %s)")


REPORT_KEYS = ['id', 'executor_id', 'object_id', 'contract_id', 'report_date', 'work_text', 'progress_pct',
               'photos', 'status', 'reply', 'created_at', 'reviewed_at', 'object_code', 'address', 'executor_name']

REPORT_SELECT = (
    "SELECT r.id, r.executor_id, r.object_id, r.contract_id, r.report_date, r.work_text, r.progress_pct, "
    "r.photos, r.status, r.reply, r.created_at, r.reviewed_at, o.object_code, o.address, "
    "CASE WHEN e.kind = 'legal' THEN COALESCE(NULLIF(e.org_name, ''), e.full_name) ELSE e.full_name END "
    "FROM executor_reports r JOIN objects o ON o.id = r.object_id JOIN executors e ON e.id = r.executor_id "
)


def reports_rows(cur):
    return [dict(zip(REPORT_KEYS, r)) for r in cur.fetchall()]
