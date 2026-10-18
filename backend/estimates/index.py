import json
import os
import re
import html as html_lib
import psycopg2
from mailer import send_document_email, send_plain_email



def build_doc_email(brand, comp_phone, comp_email, comp_site, client_name, doc_label, note):
    e = html_lib.escape
    greet = f'Здравствуйте, {client_name}!' if client_name else 'Здравствуйте!'
    note_html = f'<p style="margin:0 0 14px;white-space:pre-line">{e(note)}</p>' if note else ''
    contacts = ' · '.join(x for x in [comp_phone, comp_email, comp_site] if x)
    html_body = f'''<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#161616">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#5C3A11;padding:18px 24px;color:#fff;font-size:18px;font-weight:bold">{e(brand)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{e(greet)}</p>
<p style="margin:0 0 14px">Направляем вам {e(doc_label)}. Файл приложен к письму в формате PDF.</p>
{note_html}
<p style="margin:0 0 14px">Если появятся вопросы — просто ответьте на это письмо.</p>
<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777">С уважением, {e(brand)}{('<br/>' + e(contacts)) if contacts else ''}</p>
</td></tr></table></body></html>'''
    text_body = f"{greet}\n\nНаправляем вам {doc_label}. Файл приложен к письму.\n\n{note}\n\nС уважением, {brand}\n{contacts}"
    return html_body, text_body

def money(v):
    return f"{float(v or 0):,.0f}".replace(',', ' ') + ' ₽'


def notify_client_decision(cur, company_id, item_id, approved):
    '''Письмо заказчику, предложившему работу: решение, сумма, новый итог сметы'''
    cur.execute(
        "SELECT ei.name, ei.quantity, ei.unit, ei.amount, e.id, COALESCE(NULLIF(e.estimate_number, ''), e.id::text), "
        "e.total_amount, u.email, u.full_name, o.object_code, e.object_id "
        "FROM estimate_items ei JOIN estimates e ON e.id = ei.estimate_id "
        "JOIN objects o ON o.id = e.object_id LEFT JOIN users u ON u.id = ei.proposed_by "
        "WHERE ei.id = %s",
        (item_id,)
    )
    r = cur.fetchone()
    if not r or not r[7]:
        return
    name, qty, unit, amount, est_id, number, total, to_email, full_name, obj_code, obj_id = r
    cur.execute("SELECT name, phone, email FROM companies WHERE id = %s", (company_id,))
    comp = cur.fetchone() or ('FixKey', '', '')
    brand = comp[0] or 'FixKey'
    e = html_lib.escape
    verdict = 'согласована' if approved else 'отклонена'
    color = '#2e7d32' if approved else '#c62828'
    qty_txt = f"{float(qty):g} {unit}"
    tail = (f'Работа добавлена в смету № {number}. Новый итог сметы: {money(total)}.' if approved
            else f'Итог сметы № {number} не изменился: {money(total)}. Если остались вопросы — ответьте на это письмо, обсудим.')
    greet = f'Здравствуйте, {full_name}!' if full_name else 'Здравствуйте!'
    html_body = f'''<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#161616">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#161616;padding:18px 24px;color:#D4AF37;font-size:18px;font-weight:bold">{e(brand)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{e(greet)}</p>
<p style="margin:0 0 14px">Предложенная вами дополнительная работа по объекту {e(obj_code)} <b style="color:{color}">{verdict}</b>.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border:1px solid #eee;border-radius:8px">
<tr><td style="padding:10px 12px;color:#888;width:130px">Работа</td><td style="padding:10px 12px;font-weight:bold">{e(name)}</td></tr>
<tr><td style="padding:10px 12px;color:#888;border-top:1px solid #eee">Объём</td><td style="padding:10px 12px;border-top:1px solid #eee">{e(qty_txt)}</td></tr>
<tr><td style="padding:10px 12px;color:#888;border-top:1px solid #eee">Сумма</td><td style="padding:10px 12px;border-top:1px solid #eee">{money(amount)}</td></tr>
<tr><td style="padding:10px 12px;color:#888;border-top:1px solid #eee">Итог сметы</td><td style="padding:10px 12px;border-top:1px solid #eee;font-weight:bold">{money(total)}</td></tr>
</table>
<p style="margin:16px 0 0">{e(tail)}</p>
<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777">С уважением, {e(brand)}{('<br/>' + e(comp[1])) if comp[1] else ''}</p>
</td></tr></table></body></html>'''
    text_body = (f"{greet}\n\nПредложенная вами дополнительная работа по объекту {obj_code} {verdict}.\n\n"
                 f"Работа: {name}\nОбъём: {qty_txt}\nСумма: {money(amount)}\nИтог сметы: {money(total)}\n\n{tail}\n\nС уважением, {brand}")
    subject = f"Дополнительная работа {verdict}: {name}"[:200]
    ok, err = send_plain_email(to_email, subject, html_body, text_body, brand, comp[2] or '')
    print(f'Extra work decision email {"OK" if ok else "FAILED"} -> {to_email}: {err}')


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        "SELECT u.id, u.company_id, u.role, u.full_name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2], 'full_name': row[3]}


