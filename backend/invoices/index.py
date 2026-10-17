import json
import os
import re
import html as html_lib
from datetime import date

import psycopg2
from mailer import send_document_email


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400'
    }


def response(status, body):
    return {
        'statusCode': status,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str)
    }


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
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2]}


INVOICE_KEYS = [
    'id', 'object_id', 'contract_id', 'act_id', 'invoice_number', 'invoice_date', 'due_date',
    'purpose', 'items', 'vat_mode', 'total_amount', 'apply_signature', 'apply_stamp', 'notes',
    'status', 'created_at', 'updated_at',
]
COLS = ', '.join(f'i.{k}' for k in INVOICE_KEYS)
LIST_SQL = (
    f"SELECT {COLS}, o.object_code, o.client_name, o.address, c.contract_number, a.act_number "
    "FROM invoices i JOIN objects o ON o.id = i.object_id "
    "LEFT JOIN contracts c ON c.id = i.contract_id LEFT JOIN acts a ON a.id = i.act_id "
)
LIST_KEYS = INVOICE_KEYS + ['object_code', 'client_name', 'address', 'contract_number', 'act_number']

COMPANY_KEYS = [
    'name', 'entity_type', 'contact_full_name', 'phone', 'email', 'website', 'inn', 'kpp', 'ogrn',
    'legal_address', 'bank_name', 'bik', 'account_number', 'correspondent_account',
    'director_position', 'director_name', 'signature_url', 'stamp_url',
]


def clean_items(items):
    out = []
    total = 0.0
    for it in items or []:
        name = str(it.get('name') or '').strip()
        if not name:
            continue
        qty = float(it.get('quantity') or 0)
        price = float(it.get('price') or 0)
        amount = round(qty * price, 2)
        total += amount
        out.append({'name': name[:500], 'unit': str(it.get('unit') or 'шт.')[:20], 'quantity': qty, 'price': price, 'amount': amount})
    return out, round(total, 2)


def next_number(cur, company_id):
    cur.execute("SELECT COUNT(*) FROM invoices WHERE company_id = %s", (company_id,))
    return str((cur.fetchone()[0] or 0) + 1)


def load_extra(cur, company_id, inv):
    '''Реквизиты исполнителя, данные заказчика и основания — для печатной формы'''
    cur.execute(f"SELECT {', '.join(COMPANY_KEYS)} FROM companies WHERE id = %s", (company_id,))
    row = cur.fetchone()
    inv['company'] = {k: (v or '') for k, v in zip(COMPANY_KEYS, row)} if row else {}
    cur.execute(
        "SELECT client_name, client_phone, email, address, object_code FROM objects WHERE id = %s",
        (inv['object_id'],)
    )
    o = cur.fetchone() or ('', '', '', '', '')
    inv['customer'] = {'name': o[0] or '', 'phone': o[1] or '', 'email': o[2] or '', 'address': o[3] or '', 'object_code': o[4] or ''}
    inv['contract'] = None
    if inv.get('contract_id'):
        cur.execute("SELECT contract_number, contract_date, options FROM contracts WHERE id = %s", (inv['contract_id'],))
        c = cur.fetchone()
        if c:
            inv['contract'] = {'contract_number': c[0], 'contract_date': c[1], 'options': c[2] or {}}
    inv['act'] = None
    if inv.get('act_id'):
        cur.execute("SELECT act_number, act_date FROM acts WHERE id = %s", (inv['act_id'],))
        a = cur.fetchone()
        if a:
            inv['act'] = {'act_number': a[0], 'act_date': a[1]}
    return inv


def build_email(brand, phones, client_name, label, note):
    e = html_lib.escape
    greet = f'Здравствуйте, {client_name}!' if client_name else 'Здравствуйте!'
    note_html = f'<p style="margin:0 0 14px;white-space:pre-line">{e(note)}</p>' if note else ''
    html_body = f'''<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#161616">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#5C3A11;padding:18px 24px;color:#fff;font-size:18px;font-weight:bold">{e(brand)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{e(greet)}</p>
<p style="margin:0 0 14px">Направляем вам {e(label)}. Счёт приложен к письму в формате PDF — в нём указаны реквизиты для оплаты.</p>
{note_html}
<p style="margin:0 0 14px">Если появятся вопросы — просто ответьте на это письмо.</p>
<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777">С уважением, {e(brand)}{('<br/>' + e(phones)) if phones else ''}</p>
</td></tr></table></body></html>'''
    text_body = f"{greet}\n\nНаправляем вам {label}. Счёт приложен к письму.\n\n{note}\n\nС уважением, {brand}\n{phones}"
    return html_body, text_body


