import json
import re
from datetime import date

from common import (get_conn, cors_headers, response, token_of, num, f, clean_executor, FIELDS, display_name,
                    REPORT_SELECT, reports_rows)
from portal import handle_portal, hash_password


def current_user(cur, event):
    token = token_of(event)
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.company_id, u.role FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE",
        (token,)
    )
    r = cur.fetchone()
    return {'user_id': r[0], 'company_id': r[1], 'role': r[2]} if r else None


LIST_COLS = ['id'] + FIELDS + ['user_id', 'is_archived', 'created_at', 'login_email', 'access_enabled', 'last_login_at']


def executor_payload(cur, cid, row):
    e = dict(zip(LIST_COLS, row))
    e['display_name'] = display_name(e)
    e['has_password'] = False
    return e


def load_executor(cur, cid, eid):
    cur.execute(f"SELECT {', '.join(LIST_COLS)}, password_hash <> '' FROM executors WHERE id = %s AND company_id = %s",
                (eid, cid))
    r = cur.fetchone()
    if not r:
        return None
    e = executor_payload(cur, cid, r[:-1])
    e['has_password'] = bool(r[-1])
    return e


def executor_stats(cur, cid):
    cur.execute(
        "SELECT (c.options->>'executor_id')::int, COUNT(*), COALESCE(SUM(c.total_amount), 0) FROM contracts c "
        "WHERE c.company_id = %s AND c.options->>'executor_id' ~ '^[0-9]+$' GROUP BY 1",
        (cid,)
    )
    contracts = {a: (b, f(c)) for a, b, c in cur.fetchall()}
    cur.execute("SELECT executor_id, COALESCE(SUM(amount), 0) FROM company_expenses "
                "WHERE company_id = %s AND executor_id IS NOT NULL GROUP BY 1", (cid,))
    paid = {a: f(b) for a, b in cur.fetchall()}
    cur.execute("SELECT executor_id, COUNT(*) FILTER (WHERE status = 'new'), COUNT(*) FROM executor_reports "
                "WHERE company_id = %s GROUP BY 1", (cid,))
    reports = {a: (b, c) for a, b, c in cur.fetchall()}
    cur.execute("SELECT eo.executor_id, o.id, o.object_code, o.address FROM executor_objects eo "
                "JOIN objects o ON o.id = eo.object_id JOIN executors e ON e.id = eo.executor_id WHERE e.company_id = %s",
                (cid,))
    objects = {}
    for eid, oid, code, addr in cur.fetchall():
        objects.setdefault(eid, []).append({'id': oid, 'object_code': code, 'address': addr})
    return contracts, paid, reports, objects


def contract_executor(cur, cid, contract_id):
    cur.execute("SELECT id, object_id, contract_number, options FROM contracts WHERE id = %s AND company_id = %s",
                (contract_id, cid))
    r = cur.fetchone()
    if not r:
        return None
    opts = r[3] or {}
    if opts.get('our_role') != 'customer':
        return None
    eid = opts.get('executor_id')
    return {'id': r[0], 'object_id': r[1], 'contract_number': r[2], 'options': opts,
            'executor_id': int(eid) if str(eid or '').isdigit() else None}


def payee_of(opts):
    t = opts.get('contractor_type')
    if t == 'legal':
        return opts.get('contractor_org_name') or opts.get('contractor_name') or ''
    if t == 'entrepreneur':
        return f"ИП {opts.get('contractor_name') or ''}".strip()
    return opts.get('contractor_name') or ''


