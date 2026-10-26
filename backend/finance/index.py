import json
import re
import os
from datetime import date

import psycopg2
import bank_inbox
import files


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


CATEGORIES = {
    'salary': 'Зарплата', 'subcontract': 'Субподряд', 'transport': 'Транспорт', 'tools': 'Инструмент',
    'materials': 'Материалы (вне объекта)', 'rent': 'Аренда', 'taxes': 'Налоги и сборы', 'office': 'Офис и связь',
    'ads': 'Реклама', 'purchases': 'Закупки по чекам', 'other': 'Прочее',
}
EXP_KEYS = ['id', 'object_id', 'category', 'amount', 'expense_date', 'description', 'payee', 'created_at', 'object_code', 'client_name', 'from_bank', 'attachments']


INCOME_CATEGORIES = {
    'cash': 'Оплата наличными', 'transfer': 'Перевод на карту', 'prepay': 'Аванс без счёта',
    'extra_work': 'Доп. работы', 'materials_resale': 'Продажа материалов', 'equipment': 'Продажа инструмента',
    'refund': 'Возврат от поставщика', 'other': 'Прочий доход',
}


def save_income(cur, conn, cid, user_id, body, inc_id=None):
    '''Добавление или правка дохода, который пришёл не через счёт'''
    try:
        amount = round(float(str(body.get('amount') or 0).replace(',', '.').replace(' ', '')), 2)
    except ValueError:
        return response(400, {'error': 'Сумма указана неверно'})
    if amount <= 0 or amount > 1e10:
        return response(400, {'error': 'Укажите сумму дохода'})
    category = str(body.get('category') or 'other')
    if category not in INCOME_CATEGORIES:
        return response(400, {'error': 'Неизвестный вид дохода'})
    inc_date = str(body.get('income_date') or date.today().isoformat())[:10]
    try:
        date.fromisoformat(inc_date)
    except ValueError:
        return response(400, {'error': 'Неверная дата'})
    object_id = body.get('object_id') or None
    if object_id:
        cur.execute("SELECT 1 FROM objects WHERE id = %s AND company_id = %s", (object_id, cid))
        if not cur.fetchone():
            return response(400, {'error': 'Объект не найден'})
    desc = str(body.get('description') or '').strip()[:1000]
    payer = str(body.get('payer') or '').strip()[:255]
    if inc_id:
        cur.execute(
            "UPDATE company_incomes SET object_id = %s, category = %s, amount = %s, income_date = %s, description = %s, "
            "payer = %s, updated_at = NOW() WHERE id = %s AND company_id = %s RETURNING id",
            (object_id, category, amount, inc_date, desc, payer, inc_id, cid)
        )
        if not cur.fetchone():
            return response(404, {'error': 'Доход не найден'})
    else:
        cur.execute(
            "INSERT INTO company_incomes (company_id, object_id, category, amount, income_date, description, payer, created_by) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (cid, object_id, category, amount, inc_date, desc, payer, user_id)
        )
        inc_id = cur.fetchone()[0]
    conn.commit()
    return response(200, {'id': inc_id, 'saved': True})


def save_expense(cur, conn, cid, user_id, body, exp_id=None):
    '''Добавление или правка расхода с проверкой полей'''
    try:
        amount = round(float(str(body.get('amount') or 0).replace(',', '.').replace(' ', '')), 2)
    except ValueError:
        return response(400, {'error': 'Сумма указана неверно'})
    if amount <= 0 or amount > 1e10:
        return response(400, {'error': 'Укажите сумму расхода'})
    category = str(body.get('category') or 'other')
    if category not in CATEGORIES:
        return response(400, {'error': 'Неизвестная категория'})
    exp_date = str(body.get('expense_date') or date.today().isoformat())[:10]
    try:
        date.fromisoformat(exp_date)
    except ValueError:
        return response(400, {'error': 'Неверная дата'})
    object_id = body.get('object_id') or None
    if object_id:
        cur.execute("SELECT 1 FROM objects WHERE id = %s AND company_id = %s", (object_id, cid))
        if not cur.fetchone():
            return response(400, {'error': 'Объект не найден'})
    desc = str(body.get('description') or '').strip()[:1000]
    payee = str(body.get('payee') or '').strip()[:255]
    att = json.dumps(files.clean(cid, body.get('attachments')), ensure_ascii=False)
    if exp_id:
        cur.execute(
            "UPDATE company_expenses SET object_id = %s, category = %s, amount = %s, expense_date = %s, description = %s, "
            "payee = %s, attachments = %s, updated_at = NOW() WHERE id = %s AND company_id = %s RETURNING id",
            (object_id, category, amount, exp_date, desc, payee, att, exp_id, cid)
        )
        if not cur.fetchone():
            return response(404, {'error': 'Расход не найден'})
    else:
        cur.execute(
            "INSERT INTO company_expenses (company_id, object_id, category, amount, expense_date, description, payee, created_by, attachments) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (cid, object_id, category, amount, exp_date, desc, payee, user_id, att)
        )
        exp_id = cur.fetchone()[0]
    conn.commit()
    return response(200, {'id': exp_id, 'saved': True})