def parse_lead_works(cur, company_id, raw_json, raw_text):
    '''Работы из заявки с сайта: из сохранённого списка, а для старых заявок — из текста'''
    works = []
    try:
        works = json.loads(raw_json) if raw_json else []
    except ValueError:
        works = []
    if not works and raw_text:
        for line in raw_text.split('\n'):
            m = re.match(r'^\s*\d+\.\s+(.+?)\s+—\s+([\d.,]+)\s*(.*?)\s+×', line)
            if m:
                works.append({'name': m.group(1).strip(), 'quantity': float(m.group(2).replace(',', '.')), 'category': None})
    out = []
    for w in works:
        name = str(w.get('name') or '').strip()
        qty = float(w.get('quantity') or 0)
        if not name or qty <= 0:
            continue
        if w.get('category') is None:
            cur.execute(
                "SELECT id, unit, price, category, subcategory FROM services WHERE company_id = %s AND name = %s ORDER BY is_active DESC LIMIT 1",
                (company_id, name)
            )
        else:
            cur.execute(
                "SELECT id, unit, price, category, subcategory FROM services WHERE company_id = %s AND name = %s AND category = %s ORDER BY is_active DESC LIMIT 1",
                (company_id, name, w.get('category') or '')
            )
        s = cur.fetchone()
        price = float(s[2]) if s else float(w.get('price') or 0)
        out.append({
            'service_id': s[0] if s else None,
            'name': name[:255],
            'unit': ((s[1] if s else w.get('unit')) or 'шт')[:50],
            'price': price,
            'quantity': qty,
            'amount': round(price * qty, 2),
            'category': (s[3] if s else w.get('category')) or '',
            'subcategory': (s[4] if s else w.get('subcategory')) or '',
        })
    return out


def has_object_access(cur, user, object_id):
    if user['role'] != 'client':
        return True
    cur.execute(
        "SELECT 1 FROM object_access WHERE user_id = %s AND object_id = %s",
        (user['user_id'], object_id)
    )
    return cur.fetchone() is not None


ESTIMATE_KEYS = [
    'id', 'object_id', 'total_amount', 'created_at',
    'contract_number', 'contract_date', 'discount_percent', 'discount_amount',
    'notes', 'subtotal_amount', 'status', 'revision_number', 'created_by',
    'apply_signature', 'apply_stamp', 'estimate_number', 'client_approved_at',
]


