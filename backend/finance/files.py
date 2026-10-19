import base64
import os
import re
import uuid

import boto3

MAX_SIZE = 15 * 1024 * 1024
ALLOWED = {
    'jpg': ('image/jpeg', 'photo'), 'jpeg': ('image/jpeg', 'photo'), 'png': ('image/png', 'photo'),
    'webp': ('image/webp', 'photo'), 'heic': ('image/heic', 'photo'), 'pdf': ('application/pdf', 'pdf'),
}
MAX_FILES = 10


def upload(company_id, file_name, b64data):
    '''Загружает фото чека или накладной в хранилище, возвращает описание файла'''
    if ',' in b64data:
        b64data = b64data.split(',', 1)[1]
    data = base64.b64decode(b64data)
    if len(data) > MAX_SIZE:
        return None, 'Файл больше 15 МБ'
    ext = (file_name.rsplit('.', 1)[-1] if '.' in file_name else '').lower()
    if ext not in ALLOWED:
        return None, 'Можно прикрепить фото (JPG, PNG, HEIC) или PDF'
    ctype, kind = ALLOWED[ext]
    key = f"expenses/{company_id}/{uuid.uuid4().hex}.{ext}"
    s3 = boto3.client('s3', endpoint_url='https://bucket.poehali.dev',
                      aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                      aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'])
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=ctype)
    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return {'name': file_name[:200], 'url': url, 'type': kind, 'size': len(data)}, None


def clean(company_id, items):
    '''Оставляет только файлы, загруженные этой компанией'''
    prefix = f"https://cdn.poehali.dev/projects/{os.environ.get('AWS_ACCESS_KEY_ID', '')}/bucket/expenses/{company_id}/"
    out = []
    for it in items or []:
        if not isinstance(it, dict):
            continue
        url = str(it.get('url') or '')
        if not url.startswith(prefix) or not re.match(r'^[0-9a-f]{32}\.\w{3,4}$', url[len(prefix):]):
            continue
        out.append({'name': str(it.get('name') or 'файл')[:200], 'url': url,
                    'type': it.get('type') if it.get('type') in ('photo', 'pdf') else 'photo',
                    'size': int(it.get('size') or 0)})
    return out[:MAX_FILES]
