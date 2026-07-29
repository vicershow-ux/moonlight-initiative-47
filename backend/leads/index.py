import json
import os
from datetime import datetime

import psycopg2

LEADS_COMPANY_ID = 2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    }


def response(status: int, body):
    return {
        'statusCode': status,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str)
    }


def handler(event: dict, context) -> dict:
    '''Публичная форма заявки с лендинга FixKey — создаёт объект-лид и уведомление в CRM компании'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    if method != 'POST':
        return response(405, {'error': 'Метод не поддерживается'})

    body = json.loads(event.get('body') or '{}')
    client_name = (body.get('client_name') or '').strip()
    client_phone = (body.get('client_phone') or '').strip()
    comment = (body.get('comment') or '').strip()

    if len(client_name) < 2:
        return response(400, {'error': 'Введите имя'})
    if len(client_phone) < 5:
        return response(400, {'error': 'Введите номер телефона'})

    conn = get_conn()
    cur = conn.cursor()

    try:
        year = datetime.utcnow().strftime('%y')
        cur.execute("SELECT COUNT(*) FROM objects WHERE company_id = %s", (LEADS_COMPANY_ID,))
        seq = cur.fetchone()[0] + 1
        object_code = f"{LEADS_COMPANY_ID:03d}-20{year}-{seq:04d}"

        cur.execute(
            "INSERT INTO objects (company_id, object_code, client_name, client_phone, object_type, area, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (LEADS_COMPANY_ID, object_code, client_name, client_phone, 'Заявка с сайта', 0, 'лид')
        )
        new_id = cur.fetchone()[0]

        message = f"{client_name}, {client_phone}"
        if comment:
            message += f" — {comment}"

        cur.execute(
            "INSERT INTO notifications (company_id, type, title, message, payload) "
            "VALUES (%s, %s, %s, %s, %s)",
            (LEADS_COMPANY_ID, 'lead', 'Новая заявка с сайта', message,
             json.dumps({'object_id': new_id, 'object_code': object_code}))
        )

        conn.commit()

        return response(200, {'success': True, 'object_code': object_code})
    finally:
        cur.close()
        conn.close()