def handler(event: dict, context) -> dict:
    '''Создание и просмотр смет по объектам с позициями услуг, группировкой по помещениям, скидками, статусами стадий и заявками заказчиков на доп. работы'''
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
        is_client = user['role'] == 'client'

        params = event.get('queryStringParameters') or {}
        estimate_id = params.get('id')
        object_id = params.get('object_id')
        item_id = params.get('item_id')
        action = params.get('action')

        if method == 'GET':
            if estimate_id:
                cur.execute(
                    f"SELECT {', '.join(ESTIMATE_KEYS)} FROM estimates WHERE id = %s AND company_id = %s",
                    (estimate_id, company_id)
                )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Смета не найдена'})
                estimate = dict(zip(ESTIMATE_KEYS, row))

                if not has_object_access(cur, user, estimate['object_id']):
                    return response(403, {'error': 'Недостаточно прав'})

                cur.execute(
                    "SELECT o.object_code, o.client_name, o.client_phone, o.email, o.object_type, o.area, o.address "
                    "FROM objects o WHERE o.id = %s",
                    (estimate['object_id'],)
                )
                obj_row = cur.fetchone()
                if obj_row:
                    obj_keys = ['object_code', 'client_name', 'client_phone', 'email', 'object_type', 'area', 'address']
                    estimate.update(dict(zip(obj_keys, obj_row)))

                cur.execute(
                    "SELECT name, phone, email, website, inn, legal_address, bank_name, bik, account_number, "
                    "bank_inn, bank_kpp, correspondent_account, signature_url, stamp_url, ogrn, kpp, "
                    "entity_type, contact_full_name FROM companies WHERE id = %s",
                    (company_id,)
                )
                company_row = cur.fetchone()
                company_keys = [
                    'company_name', 'company_phone', 'company_email', 'company_website', 'company_inn',
                    'company_legal_address', 'company_bank_name', 'company_bik', 'company_account_number',
                    'company_bank_inn', 'company_bank_kpp', 'company_correspondent_account', 'company_signature_url',
                    'company_stamp_url', 'company_ogrn', 'company_kpp', 'company_entity_type', 'company_contact_full_name'
                ]
                if company_row:
                    estimate.update(dict(zip(company_keys, company_row)))
                else:
                    estimate.update({k: '' for k in company_keys})

                cur.execute(
                    "SELECT id, total_amount, created_at, revision_number, status FROM estimates WHERE object_id = %s AND company_id = %s ORDER BY revision_number DESC",
                    (estimate['object_id'], company_id)
                )
                rev_keys = ['id', 'total_amount', 'created_at', 'revision_number', 'status']
                estimate['revisions'] = [dict(zip(rev_keys, r)) for r in cur.fetchall()]

                cur.execute(
                    "SELECT ei.id, ei.name, ei.unit, ei.price, ei.quantity, ei.times, ei.discount_percent, ei.amount, ei.status, ei.proposed_by, u.full_name, ei.room_id, ei.room_name, ei.category, ei.subcategory "
                    "FROM estimate_items ei LEFT JOIN users u ON u.id = ei.proposed_by WHERE ei.estimate_id = %s ORDER BY ei.room_id NULLS FIRST, ei.id",
                    (estimate_id,)
                )
                item_keys = ['id', 'name', 'unit', 'price', 'quantity', 'times', 'discount_percent', 'amount', 'status', 'proposed_by', 'proposed_by_name', 'room_id', 'room_name', 'category', 'subcategory']
                estimate['items'] = [dict(zip(item_keys, r)) for r in cur.fetchall()]
                return response(200, estimate)

            if object_id:
                if not has_object_access(cur, user, object_id):
                    return response(403, {'error': 'Недостаточно прав'})
                cur.execute(
                    f"SELECT {', '.join(ESTIMATE_KEYS)} FROM estimates WHERE object_id = %s AND company_id = %s ORDER BY revision_number DESC",
                    (object_id, company_id)
                )
                rows = cur.fetchall()
                return response(200, {'estimates': [dict(zip(ESTIMATE_KEYS, r)) for r in rows]})

            base_cols = ', '.join(f'e.{k}' for k in ESTIMATE_KEYS)
            if is_client:
                cur.execute(
                    f"SELECT {base_cols}, o.object_code, o.client_name, o.object_type, o.area, EXISTS(SELECT 1 FROM estimate_items ei WHERE ei.estimate_id = e.id AND ei.status = 'pending') FROM estimates e JOIN object_access oa ON oa.object_id = e.object_id JOIN objects o ON o.id = e.object_id WHERE e.company_id = %s AND oa.user_id = %s ORDER BY e.created_at DESC",
                    (company_id, user['user_id'])
                )
            else:
                cur.execute(
                    f"SELECT {base_cols}, o.object_code, o.client_name, o.object_type, o.area, EXISTS(SELECT 1 FROM estimate_items ei WHERE ei.estimate_id = e.id AND ei.status = 'pending') FROM estimates e JOIN objects o ON o.id = e.object_id WHERE e.company_id = %s ORDER BY e.created_at DESC",
                    (company_id,)
                )
            rows = cur.fetchall()
            keys = ESTIMATE_KEYS + ['object_code', 'client_name', 'object_type', 'area', 'has_pending']
            return response(200, {'estimates': [dict(zip(keys, r)) for r in rows]})

        if method == 'POST' and action == 'send_email':
            if user.get('role') == 'client':
                return response(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            to_email = (body.get('email') or '').strip()
            pdf_b64 = body.get('pdf_base64') or ''
            if not estimate_id:
                return response(400, {'error': 'Не указан документ'})
            if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', to_email):
                return response(400, {'error': 'Укажите корректный email заказчика'})
            if not pdf_b64:
                return response(400, {'error': 'Нет файла документа'})
            if len(pdf_b64) > 9_000_000:
                return response(400, {'error': 'Файл слишком большой для отправки'})
            cur.execute("SELECT COALESCE(NULLIF(e.estimate_number, ''), e.id::text), o.client_name FROM estimates e JOIN objects o ON o.id = e.object_id WHERE e.id = %s AND e.company_id = %s", (estimate_id, company_id))
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Документ не найден'})
            number, client_name = row
            cur.execute("SELECT name, phone, email, website FROM companies WHERE id = %s", (company_id,))
            comp = cur.fetchone() or ('', '', '', '')
            brand = comp[0] or 'FixKey'
            label = f'Смета № {number}'
            note = (body.get('message') or '').strip()[:2000]
            html_body, text_body = build_doc_email(brand, comp[1] or '', comp[2] or '', comp[3] or '', client_name, label.lower(), note)
            ok, err = send_document_email(to_email, label, html_body, text_body, pdf_b64, f'Смета_{number}.pdf', brand, comp[2] or '')
            if not ok:
                return response(502, {'error': err})
            return response(200, {'success': True})

        if method == 'POST' and action == 'from_lead':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            obj_id = body.get('object_id')
            cur.execute(
                "SELECT lead_works, lead_request FROM objects WHERE id = %s AND company_id = %s",
                (obj_id, company_id)
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Объект не найден'})
            works = parse_lead_works(cur, company_id, row[0], row[1])
            if not works:
                return response(400, {'error': 'В заявке нет работ из прайса'})

            subtotal = round(sum(w['amount'] for w in works), 2)
            cur.execute(
                "SELECT COALESCE(MAX(revision_number), 0) FROM estimates WHERE object_id = %s AND company_id = %s",
                (obj_id, company_id)
            )
            next_revision = (cur.fetchone()[0] or 0) + 1
            cur.execute(
                "INSERT INTO estimates (company_id, object_id, total_amount, subtotal_amount, contract_number, contract_date, discount_percent, discount_amount, notes, revision_number, created_by, apply_signature, apply_stamp, estimate_number) "
                "VALUES (%s, %s, %s, %s, '', NULL, 0, 0, %s, %s, %s, false, false, '') RETURNING id",
                (company_id, obj_id, subtotal, subtotal, 'Составлена по заявке клиента с сайта', next_revision, user['user_id'])
            )
            new_id = cur.fetchone()[0]
            for w in works:
                cur.execute(
                    "INSERT INTO estimate_items (estimate_id, service_id, name, unit, price, quantity, times, discount_percent, amount, status, room_name, category, subcategory) "
                    "VALUES (%s, %s, %s, %s, %s, %s, 1, 0, %s, 'approved', '', %s, %s)",
                    (new_id, w['service_id'], w['name'], w['unit'], w['price'], w['quantity'], w['amount'], w['category'], w['subcategory'])
                )
            conn.commit()
            return response(200, {'id': new_id, 'items': len(works), 'total_amount': subtotal})

        if method == 'POST' and action == 'propose':
            body = json.loads(event.get('body') or '{}')
            est_id = body.get('estimate_id')
            name = (body.get('name') or '').strip()[:255]
            unit = (body.get('unit') or 'шт').strip()[:50]
            price = max(0.0, float(body.get('price') or 0))
            quantity = float(body.get('quantity') or 0)
            service_id = body.get('service_id')
            category = ''
            subcategory = ''
            comment = (body.get('comment') or '').strip()[:500]

            if not is_client:
                return response(403, {'error': 'Доступно только заказчику'})
            if service_id:
                cur.execute(
                    "SELECT name, unit, price, category, subcategory FROM services WHERE id = %s AND company_id = %s AND is_active = true",
                    (service_id, company_id)
                )
                srow = cur.fetchone()
                if not srow:
                    return response(400, {'error': 'Услуга не найдена в прайсе'})
                name, unit, price, category, subcategory = srow[0], srow[1] or 'шт', float(srow[2] or 0), srow[3] or '', srow[4] or ''
            else:
                service_id = None
            if comment:
                name = f"{name} ({comment})"[:255]
            if not est_id or not name or quantity <= 0 or quantity > 1000000:
                return response(400, {'error': 'Заполните все поля позиции'})

            cur.execute("SELECT object_id FROM estimates WHERE id = %s AND company_id = %s", (est_id, company_id))
            est_row = cur.fetchone()
            if not est_row:
                return response(404, {'error': 'Смета не найдена'})
            if not has_object_access(cur, user, est_row[0]):
                return response(403, {'error': 'Недостаточно прав'})

            amount = round(price * quantity, 2)
            cur.execute(
                "INSERT INTO estimate_items (estimate_id, service_id, name, unit, price, quantity, amount, status, proposed_by, category, subcategory, room_name) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending', %s, %s, %s, 'Дополнительные работы') RETURNING id",
                (est_id, service_id, name, unit, price, quantity, amount, user['user_id'], category, subcategory)
            )
            new_item_id = cur.fetchone()[0]

            cur.execute(
                "SELECT object_code, client_name FROM objects WHERE id = %s",
                (est_row[0],)
            )
            obj_row = cur.fetchone()
            obj_label = obj_row[0] if obj_row else ''

            cur.execute(
                "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
                (
                    company_id, 'estimate_proposal',
                    'Новая позиция от заказчика',
                    f'{user["full_name"]} предложил добавить «{name}» в смету по объекту {obj_label}',
                    json.dumps({'estimate_id': est_id, 'item_id': new_item_id, 'object_id': est_row[0]})
                )
            )

            conn.commit()

            return response(200, {'id': new_item_id, 'status': 'pending'})

        if method == 'PUT' and action in ('approve', 'reject'):
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not item_id:
                return response(400, {'error': 'Не указан id позиции'})

            cur.execute(
                "SELECT ei.estimate_id, ei.amount FROM estimate_items ei JOIN estimates e ON e.id = ei.estimate_id WHERE ei.id = %s AND e.company_id = %s",
                (item_id, company_id)
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Позиция не найдена'})
            est_id, amount = row

            new_status = 'approved' if action == 'approve' else 'rejected'
            cur.execute("UPDATE estimate_items SET status = %s WHERE id = %s", (new_status, item_id))
            body = json.loads(event.get('body') or '{}')
            if new_status == 'approved' and body.get('price') is not None:
                new_price = max(0.0, float(body.get('price') or 0))
                cur.execute(
                    "UPDATE estimate_items SET price = %s, amount = ROUND(%s * quantity * COALESCE(times, 1) * (1 - COALESCE(discount_percent, 0) / 100), 2) WHERE id = %s",
                    (new_price, new_price, item_id)
                )

            cur.execute(
                "UPDATE estimates e SET subtotal_amount = s.sub, "
                "discount_amount = CASE WHEN e.discount_percent > 0 THEN ROUND(s.sub * e.discount_percent / 100, 2) ELSE e.discount_amount END, "
                "total_amount = GREATEST(0, s.sub - CASE WHEN e.discount_percent > 0 THEN ROUND(s.sub * e.discount_percent / 100, 2) ELSE e.discount_amount END) "
                "FROM (SELECT COALESCE(SUM(amount), 0) AS sub FROM estimate_items WHERE estimate_id = %s AND status = 'approved') s "
                "WHERE e.id = %s",
                (est_id, est_id)
            )
            conn.commit()
            notify_client_decision(cur, company_id, item_id, new_status == 'approved')

            return response(200, {'success': True, 'status': new_status})

        if method == 'POST' and action == 'client_approve':
            if not is_client:
                return response(403, {'error': 'Доступно только заказчику'})
            cur.execute("SELECT object_id, status, COALESCE(NULLIF(estimate_number, ''), id::text), total_amount FROM estimates WHERE id = %s AND company_id = %s", (estimate_id, company_id))
            row = cur.fetchone()
            if not row or not has_object_access(cur, user, row[0]):
                return response(404, {'error': 'Смета не найдена'})
            if row[1] == 'approved':
                return response(200, {'success': True, 'status': 'approved'})
            if row[1] == 'inactive':
                return response(400, {'error': 'Эта редакция сметы неактуальна'})
            cur.execute("SELECT COUNT(*) FROM estimate_items WHERE estimate_id = %s AND status = 'pending'", (estimate_id,))
            if cur.fetchone()[0]:
                return response(400, {'error': 'В смете есть доп. работы на согласовании — дождитесь решения подрядчика'})
            cur.execute(
                "UPDATE estimates SET status = 'approved', client_approved_at = NOW(), client_approved_by = %s WHERE id = %s",
                (user['user_id'], estimate_id)
            )
            cur.execute("SELECT object_code FROM objects WHERE id = %s", (row[0],))
            code = (cur.fetchone() or [''])[0]
            cur.execute(
                "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
                (company_id, 'estimate_approved', 'Заказчик согласовал смету',
                 f'{user["full_name"]} согласовал смету № {row[2]} по объекту {code} на {money(row[3])}',
                 json.dumps({'estimate_id': int(estimate_id), 'object_id': row[0]}))
            )
            conn.commit()
            return response(200, {'success': True, 'status': 'approved'})

        if method == 'PUT' and action == 'set_status':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not estimate_id:
                return response(400, {'error': 'Не указан id сметы'})

            body = json.loads(event.get('body') or '{}')
            new_status = (body.get('status') or '').strip()
            allowed_statuses = ('ready', 'in_approval', 'in_signing', 'needs_revision', 'approved', 'inactive')
            if new_status not in allowed_statuses:
                return response(400, {'error': 'Недопустимый статус'})

            cur.execute(
                "UPDATE estimates SET status = %s WHERE id = %s AND company_id = %s RETURNING id",
                (new_status, estimate_id, company_id)
            )
            if not cur.fetchone():
                return response(404, {'error': 'Смета не найдена'})
            conn.commit()

            return response(200, {'success': True, 'status': new_status})

        if method == 'PUT' and not action:
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not estimate_id:
                return response(400, {'error': 'Не указан id сметы'})

            cur.execute("SELECT object_id FROM estimates WHERE id = %s AND company_id = %s", (estimate_id, company_id))
            est_row = cur.fetchone()
            if not est_row:
                return response(404, {'error': 'Смета не найдена'})
            obj_id = est_row[0]

            body = json.loads(event.get('body') or '{}')
            items = body.get('items') or []
            contract_number = (body.get('contract_number') or '').strip()
            contract_date = body.get('contract_date') or None
            discount_percent = float(body.get('discount_percent') or 0)
            discount_amount_input = float(body.get('discount_amount') or 0)
            notes = (body.get('notes') or '').strip()
            apply_signature = bool(body.get('apply_signature'))
            apply_stamp = bool(body.get('apply_stamp'))
            estimate_number = str(body.get('estimate_number') or '').strip()[:40]

            if not items:
                return response(400, {'error': 'Добавьте хотя бы одну позицию сметы'})

            subtotal = 0
            clean_items = []
            for it in items:
                name = (it.get('name') or '').strip()
                unit = (it.get('unit') or 'м²').strip()
                price = float(it.get('price') or 0)
                quantity = float(it.get('quantity') or 0)
                times = float(it.get('times') or 1)
                item_discount = float(it.get('discount_percent') or 0)
                if not name or quantity <= 0:
                    continue
                amount = round(price * quantity * times * (1 - item_discount / 100), 2)
                subtotal += amount
                clean_items.append({
                    'service_id': it.get('service_id'),
                    'name': name, 'unit': unit, 'price': price,
                    'quantity': quantity, 'times': times, 'discount_percent': item_discount,
                    'amount': amount,
                    'room_id': it.get('room_id'),
                    'room_name': (it.get('room_name') or '').strip(),
                    'category': (it.get('category') or '').strip(),
                    'subcategory': (it.get('subcategory') or '').strip(),
                })

            if not clean_items:
                return response(400, {'error': 'Добавьте хотя бы одну корректную позицию'})

            discount_amount = discount_amount_input
            if discount_percent > 0:
                discount_amount = round(subtotal * discount_percent / 100, 2)
            total = max(0, round(subtotal - discount_amount, 2))

            cur.execute(
                "UPDATE estimates SET total_amount = %s, subtotal_amount = %s, contract_number = %s, contract_date = %s, "
                "discount_percent = %s, discount_amount = %s, notes = %s, apply_signature = %s, apply_stamp = %s, estimate_number = %s WHERE id = %s",
                (total, subtotal, contract_number, contract_date, discount_percent, discount_amount, notes, apply_signature, apply_stamp, estimate_number, estimate_id)
            )
            cur.execute("DELETE FROM estimate_items WHERE estimate_id = %s", (estimate_id,))
            for it in clean_items:
                cur.execute(
                    "INSERT INTO estimate_items (estimate_id, service_id, name, unit, price, quantity, times, discount_percent, amount, status, room_id, room_name, category, subcategory) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'approved', %s, %s, %s, %s)",
                    (estimate_id, it['service_id'], it['name'], it['unit'], it['price'], it['quantity'], it['times'], it['discount_percent'], it['amount'], it['room_id'], it['room_name'], it['category'], it['subcategory'])
                )
            conn.commit()

            return response(200, {
                'id': int(estimate_id), 'object_id': obj_id, 'total_amount': total, 'subtotal_amount': subtotal,
                'contract_number': contract_number, 'contract_date': contract_date,
                'discount_percent': discount_percent, 'discount_amount': discount_amount, 'notes': notes,
                'items': clean_items,
            })

        if method == 'POST':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})

            body = json.loads(event.get('body') or '{}')
            obj_id = body.get('object_id')
            items = body.get('items') or []
            contract_number = (body.get('contract_number') or '').strip()
            contract_date = body.get('contract_date') or None
            discount_percent = float(body.get('discount_percent') or 0)
            discount_amount_input = float(body.get('discount_amount') or 0)
            notes = (body.get('notes') or '').strip()
            apply_signature = bool(body.get('apply_signature'))
            apply_stamp = bool(body.get('apply_stamp'))
            estimate_number = str(body.get('estimate_number') or '').strip()[:40]

            if not obj_id:
                return response(400, {'error': 'Не указан объект'})
            if not items:
                return response(400, {'error': 'Добавьте хотя бы одну позицию сметы'})

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (obj_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            subtotal = 0
            clean_items = []
            for it in items:
                name = (it.get('name') or '').strip()
                unit = (it.get('unit') or 'м²').strip()
                price = float(it.get('price') or 0)
                quantity = float(it.get('quantity') or 0)
                times = float(it.get('times') or 1)
                item_discount = float(it.get('discount_percent') or 0)
                if not name or quantity <= 0:
                    continue
                amount = round(price * quantity * times * (1 - item_discount / 100), 2)
                subtotal += amount
                clean_items.append({
                    'service_id': it.get('service_id'),
                    'name': name, 'unit': unit, 'price': price,
                    'quantity': quantity, 'times': times, 'discount_percent': item_discount,
                    'amount': amount,
                    'room_id': it.get('room_id'),
                    'room_name': (it.get('room_name') or '').strip(),
                    'category': (it.get('category') or '').strip(),
                    'subcategory': (it.get('subcategory') or '').strip(),
                })

            if not clean_items:
                return response(400, {'error': 'Добавьте хотя бы одну корректную позицию'})

            discount_amount = discount_amount_input
            if discount_percent > 0:
                discount_amount = round(subtotal * discount_percent / 100, 2)
            total = max(0, round(subtotal - discount_amount, 2))

            cur.execute(
                "SELECT COALESCE(MAX(revision_number), 0) FROM estimates WHERE object_id = %s AND company_id = %s",
                (obj_id, company_id)
            )
            next_revision = (cur.fetchone()[0] or 0) + 1

            cur.execute(
                "INSERT INTO estimates (company_id, object_id, total_amount, subtotal_amount, contract_number, contract_date, discount_percent, discount_amount, notes, revision_number, created_by, apply_signature, apply_stamp, estimate_number) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, created_at",
                (company_id, obj_id, total, subtotal, contract_number, contract_date, discount_percent, discount_amount, notes, next_revision, user['user_id'], apply_signature, apply_stamp, estimate_number)
            )
            new_id, created_at = cur.fetchone()

            for it in clean_items:
                cur.execute(
                    "INSERT INTO estimate_items (estimate_id, service_id, name, unit, price, quantity, times, discount_percent, amount, status, room_id, room_name, category, subcategory) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'approved', %s, %s, %s, %s)",
                    (new_id, it['service_id'], it['name'], it['unit'], it['price'], it['quantity'], it['times'], it['discount_percent'], it['amount'], it['room_id'], it['room_name'], it['category'], it['subcategory'])
                )

            cur.execute(
                "INSERT INTO estimate_items (estimate_id, service_id, name, unit, price, quantity, times, discount_percent, amount, status, proposed_by, room_id, room_name, category, subcategory) "
                "SELECT %s, service_id, name, unit, price, quantity, times, discount_percent, amount, status, proposed_by, room_id, room_name, category, subcategory "
                "FROM estimate_items WHERE estimate_id = %s AND status IN ('pending', 'rejected')",
                (new_id, estimate_id)
            )

            conn.commit()

            return response(200, {
                'id': new_id, 'object_id': obj_id, 'total_amount': total, 'subtotal_amount': subtotal,
                'contract_number': contract_number, 'contract_date': contract_date,
                'discount_percent': discount_percent, 'discount_amount': discount_amount, 'notes': notes,
                'created_at': created_at, 'items': clean_items, 'revision_number': next_revision, 'status': 'ready'
            })

        if method == 'DELETE':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not estimate_id:
                return response(400, {'error': 'Не указан id сметы'})
            cur.execute("DELETE FROM estimate_items WHERE estimate_id = %s", (estimate_id,))
            cur.execute("DELETE FROM estimates WHERE id = %s AND company_id = %s", (estimate_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()