def handler(event: dict, context) -> dict:
    '''Счета на оплату по договору или акту: создание, редактирование, просмотр и отправка заказчику на почту'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = get_conn()
    cur = conn.cursor()
    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        is_client = user['role'] == 'client'
        if is_client and method != 'GET':
            return response(403, {'error': 'Недостаточно прав'})
        company_id = user['company_id']
        client_filter = ''
        client_args = []
        if is_client:
            client_filter = " AND i.object_id IN (SELECT object_id FROM object_access WHERE user_id = %s)"
            client_args = [user['user_id']]
        params = event.get('queryStringParameters') or {}
        inv_id = params.get('id')
        action = params.get('action')

        if method == 'GET':
            if inv_id:
                cur.execute(LIST_SQL + "WHERE i.id = %s AND i.company_id = %s" + client_filter, (inv_id, company_id, *client_args))
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Счёт не найден'})
                return response(200, load_extra(cur, company_id, dict(zip(LIST_KEYS, row))))
            where, args = "WHERE i.company_id = %s" + client_filter, [company_id, *client_args]
            for key in ('object_id', 'contract_id', 'act_id'):
                if params.get(key):
                    where += f" AND i.{key} = %s"
                    args.append(params[key])
            cur.execute(LIST_SQL + where + " ORDER BY i.created_at DESC", tuple(args))
            return response(200, {'invoices': [dict(zip(LIST_KEYS, r)) for r in cur.fetchall()]})

        body = json.loads(event.get('body') or '{}')

        if method == 'POST' and action == 'send_email':
            to_email = (body.get('email') or '').strip()
            pdf_b64 = body.get('pdf_base64') or ''
            if not inv_id:
                return response(400, {'error': 'Не указан счёт'})
            if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', to_email):
                return response(400, {'error': 'Укажите корректный email заказчика'})
            if not pdf_b64:
                return response(400, {'error': 'Нет файла счёта'})
            cur.execute(
                "SELECT i.invoice_number, o.client_name FROM invoices i JOIN objects o ON o.id = i.object_id "
                "WHERE i.id = %s AND i.company_id = %s",
                (inv_id, company_id)
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Счёт не найден'})
            cur.execute("SELECT name, phone, email, website FROM companies WHERE id = %s", (company_id,))
            comp = cur.fetchone() or ('', '', '', '')
            brand = comp[0] or 'FixKey'
            phones = ' · '.join(x for x in comp[1:] if x)
            label = f'счёт на оплату № {row[0]}'
            note = (body.get('message') or '').strip()[:2000]
            html_body, text_body = build_email(brand, phones, row[1], label, note)
            ok, err = send_document_email(
                to_email, f'Счёт на оплату № {row[0]}', html_body, text_body, pdf_b64,
                f'Счёт_{row[0]}.pdf', brand, comp[2] or ''
            )
            if not ok:
                return response(502, {'error': err})
            cur.execute("UPDATE invoices SET status = CASE WHEN status = 'paid' THEN status ELSE 'sent' END, updated_at = NOW() WHERE id = %s", (inv_id,))
            conn.commit()
            return response(200, {'success': True})

        if method == 'POST':
            object_id = body.get('object_id')
            if not object_id:
                return response(400, {'error': 'Не указан объект'})
            cur.execute("SELECT 1 FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})
            items, total = clean_items(body.get('items'))
            if not items:
                return response(400, {'error': 'Добавьте хотя бы одну позицию'})
            number = str(body.get('invoice_number') or '').strip()[:40] or next_number(cur, company_id)
            cur.execute(
                "INSERT INTO invoices (company_id, object_id, contract_id, act_id, invoice_number, invoice_date, due_date, "
                "purpose, items, vat_mode, total_amount, apply_signature, apply_stamp, notes, created_by) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    company_id, object_id, body.get('contract_id') or None, body.get('act_id') or None, number,
                    body.get('invoice_date') or date.today().isoformat(), body.get('due_date') or None,
                    str(body.get('purpose') or '')[:500], json.dumps(items, ensure_ascii=False),
                    body.get('vat_mode') or 'none', total, bool(body.get('apply_signature')),
                    bool(body.get('apply_stamp')), str(body.get('notes') or '')[:2000], user['user_id'],
                )
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'id': new_id, 'invoice_number': number})

        if method == 'PUT':
            if not inv_id:
                return response(400, {'error': 'Не указан счёт'})
            cur.execute("SELECT 1 FROM invoices WHERE id = %s AND company_id = %s", (inv_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Счёт не найден'})
            fields, values = [], []
            if 'items' in body:
                items, total = clean_items(body.get('items'))
                if not items:
                    return response(400, {'error': 'Добавьте хотя бы одну позицию'})
                fields += ['items = %s', 'total_amount = %s']
                values += [json.dumps(items, ensure_ascii=False), total]
            for key in ('invoice_number', 'invoice_date', 'due_date', 'purpose', 'vat_mode', 'notes', 'status'):
                if key in body:
                    val = body[key]
                    if key in ('invoice_date', 'due_date') and not val:
                        val = None
                    if key == 'invoice_number':
                        val = str(val or '').strip()[:40]
                        if not val:
                            continue
                    fields.append(f'{key} = %s')
                    values.append(val)
            for key in ('apply_signature', 'apply_stamp'):
                if key in body:
                    fields.append(f'{key} = %s')
                    values.append(bool(body[key]))
            if fields:
                fields.append('updated_at = NOW()')
                cur.execute(f"UPDATE invoices SET {', '.join(fields)} WHERE id = %s", (*values, inv_id))
                conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE':
            if not inv_id:
                return response(400, {'error': 'Не указан счёт'})
            cur.execute("DELETE FROM invoices WHERE id = %s AND company_id = %s", (inv_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