def handle_payments(method, cur, conn, user, params, body):
    '''Оплаты нанятому исполнителю по договору — сразу пишутся в расходы объекта (категория «Субподряд»)'''
    cid = user['company_id']
    if method == 'GET':
        cur.execute(
            "SELECT e.id, e.amount, e.expense_date, e.description, e.contract_id, e.object_id, c.contract_number "
            "FROM company_expenses e LEFT JOIN contracts c ON c.id = e.contract_id "
            "WHERE e.company_id = %s AND e.source = 'executor_payment' AND "
            "(e.contract_id = %s OR e.executor_id = %s) ORDER BY e.expense_date DESC, e.id DESC",
            (cid, params.get('contract_id') or 0, params.get('executor_id') or 0)
        )
        keys = ['id', 'amount', 'expense_date', 'description', 'contract_id', 'object_id', 'contract_number']
        return response(200, {'payments': [{**dict(zip(keys, r)), 'amount': f(r[1])} for r in cur.fetchall()]})
    if user['role'] not in ('owner', 'admin'):
        return response(403, {'error': 'Оплаты вносит руководитель'})
    if method == 'DELETE':
        cur.execute("DELETE FROM company_expenses WHERE id = %s AND company_id = %s AND source = 'executor_payment' "
                    "RETURNING id", (params.get('id'), cid))
        if not cur.fetchone():
            return response(404, {'error': 'Оплата не найдена'})
        conn.commit()
        return response(200, {'deleted': True})
    contract = contract_executor(cur, cid, body.get('contract_id'))
    if not contract:
        return response(400, {'error': 'Оплаты вносятся по договору, где вы Заказчик'})
    amount = num(body.get('amount'))
    if not amount or amount <= 0 or amount > 1e10:
        return response(400, {'error': 'Укажите сумму оплаты'})
    pdate = str(body.get('payment_date') or date.today().isoformat())[:10]
    try:
        date.fromisoformat(pdate)
    except ValueError:
        return response(400, {'error': 'Неверная дата'})
    note = str(body.get('note') or '').strip()[:300]
    desc = f"Оплата исполнителю по договору № {contract['contract_number']}" + (f" — {note}" if note else '')
    opts = contract['options']
    cur.execute(
        "INSERT INTO company_expenses (company_id, object_id, category, amount, expense_date, description, payee, "
        "payee_inn, created_by, contract_id, executor_id, source) "
        "VALUES (%s, %s, 'subcontract', %s, %s, %s, %s, %s, %s, %s, %s, 'executor_payment') RETURNING id",
        (cid, contract['object_id'], amount, pdate, desc, payee_of(opts)[:255], str(opts.get('contractor_inn') or '')[:20],
         user['user_id'], contract['id'], contract['executor_id'])
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    return response(200, {'id': new_id})


def handle_reports(method, cur, conn, user, params, body):
    cid = user['company_id']
    if method == 'GET':
        where, args = "r.company_id = %s", [cid]
        if params.get('object_id'):
            where += " AND r.object_id = %s"
            args.append(params['object_id'])
        if params.get('executor_id'):
            where += " AND r.executor_id = %s"
            args.append(params['executor_id'])
        cur.execute(REPORT_SELECT + f"WHERE {where} ORDER BY r.created_at DESC LIMIT 200", args)
        return response(200, {'reports': reports_rows(cur)})
    status = body.get('status')
    if status not in ('accepted', 'rework'):
        return response(400, {'error': 'Неизвестный статус'})
    cur.execute("UPDATE executor_reports SET status = %s, reply = %s, reviewed_at = NOW() "
                "WHERE id = %s AND company_id = %s RETURNING id",
                (status, str(body.get('reply') or '').strip()[:2000], params.get('id'), cid))
    if not cur.fetchone():
        return response(404, {'error': 'Отчёт не найден'})
    conn.commit()
    return response(200, {'ok': True})


def set_objects(cur, cid, eid, object_ids):
    ids = [int(x) for x in (object_ids or []) if str(x).isdigit()]
    cur.execute("DELETE FROM executor_objects WHERE executor_id = %s", (eid,))
    if ids:
        cur.execute("SELECT id FROM objects WHERE company_id = %s AND id = ANY(%s)", (cid, ids))
        for (oid,) in cur.fetchall():
            cur.execute("INSERT INTO executor_objects (executor_id, object_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                        (eid, oid))


def set_access(cur, cid, eid, body):
    '''Доступ исполнителя в его кабинет: почта для входа, пароль, включён ли вход'''
    login = str(body.get('login_email') or '').strip().lower()[:255]
    enabled = bool(body.get('access_enabled'))
    password = str(body.get('password') or '')
    if enabled and not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', login):
        return 'Укажите почту для входа исполнителя'
    if login:
        cur.execute("SELECT 1 FROM executors WHERE lower(login_email) = %s AND id <> %s", (login, eid))
        if cur.fetchone():
            return 'Эта почта уже используется другим исполнителем'
    if password and len(password) < 6:
        return 'Пароль — не короче 6 символов'
    cur.execute("SELECT password_hash FROM executors WHERE id = %s", (eid,))
    has_pwd = bool((cur.fetchone() or [''])[0])
    if enabled and not password and not has_pwd:
        return 'Задайте пароль для входа исполнителя'
    cur.execute("UPDATE executors SET login_email = %s, access_enabled = %s WHERE id = %s", (login, enabled, eid))
    if password:
        cur.execute("UPDATE executors SET password_hash = %s WHERE id = %s", (hash_password(password), eid))
    if not enabled:
        cur.execute("DELETE FROM executor_sessions WHERE executor_id = %s", (eid,))
    return None


def handler(event: dict, context) -> dict:
    '''Исполнители (субподрядчики): справочник с реквизитами, объекты, оплаты в расходы, отчёты и кабинет исполнителя'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}
    params = event.get('queryStringParameters') or {}
    action = params.get('action') or ''

    conn = get_conn()
    cur = conn.cursor()
    try:
        if params.get('portal'):
            return handle_portal(method, action, event, conn, cur, params)

        user = current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        if user['role'] not in ('owner', 'admin', 'employee'):
            return response(403, {'error': 'Недостаточно прав'})
        cid = user['company_id']
        body = json.loads(event.get('body') or '{}') if method in ('POST', 'PUT') else {}

        if action == 'payment':
            return handle_payments(method, cur, conn, user, params, body)
        if action == 'reports':
            return handle_reports(method, cur, conn, user, params, body)

        eid = params.get('id')
        if method == 'GET' and eid:
            e = load_executor(cur, cid, eid)
            if not e:
                return response(404, {'error': 'Исполнитель не найден'})
            cur.execute("SELECT o.id, o.object_code, o.address FROM executor_objects eo JOIN objects o ON o.id = eo.object_id "
                        "WHERE eo.executor_id = %s", (eid,))
            e['objects'] = [{'id': a, 'object_code': b, 'address': c} for a, b, c in cur.fetchall()]
            cur.execute(
                "SELECT c.id, c.object_id, c.contract_number, c.contract_date, c.status, c.total_amount, o.object_code, "
                "c.options->>'work_subject', "
                "COALESCE((SELECT SUM(amount) FROM company_expenses x WHERE x.contract_id = c.id AND x.source = 'executor_payment'), 0) "
                "FROM contracts c JOIN objects o ON o.id = c.object_id "
                "WHERE c.company_id = %s AND c.options->>'executor_id' = %s ORDER BY c.contract_date DESC",
                (cid, str(eid))
            )
            e['contracts'] = [{'id': a, 'object_id': b, 'contract_number': c, 'contract_date': d, 'status': s,
                               'total_amount': f(t), 'object_code': oc, 'work_subject': ws or '', 'paid': f(p)}
                              for a, b, c, d, s, t, oc, ws, p in cur.fetchall()]
            return response(200, {'executor': e})

        if method == 'GET':
            cur.execute(f"SELECT {', '.join(LIST_COLS)} FROM executors WHERE company_id = %s "
                        "ORDER BY is_archived, full_name, org_name", (cid,))
            rows = [executor_payload(cur, cid, r) for r in cur.fetchall()]
            contracts, paid, reports, objects = executor_stats(cur, cid)
            for e in rows:
                n, total = contracts.get(e['id'], (0, 0))
                e['contracts_count'] = n
                e['contracts_total'] = total
                e['paid_total'] = paid.get(e['id'], 0)
                e['reports_new'], e['reports_total'] = reports.get(e['id'], (0, 0))
                e['objects'] = objects.get(e['id'], [])
            return response(200, {'executors': rows})

        if method == 'DELETE':
            cur.execute("UPDATE executors SET is_archived = TRUE, access_enabled = FALSE, updated_at = NOW() "
                        "WHERE id = %s AND company_id = %s RETURNING id", (eid, cid))
            if not cur.fetchone():
                return response(404, {'error': 'Исполнитель не найден'})
            cur.execute("DELETE FROM executor_sessions WHERE executor_id = %s", (eid,))
            conn.commit()
            return response(200, {'archived': True})

        if method in ('POST', 'PUT'):
            data = clean_executor(body)
            name = data['org_name'] if data['kind'] == 'legal' else data['full_name']
            if len(name) < 2:
                return response(400, {'error': 'Укажите ФИО или название исполнителя'})
            if method == 'PUT':
                sets = ', '.join(f"{k} = %s" for k in FIELDS)
                cur.execute(f"UPDATE executors SET {sets}, is_archived = %s, updated_at = NOW() "
                            "WHERE id = %s AND company_id = %s RETURNING id",
                            [data[k] for k in FIELDS] + [bool(body.get('is_archived')), eid, cid])
                if not cur.fetchone():
                    return response(404, {'error': 'Исполнитель не найден'})
            else:
                cols = ', '.join(FIELDS)
                marks = ', '.join(['%s'] * len(FIELDS))
                cur.execute(f"INSERT INTO executors (company_id, {cols}) VALUES (%s, {marks}) RETURNING id",
                            [cid] + [data[k] for k in FIELDS])
                eid = cur.fetchone()[0]
            if 'object_ids' in body:
                set_objects(cur, cid, eid, body.get('object_ids'))
            if 'access_enabled' in body and user['role'] in ('owner', 'admin'):
                err = set_access(cur, cid, eid, body)
                if err:
                    conn.rollback()
                    return response(400, {'error': err})
            conn.commit()
            return response(200, {'id': eid, 'saved': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
