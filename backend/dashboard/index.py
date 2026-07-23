import json
import os
from datetime import datetime
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
        "SELECT u.id, u.company_id FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1]}


def handler(event: dict, context) -> dict:
    '''Статистика дашборда: объекты, сметы, статусы, последние объекты'''
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

        cur.execute("SELECT COUNT(*) FROM objects WHERE company_id = %s", (company_id,))
        total_objects = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM estimates WHERE company_id = %s", (company_id,))
        total_estimates = cur.fetchone()[0]

        cur.execute(
            "SELECT COALESCE(SUM(total_amount), 0) FROM estimates WHERE company_id = %s AND date_trunc('month', created_at) = date_trunc('month', NOW())",
            (company_id,)
        )
        month_amount = cur.fetchone()[0]

        cur.execute(
            "SELECT status, COUNT(*) FROM objects WHERE company_id = %s GROUP BY status",
            (company_id,)
        )
        statuses = [{'status': r[0], 'count': r[1]} for r in cur.fetchall()]

        cur.execute("SELECT COUNT(*) FROM users WHERE company_id = %s", (company_id,))
        team_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM team_invites WHERE company_id = %s AND status = 'pending'", (company_id,))
        invites_count = cur.fetchone()[0]

        cur.execute(
            "SELECT id, object_code, client_name, client_phone, object_type, area, status, created_at FROM objects WHERE company_id = %s ORDER BY created_at DESC LIMIT 5",
            (company_id,)
        )
        keys = ['id', 'object_code', 'client_name', 'client_phone', 'object_type', 'area', 'status', 'created_at']
        recent_objects = [dict(zip(keys, r)) for r in cur.fetchall()]

        return response(200, {
            'total_objects': total_objects,
            'total_estimates': total_estimates,
            'month_amount': float(month_amount),
            'statuses': statuses,
            'team_count': team_count,
            'invites_count': invites_count,
            'recent_objects': recent_objects
        })
    finally:
        cur.close()
        conn.close()
# touch
