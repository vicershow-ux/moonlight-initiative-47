import hashlib
import json
import os
import secrets
from datetime import datetime, timedelta

from tasks import portal_tasks, portal_complete
from documents import portal_documents, portal_document, portal_sign
from chat import portal_chat
from common import (response, token_of, upload_photo, clean_photos, executor_object_ids_sql,
                    REPORT_SELECT, reports_rows, f, display_name)


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(8)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return f"{salt}${digest}"


def check_password(password, stored):
    if '$' not in (stored or ''):
        return False
    salt = stored.split('$', 1)[0]
    return secrets.compare_digest(hash_password(password, salt), stored)


def current_executor(cur, event):
    token = token_of(event)
    if not token:
        return None
    cur.execute(
        "SELECT e.id, e.company_id, e.kind, e.full_name, e.org_name, e.phone, e.email, e.specialty "
        "FROM executor_sessions s JOIN executors e ON e.id = s.executor_id "
        "WHERE s.token = %s AND s.expires_at > NOW() AND e.access_enabled = TRUE AND e.is_archived = FALSE",
        (token,)
    )
    r = cur.fetchone()
    if not r:
        return None
    keys = ['id', 'company_id', 'kind', 'full_name', 'org_name', 'phone', 'email', 'specialty']
    return dict(zip(keys, r))


def can_access_object(cur, ex, object_id):
    cur.execute(f"SELECT 1 WHERE %s IN {executor_object_ids_sql()}",
                (object_id, ex['id'], ex['company_id'], str(ex['id'])))
    return cur.fetchone() is not None


def handle_portal(method, action, event, conn, cur, params):
    '''Кабинет исполнителя: вход, его объекты и договоры, отчёты о проделанной работе'''
    body = json.loads(event.get('body') or '{}') if method in ('POST', 'PUT') else {}

    if action == 'login' and method == 'POST':
        email = str(body.get('email') or '').strip().lower()
        password = str(body.get('password') or '')
        cur.execute(
            "SELECT id, password_hash, access_enabled, is_archived FROM executors WHERE lower(login_email) = %s",
            (email,)
        )
        r = cur.fetchone()
        if not r or not check_password(password, r[1]):
            return response(401, {'error': 'Неверный email или пароль'})
        if not r[2] or r[3]:
            return response(403, {'error': 'Доступ отключён. Обратитесь к заказчику'})
        token = secrets.token_hex(32)
        cur.execute("INSERT INTO executor_sessions (executor_id, token, expires_at) VALUES (%s, %s, %s)",
                    (r[0], token, datetime.utcnow() + timedelta(days=30)))
        cur.execute("UPDATE executors SET last_login_at = NOW() WHERE id = %s", (r[0],))
        conn.commit()
        return response(200, {'token': token})

    ex = current_executor(cur, event)
    if not ex:
        return response(401, {'error': 'Войдите в кабинет исполнителя'})
    cid = ex['company_id']

    if action == 'logout':
        cur.execute("DELETE FROM executor_sessions WHERE token = %s", (token_of(event),))
        conn.commit()
        return response(200, {'ok': True})

    if action == 'upload' and method == 'POST':
        url, err = upload_photo(cid, str(body.get('file_name') or 'photo.jpg'), str(body.get('data') or ''))
        if err:
            return response(400, {'error': err})
        return response(200, {'url': url})

    if action == 'report' and method == 'POST':
        object_id = body.get('object_id')
        if not object_id or not can_access_object(cur, ex, object_id):
            return response(403, {'error': 'Нет доступа к объекту'})
        text = str(body.get('work_text') or '').strip()[:4000]
        if len(text) < 3:
            return response(400, {'error': 'Опишите, что сделано'})
        try:
            pct = max(0, min(100, int(body.get('progress_pct') or 0)))
        except (TypeError, ValueError):
            pct = 0
        contract_id = body.get('contract_id') or None
        if contract_id:
            cur.execute("SELECT 1 FROM contracts WHERE id = %s AND company_id = %s AND object_id = %s "
                        "AND options->>'executor_id' = %s", (contract_id, cid, object_id, str(ex['id'])))
            if not cur.fetchone():
                contract_id = None
        photos = clean_photos(cid, body.get('photos'))
        rdate = str(body.get('report_date') or datetime.utcnow().date().isoformat())[:10]
        cur.execute(
            "INSERT INTO executor_reports (company_id, executor_id, object_id, contract_id, report_date, work_text, "
            "progress_pct, photos) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (cid, ex['id'], object_id, contract_id, rdate, text, pct, json.dumps(photos))
        )
        new_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
            (cid, 'executor_report', 'Новый отчёт исполнителя',
             f"{display_name(ex)}: {text[:120]}", json.dumps({'object_id': int(object_id), 'report_id': new_id}))
        )
        conn.commit()
        return response(200, {'id': new_id})

    if action == 'chat':
        return portal_chat(method, cur, conn, ex, params, body, can_access_object)

    if action == 'document' and method == 'GET':
        return portal_document(cur, ex, params)
    if action == 'sign' and method == 'POST':
        return portal_sign(cur, conn, ex, params, event)

    if action == 'task' and method == 'POST':
        return portal_complete(cur, conn, ex, params, body)

    if action == 'report' and method == 'DELETE':
        cur.execute("DELETE FROM executor_reports WHERE id = %s AND executor_id = %s AND status = 'new' RETURNING id",
                    (params.get('id'), ex['id']))
        if not cur.fetchone():
            return response(400, {'error': 'Принятый отчёт удалить нельзя'})
        conn.commit()
        return response(200, {'deleted': True})

    if action == 'me':
        ids_sql = executor_object_ids_sql()
        args = (ex['id'], cid, str(ex['id']))
        cur.execute(f"SELECT id, object_code, address, client_name, status FROM objects "
                    f"WHERE company_id = %s AND id IN {ids_sql} ORDER BY id DESC", (cid,) + args)
        objects = [dict(zip(['id', 'object_code', 'address', 'client_name', 'status'], r)) for r in cur.fetchall()]
        for o in objects:
            o.pop('client_name', None)
        contracts, acts = portal_documents(cur, ex)
        cur.execute(REPORT_SELECT + "WHERE r.executor_id = %s ORDER BY r.created_at DESC LIMIT 100", (ex['id'],))
        reports = reports_rows(cur)
        cur.execute("SELECT name, phone FROM companies WHERE id = %s", (cid,))
        comp = cur.fetchone() or ('', '')
        return response(200, {
            'executor': {'id': ex['id'], 'name': display_name(ex), 'specialty': ex['specialty'], 'phone': ex['phone']},
            'company': {'name': comp[0] or '', 'phone': comp[1] or ''},
            'objects': objects, 'contracts': contracts, 'acts': acts, 'reports': reports, 'tasks': portal_tasks(cur, ex),
        })

    return response(404, {'error': 'Неизвестное действие'})
