import gzip
import hashlib
import json
import os
from datetime import datetime

import boto3
import psycopg2

SCHEMA = 't_p98567891_moonlight_initiative'


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Export-Key',
        'Access-Control-Max-Age': '86400'
    }


def response(status: int, body):
    return {
        'statusCode': status,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False, default=str)
    }


def quote_literal(value) -> str:
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, (dict, list)):
        return "'" + json.dumps(value, ensure_ascii=False).replace('\\', '\\\\').replace("'", "''") + "'"
    if isinstance(value, (bytes, memoryview)):
        return "'\\x" + bytes(value).hex() + "'"
    text = str(value)
    if '\\' in text:
        return "E'" + text.replace('\\', '\\\\').replace("'", "''") + "'"
    return "'" + text.replace("'", "''") + "'"


def handler(event: dict, context) -> dict:
    '''Служебная выгрузка базы в SQL-файл для переезда на свой сервер'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    headers = event.get('headers') or {}
    key = headers.get('X-Export-Key') or headers.get('x-export-key') or ''
    params = event.get('queryStringParameters') or {}
    key = key or params.get('key') or ''

    expected_hash = 'fd6b8eaab2163a37923b901005ddeb9bc422fcac0d3698a30e741d449f5e9bff'
    if not key or hashlib.sha256(key.encode()).hexdigest() != expected_hash:
        return response(403, {'error': 'Неверный ключ выгрузки'})

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema = %s AND table_type = 'BASE TABLE' ORDER BY table_name",
        (SCHEMA,)
    )
    tables = [r[0] for r in cur.fetchall()]

    parts = [
        '-- Выгрузка базы FixKey для переезда',
        f'-- Создана: {datetime.utcnow().isoformat()} UTC',
        'SET session_replication_role = replica;',
        ''
    ]
    stats = {}

    if tables:
        all_tables = ', '.join(f'"{t}"' for t in tables)
        parts.append('-- Очистка всех таблиц одной командой (до вставок)')
        parts.append(f'TRUNCATE TABLE {all_tables} RESTART IDENTITY CASCADE;')
        parts.append('')

    for table in tables:
        cur.execute(
            "SELECT column_name, data_type FROM information_schema.columns "
            "WHERE table_schema = %s AND table_name = %s ORDER BY ordinal_position",
            (SCHEMA, table)
        )
        cols_info = cur.fetchall()
        cols = [c[0] for c in cols_info]
        if not cols:
            continue

        col_list = ', '.join(f'"{c}"' for c in cols)
        cur.execute(f'SELECT {col_list} FROM "{SCHEMA}"."{table}"')
        rows = cur.fetchall()
        stats[table] = len(rows)

        parts.append(f'-- {table}: {len(rows)} строк')
        for row in rows:
            values = ', '.join(quote_literal(v) for v in row)
            parts.append(f'INSERT INTO "{table}" ({col_list}) VALUES ({values});')
        parts.append('')

    cur.execute(
        "SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace "
        "WHERE c.relkind = 'S' AND n.nspname = %s",
        (SCHEMA,)
    )
    sequences = [r[0] for r in cur.fetchall()]
    for seq in sequences:
        cur.execute(f'SELECT last_value, is_called FROM "{SCHEMA}"."{seq}"')
        last, called = cur.fetchone()
        parts.append(f"SELECT setval('\"{seq}\"', {last}, {'true' if called else 'false'});")

    parts.append('')
    parts.append('SET session_replication_role = DEFAULT;')

    cur.close()
    conn.close()

    sql_text = '\n'.join(parts)
    payload = gzip.compress(sql_text.encode('utf-8'))

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    stamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')
    obj_key = f'export/fixkey-{stamp}.sql.gz'
    s3.put_object(
        Bucket='files',
        Key=obj_key,
        Body=payload,
        ContentType='application/gzip'
    )

    url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{obj_key}"

    return response(200, {
        'url': url,
        'size_kb': round(len(payload) / 1024, 1),
        'tables': len(stats),
        'total_rows': sum(stats.values()),
        'rows_by_table': stats
    })