def handler(event: dict, context) -> dict:
    '''Финансы компании: поступления, долги заказчиков, договоры, расходы (материалы, зарплаты, транспорт и др.), прибыль'''
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
        method = event.get('httpMethod', 'GET')
        action = params.get('action') or ''
        if action == 'upload' and method == 'POST':
            body = json.loads(event.get('body') or '{}')
            uploaded, err = files.upload(cid, str(body.get("file_name") or "file.jpg"), str(body.get("data") or ""))
            if err:
                return response(400, {'error': err})
            return response(200, uploaded)
        if action == 'export' and method == 'GET':
            month = str(params.get('month') or '')
            if not re.match(r'^\d{4}-(0[1-9]|1[0-2])$', month):
                return response(400, {'error': 'Укажите месяц'})
            cur.execute(
                "SELECT e.id, e.object_id, e.category, e.amount, e.expense_date, e.description, e.payee, e.created_at, "
                "o.object_code, o.client_name, e.bank_operation_id IS NOT NULL, e.attachments, e.payee_inn, o.address, "
                "b.document_number, COALESCE(u.full_name, '') "
                "FROM company_expenses e LEFT JOIN objects o ON o.id = e.object_id "
                "LEFT JOIN bank_operations b ON b.id = e.bank_operation_id LEFT JOIN users u ON u.id = e.created_by "
                "WHERE e.company_id = %s AND e.expense_date >= %s::date AND e.expense_date < (%s::date + INTERVAL '1 month') "
                "ORDER BY e.expense_date, e.id",
                (cid, month + '-01', month + '-01')
            )
            keys = EXP_KEYS + ['payee_inn', 'address', 'document_number', 'author']
            rows = []
            for r in cur.fetchall():
                d = dict(zip(keys, r))
                d['amount'] = f(d['amount'])
                rows.append(d)
            cur.execute("SELECT name, inn FROM companies WHERE id = %s", (cid,))
            comp = cur.fetchone() or ('', '')
            return response(200, {'month': month, 'company': {'name': comp[0] or '', 'inn': comp[1] or ''},
                                  'categories': CATEGORIES, 'expenses': rows})
        if action == 'attach' and method == 'POST':
            body = json.loads(event.get('body') or '{}')
            att = files.clean(cid, body.get('attachments'))
            cur.execute("UPDATE company_expenses SET attachments = %s, updated_at = NOW() WHERE id = %s AND company_id = %s RETURNING id",
                        (json.dumps(att, ensure_ascii=False), params.get('id'), cid))
            if not cur.fetchone():
                return response(404, {'error': 'Расход не найден'})
            conn.commit()
            return response(200, {'attachments': att})
        if action == 'bank_inbox':
            if method == 'POST':
                body = json.loads(event.get('body') or '{}')
                if body.get('skip'):
                    bank_inbox.skip(cur, conn, cid, body['skip'])
                    return response(200, {'skipped': len(body['skip'])})
                done = bank_inbox.accept(cur, conn, cid, user['user_id'], body.get('items'), CATEGORIES)
                return response(200, {'accepted': done})
            cur.execute("SELECT enabled, last_synced_at FROM company_bank_settings WHERE company_id = %s", (cid,))
            bs = cur.fetchone()
            return response(200, {
                'connected': bool(bs and bs[0]), 'last_synced_at': bs[1] if bs else None,
                'items': bank_inbox.inbox(cur, cid, bank_inbox.remembered(cur, cid)),
            })
        if params.get('entity') == 'income':
            if method in ('POST', 'PUT'):
                body = json.loads(event.get('body') or '{}')
                return save_income(cur, conn, cid, user['user_id'], body, params.get('id') if method == 'PUT' else None)
            if method == 'DELETE':
                cur.execute("DELETE FROM company_incomes WHERE id = %s AND company_id = %s RETURNING id", (params.get('id'), cid))
                if not cur.fetchone():
                    return response(404, {'error': 'Доход не найден'})
                conn.commit()
                return response(200, {'deleted': True})
        if method in ('POST', 'PUT'):
            body = json.loads(event.get('body') or '{}')
            return save_expense(cur, conn, cid, user['user_id'], body, params.get('id') if method == 'PUT' else None)
        if method == 'DELETE':
            cur.execute("DELETE FROM company_expenses WHERE id = %s AND company_id = %s RETURNING bank_operation_id", (params.get('id'), cid))
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Расход не найден'})
            if row[0]:
                cur.execute("UPDATE bank_operations SET expense_id = NULL, match_status = 'unmatched' WHERE id = %s", (row[0],))
            conn.commit()
            return response(200, {'deleted': True})
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
            "SELECT COALESCE(SUM(total_amount), 0), COUNT(*) FROM contracts WHERE company_id = %s AND status = 'signed' AND COALESCE(options->>'our_role', '') <> 'customer' "
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
            "SELECT category, SUM(amount) FROM company_expenses WHERE company_id = %s AND expense_date >= %s GROUP BY 1",
            (cid, start)
        )
        exp_by_cat = {k: f(v) for k, v in cur.fetchall()}
        cur.execute(
            "SELECT category, SUM(amount) FROM company_incomes WHERE company_id = %s AND income_date >= %s GROUP BY 1",
            (cid, start)
        )
        inc_by_cat = {k: f(v) for k, v in cur.fetchall()}
        other_income = round(sum(inc_by_cat.values()), 2)
        cur.execute(
            "SELECT to_char(date_trunc('month', income_date), 'YYYY-MM'), SUM(amount) FROM company_incomes "
            "WHERE company_id = %s AND income_date >= date_trunc('month', NOW()) - INTERVAL '11 months' GROUP BY 1",
            (cid,)
        )
        inc_by_month = dict(cur.fetchall())
        other_expenses = round(sum(exp_by_cat.values()), 2)
        cur.execute(
            "SELECT to_char(date_trunc('month', expense_date), 'YYYY-MM'), SUM(amount) FROM company_expenses "
            "WHERE company_id = %s AND expense_date >= date_trunc('month', NOW()) - INTERVAL '11 months' GROUP BY 1",
            (cid,)
        )
        exp_by_month = dict(cur.fetchall())

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
            months.append({'month': key, 'received': round(f(paid_by_month.get(key)) + f(inc_by_month.get(key)), 2),
                           'issued': f(issued_by_month.get(key)),
                           'materials': f(mat_by_month.get(key)), 'expenses': round(f(mat_by_month.get(key)) + f(exp_by_month.get(key)), 2)})

        cur.execute(
            f"""
            SELECT o.id, o.object_code, o.client_name, o.address, o.status,
              COALESCE((SELECT SUM(total_amount) FROM contracts c WHERE c.object_id = o.id AND c.status = 'signed' AND COALESCE(c.options->>'our_role', '') <> 'customer'), 0),
              COALESCE((SELECT SUM({DUE}) FROM invoices i WHERE i.object_id = o.id AND i.status = 'paid'), 0),
              COALESCE((SELECT SUM({DUE}) FROM invoices i WHERE i.object_id = o.id AND i.status <> 'paid'), 0),
              COALESCE((SELECT SUM({DUE}) FROM invoices i WHERE i.object_id = o.id AND i.status <> 'paid' AND i.due_date < CURRENT_DATE), 0),
              COALESCE((SELECT SUM(qty * price) FROM object_materials m WHERE m.object_id = o.id), 0),
              (SELECT MIN(due_date) FROM object_payments p WHERE p.object_id = o.id AND p.paid_amount < p.amount AND p.due_date IS NOT NULL),
              COALESCE((SELECT SUM(amount) FROM company_expenses e WHERE e.object_id = o.id), 0),
              COALESCE((SELECT SUM(amount) FROM company_incomes ci WHERE ci.object_id = o.id), 0)
            FROM objects o WHERE o.company_id = %s
            """,
            (cid,)
        )
        objects = []
        for oid, code, client, addr, st, contr, paid, out, od, mat, next_due, exp, extra in cur.fetchall():
            if not (contr or paid or out or mat or exp or extra):
                continue
            contr, paid, out, od, mat, exp = f(contr), f(paid), f(out), f(od), f(mat), f(exp)
            paid = round(paid + f(extra), 2)
            costs = round(mat + exp, 2)
            objects.append({'id': oid, 'object_code': code, 'client_name': client, 'address': addr, 'status': st,
                            'contracted': contr, 'paid': paid, 'outstanding': out, 'overdue': od, 'materials': mat,
                            'expenses': exp, 'costs': costs, 'profit': round(paid - costs, 2),
                            'planned_profit': round(contr - costs, 2) if contr else None,
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

        cur.execute(
            "SELECT e.id, e.object_id, e.category, e.amount, e.expense_date, e.description, e.payee, e.created_at, o.object_code, o.client_name, "
            "e.bank_operation_id IS NOT NULL, e.attachments "
            "FROM company_expenses e LEFT JOIN objects o ON o.id = e.object_id "
            "WHERE e.company_id = %s AND e.expense_date >= %s ORDER BY e.expense_date DESC, e.id DESC LIMIT 500",
            (cid, start)
        )
        expense_list = []
        for row in cur.fetchall():
            d = dict(zip(EXP_KEYS, row))
            d['amount'] = f(d['amount'])
            expense_list.append(d)
        income_list = []
        cur.execute(
            f"SELECT i.id, i.object_id, i.paid_at::date, {DUE}, i.invoice_number, i.paid_online, i.paid_source, o.object_code, o.client_name "
            "FROM invoices i JOIN objects o ON o.id = i.object_id "
            "WHERE i.company_id = %s AND i.status = 'paid' AND i.paid_at::date >= %s ORDER BY i.paid_at DESC LIMIT 500",
            (cid, start)
        )
        for iid, oid, d, amt, num, online, src, code, client in cur.fetchall():
            income_list.append({'kind': 'invoice', 'id': iid, 'object_id': oid, 'income_date': d, 'amount': f(amt),
                                'category': 'invoice', 'description': f'Оплата счёта № {num}', 'payer': client or '',
                                'object_code': code, 'client_name': client,
                                'source': 'online' if online else ('bank' if src == 'bank' else 'manual')})
        cur.execute(
            "SELECT r.id, r.object_id, COALESCE(r.date_from, r.created_at::date), r.paid_amount, r.item_name, o.object_code, o.client_name "
            "FROM rentals r LEFT JOIN objects o ON o.id = r.object_id "
            "WHERE r.company_id = %s AND r.direction = 'out' AND r.paid_amount > 0 AND COALESCE(r.date_from, r.created_at::date) >= %s "
            "ORDER BY 3 DESC LIMIT 300",
            (cid, start)
        )
        for rid, oid, d, amt, item, code, client in cur.fetchall():
            income_list.append({'kind': 'rent', 'id': rid, 'object_id': oid, 'income_date': d, 'amount': f(amt),
                                'category': 'rent', 'description': f'Аренда: {item}', 'payer': '',
                                'object_code': code, 'client_name': client, 'source': 'manual'})
        cur.execute(
            "SELECT ci.id, ci.object_id, ci.income_date, ci.amount, ci.category, ci.description, ci.payer, o.object_code, o.client_name "
            "FROM company_incomes ci LEFT JOIN objects o ON o.id = ci.object_id "
            "WHERE ci.company_id = %s AND ci.income_date >= %s ORDER BY ci.income_date DESC, ci.id DESC LIMIT 500",
            (cid, start)
        )
        for iid, oid, d, amt, cat, desc, payer, code, client in cur.fetchall():
            income_list.append({'kind': 'manual', 'id': iid, 'object_id': oid, 'income_date': d, 'amount': f(amt),
                                'category': cat, 'description': desc, 'payer': payer,
                                'object_code': code, 'client_name': client, 'source': 'manual'})
        income_list.sort(key=lambda x: (str(x['income_date'] or ''), x['id']), reverse=True)

        cur.execute("SELECT id, object_code, client_name FROM objects WHERE company_id = %s ORDER BY id DESC LIMIT 300", (cid,))
        object_options = [{'id': a, 'object_code': b, 'client_name': c or ''} for a, b, c in cur.fetchall()]

        expenses = round(f(materials) + f(rent_expense) + other_expenses, 2)
        income = round(f(received) + f(rent_income) + other_income, 2)
        return response(200, {
            'period': period, 'start': start,
            'summary': {
                'received': f(received), 'received_count': received_n,
                'outstanding': f(outstanding), 'outstanding_count': outstanding_n,
                'overdue': f(overdue), 'overdue_count': overdue_n,
                'issued': f(issued), 'auto_paid': f(auto_paid),
                'contracted': f(contracted), 'contracts_count': contracts_n,
                'materials': f(materials), 'rent_income': f(rent_income), 'rent_expense': f(rent_expense),
                'other_expenses': other_expenses, 'expenses_by_category': exp_by_cat,
                'other_income': other_income, 'income_by_category': inc_by_cat,
                'income': income, 'expenses': expenses, 'margin': round(income - expenses, 2),
            },
            'months': months,
            'objects': objects,
            'invoices': invoices,
            'upcoming': upcoming,
            'expenses': expense_list,
            'categories': CATEGORIES,
            'incomes': income_list,
            'income_categories': INCOME_CATEGORIES,
            'object_options': object_options,
        })
    finally:
        cur.close()
        conn.close()
