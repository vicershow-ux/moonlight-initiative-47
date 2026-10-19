import json
import os
from datetime import date

import psycopg2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400',
    }


def response(status, body):
    return {'statusCode': status, 'headers': {**cors_headers(), 'Content-Type': 'application/json'},
            'body': json.dumps(body, default=str, ensure_ascii=False)}


def get_current_user(cur, event):
    headers = event.get('headers') or {}
    token = (headers.get('X-Authorization') or headers.get('x-authorization') or '').replace('Bearer ', '')
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.company_id, u.role FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2]} if row else None


DUE = ("(i.total_amount * CASE WHEN i.vat_mode ~ '^on_top' THEN 1 + COALESCE(NULLIF(substring(i.vat_mode from 'on_top_(\\d+)'), '')::numeric, 20) / 100 "
       "ELSE 1 END)")


def f(v):
    return round(float(v or 0), 2)


def parse_period(params):
    today = date.today()
    period = params.get('period') or 'year'
    if period == 'month':
        start = today.replace(day=1)
    elif period == 'quarter':
        start = today.replace(month=(today.month - 1) // 3 * 3 + 1, day=1)
    elif period == 'all':
        start = date(2000, 1, 1)
    else:
        period = 'year'
        start = today.replace(month=1, day=1)
    return period, start


def handler(event: dict, context) -> dict:
    '''Финансы компании: поступления, долги заказчиков, договоры, расходы на материалы, аренда'''
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = get_conn()
    cur = conn.cursor()
    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        if user['role'] not in ('owner', 'admin'):
            return response(403, {'error': 'Раздел доступен руководителю'})
        cid = user['company_id']
        params = event.get('queryStringParameters') or {}
        period, start = parse_period(params)

        cur.execute(
            f"SELECT COALESCE(SUM({DUE}) FILTER (WHERE i.status = 'paid' AND i.paid_at::date >= %s), 0), "
            f"COUNT(*) FILTER (WHERE i.status = 'paid' AND i.paid_at::date >= %s), "
            f"COALESCE(SUM({DUE}) FILTER (WHERE i.status <> 'paid'), 0), "
            f"COUNT(*) FILTER (WHERE i.status <> 'paid'), "
            f"COALESCE(SUM({DUE}) FILTER (WHERE i.status <> 'paid' AND i.due_date < CURRENT_DATE), 0), "
            f"COUNT(*) FILTER (WHERE i.status <> 'paid' AND i.due_date < CURRENT_DATE), "
            f"COALESCE(SUM({DUE}) FILTER (WHERE i.invoice_date >= %s), 0), "
            f"COALESCE(SUM({DUE}) FILTER (WHERE i.status = 'paid' AND i.paid_at::date >= %s AND (i.paid_online OR i.paid_source = 'bank')), 0) "
            "FROM invoices i WHERE i.company_id = %s",
            (start, start, start, start, cid)
        )
        r = cur.fetchone()
        received, received_n, outstanding, outstanding_n, overdue, overdue_n, issued, auto_paid = r

        cur.execute(
            "SELECT COALESCE(SUM(total_amount), 0), COUNT(*) FROM contracts WHERE company_id = %s AND status = 'signed' "
            "AND COALESCE(contract_date, created_at::date) >= %s",
            (cid, start)
        )
        contracted, contracts_n = cur.fetchone()

        cur.execute(
            "SELECT COALESCE(SUM(qty * price), 0) FROM object_materials WHERE company_id = %s AND created_at::date >= %s",
            (cid, start)
        )
        materials = cur.fetchone()[0]

        cur.execute(
            "SELECT COALESCE(SUM(paid_amount) FILTER (WHERE direction = 'out'), 0), "
            "COALESCE(SUM(paid_amount) FILTER (WHERE direction = 'in'), 0) "
            "FROM rentals WHERE company_id = %s AND COALESCE(date_from, created_at::date) >= %s",
            (cid, start)
        )
        rent_income, rent_expense = cur.fetchone()

        cur.execute(
            f"SELECT to_char(date_trunc('month', i.paid_at), 'YYYY-MM'), SUM({DUE}) FROM invoices i "
            "WHERE i.company_id = %s AND i.status = 'paid' AND i.paid_at >= date_trunc('month', NOW()) - INTERVAL '11 months' "
            "GROUP BY 1",
            (cid,)
        )
        paid_by_month = dict(cur.fetchall())
        cur.execute(
            f"SELECT to_char(date_trunc('month', i.invoice_date), 'YYYY-MM'), SUM({DUE}) FROM invoices i "
            "WHERE i.company_id = %s AND i.invoice_date >= date_trunc('month', NOW()) - INTERVAL '11 months' GROUP BY 1",
            (cid,)
        )
        issued_by_month = dict(cur.fetchall())
        cur.execute(
            "SELECT to_char(date_trunc('month', created_at), 'YYYY-MM'), SUM(qty * price) FROM object_materials "
            "WHERE company_id = %s AND created_at >= date_trunc('month', NOW()) - INTERVAL '11 months' GROUP BY 1",
            (cid,)
        )
        mat_by_month = dict(cur.fetchall())
        today = date.today()
        months = []
        for k in range(11, -1, -1):
            y, m = today.year, today.month - k
            while m <= 0:
                m += 12
                y -= 1
            key = f'{y}-{m:02d}'
            months.append({'month': key, 'received': f(paid_by_month.get(key)), 'issued': f(issued_by_month.get(key)),
                           'materials': f(mat_by_month.get(key))})

        cur.execute(
            f"""
            SELECT o.id, o.object_code, o.client_name, o.address, o.status,
              COALESCE((SELECT SUM(total_amount) FROM contracts c WHERE c.object_id = o.id AND c.status = 'signed'), 0),
              COALESCE((SELECT SUM({DUE}) FROM invoices i WHERE i.object_id = o.id AND i.status = 'paid'), 0),
              COALESCE((SELECT SUM({DUE}) FROM invoices i WHERE i.object_id = o.id AND i.status <> 'paid'), 0),
              COALESCE((SELECT SUM({DUE}) FROM invoices i WHERE i.object_id = o.id AND i.status <> 'paid' AND i.due_date < CURRENT_DATE), 0),
              COALESCE((SELECT SUM(qty * price) FROM object_materials m WHERE m.object_id = o.id), 0),
              (SELECT MIN(due_date) FROM object_payments p WHERE p.object_id = o.id AND p.paid_amount < p.amount AND p.due_date IS NOT NULL)
            FROM objects o WHERE o.company_id = %s
            """,
            (cid,)
        )
        objects = []
        for oid, code, client, addr, st, contr, paid, out, od, mat, next_due in cur.fetchall():
            if not (contr or paid or out or mat):
                continue
            contr, paid, out, od, mat = f(contr), f(paid), f(out), f(od), f(mat)
            objects.append({'id': oid, 'object_code': code, 'client_name': client, 'address': addr, 'status': st,
                            'contracted': contr, 'paid': paid, 'outstanding': out, 'overdue': od, 'materials': mat,
                            'to_invoice': max(round(contr - paid - out, 2), 0), 'next_due': next_due})
        objects.sort(key=lambda o: (-o['overdue'], -o['outstanding'], -o['contracted']))

        cur.execute(
            f"""
            SELECT i.id, i.object_id, i.invoice_number, i.invoice_date, i.due_date, i.status, i.paid_at,
                   i.paid_online, i.paid_source, {DUE}, o.object_code, o.client_name, c.contract_number, a.act_number
            FROM invoices i JOIN objects o ON o.id = i.object_id
            LEFT JOIN contracts c ON c.id = i.contract_id LEFT JOIN acts a ON a.id = i.act_id
            WHERE i.company_id = %s ORDER BY i.invoice_date DESC NULLS LAST, i.id DESC LIMIT 300
            """,
            (cid,)
        )
        keys = ['id', 'object_id', 'invoice_number', 'invoice_date', 'due_date', 'status', 'paid_at', 'paid_online',
                'paid_source', 'amount', 'object_code', 'client_name', 'contract_number', 'act_number']
        invoices = []
        for row in cur.fetchall():
            d = dict(zip(keys, row))
            d['amount'] = f(d['amount'])
            d['overdue'] = d['status'] != 'paid' and bool(d['due_date']) and d['due_date'] < today
            invoices.append(d)

        cur.execute(
            "SELECT p.id, p.object_id, p.title, p.amount - p.paid_amount, p.due_date, o.object_code, o.client_name "
            "FROM object_payments p JOIN objects o ON o.id = p.object_id "
            "WHERE p.company_id = %s AND p.paid_amount < p.amount AND p.due_date IS NOT NULL "
            "AND p.due_date <= CURRENT_DATE + INTERVAL '30 days' ORDER BY p.due_date LIMIT 20",
            (cid,)
        )
        upcoming = [dict(zip(['id', 'object_id', 'title', 'amount', 'due_date', 'object_code', 'client_name'], x)) for x in cur.fetchall()]
        for u in upcoming:
            u['amount'] = f(u['amount'])

        expenses = f(materials) + f(rent_expense)
        income = f(received) + f(rent_income)
        return response(200, {
            'period': period, 'start': start,
            'summary': {
                'received': f(received), 'received_count': received_n,
                'outstanding': f(outstanding), 'outstanding_count': outstanding_n,
                'overdue': f(overdue), 'overdue_count': overdue_n,
                'issued': f(issued), 'auto_paid': f(auto_paid),
                'contracted': f(contracted), 'contracts_count': contracts_n,
                'materials': f(materials), 'rent_income': f(rent_income), 'rent_expense': f(rent_expense),
                'income': income, 'expenses': expenses, 'margin': round(income - expenses, 2),
            },
            'months': months,
            'objects': objects,
            'invoices': invoices,
            'upcoming': upcoming,
        })
    finally:
        cur.close()
        conn.close()
