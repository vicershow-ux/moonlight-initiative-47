import json
import os
import re
import html as html_lib
from datetime import date

import psycopg2
from mailer import send_document_email
import yookassa


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
    'purpose', 'items', 'vat_mode', 'total_amount', 'apply_signature', 'apply_stamp', 'notes', 'payment_note',
    'status', 'created_at', 'updated_at', 'paid_at', 'paid_online',
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


def fmt_rub(n):
    return f"{float(n or 0):,.0f}".replace(',', ' ') + ' ₽'


def send_thanks(cur, company_id, inv_id):
    '''Письмо-благодарность заказчику за оплату счёта. Возвращает (ok, причина)'''
    cur.execute(
        "SELECT i.invoice_number, i.total_amount, i.thanks_sent_at, o.client_name, o.email, o.address "
        "FROM invoices i JOIN objects o ON o.id = i.object_id WHERE i.id = %s AND i.company_id = %s",
        (inv_id, company_id)
    )
    row = cur.fetchone()
    if not row:
        return False, 'not_found'
    number, total, sent_at, client_name, email, address = row
    if sent_at:
        return False, 'already_sent'
    email = (email or '').strip()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        return False, 'no_email'
    cur.execute("SELECT name, phone, email, website FROM companies WHERE id = %s", (company_id,))
    comp = cur.fetchone() or ('', '', '', '')
    brand = comp[0] or 'FixKey'
    contacts = ' · '.join(x for x in comp[1:] if x)
    e = html_lib.escape
    greet = f'Здравствуйте, {client_name}!' if client_name else 'Здравствуйте!'
    addr_line = f' по объекту: {address}' if address else ''
    html_body = f'''<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#161616">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#5C3A11;padding:18px 24px;color:#fff;font-size:18px;font-weight:bold">{e(brand)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{e(greet)}</p>
<p style="margin:0 0 14px">Благодарим вас за оплату! Мы получили оплату по счёту № {e(str(number))}{e(addr_line)}.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 16px;background:#f7f2e8;border-radius:8px"><tr>
<td style="padding:14px 16px;font-size:14px;color:#5C3A11">Сумма оплаты</td>
<td style="padding:14px 16px;font-size:18px;font-weight:bold;text-align:right;color:#161616">{e(fmt_rub(total))}</td>
</tr></table>
<p style="margin:0 0 14px">Ценим ваше доверие и продолжаем работы по вашему объекту. Если появятся вопросы — просто ответьте на это письмо.</p>
<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777">С уважением, {e(brand)}{('<br/>' + e(contacts)) if contacts else ''}</p>
</td></tr></table></body></html>'''
    text_body = f"{greet}\n\nБлагодарим вас за оплату! Мы получили оплату по счёту № {number}{addr_line} на сумму {fmt_rub(total)}.\n\nЕсли появятся вопросы — просто ответьте на это письмо.\n\nС уважением, {brand}\n{contacts}"
    ok, err = send_document_email(email, f'Спасибо за оплату счёта № {number}', html_body, text_body, '', '', brand, comp[2] or '')
    if not ok:
        print(f'thanks email failed for invoice {inv_id}: {err}')
        return False, 'send_failed'
    cur.execute("UPDATE invoices SET thanks_sent_at = NOW() WHERE id = %s", (inv_id,))
    return True, email


def apply_to_schedule(cur, company_id, object_id, amount):
    '''Разносит оплату по ближайшим неоплаченным этапам графика платежей'''
    left = float(amount or 0)
    cur.execute(
        "SELECT id, amount, paid_amount FROM object_payments WHERE object_id = %s AND company_id = %s "
        "AND paid_amount < amount ORDER BY sort_order, id",
        (object_id, company_id)
    )
    for pid, amt, paid in cur.fetchall():
        if left <= 0:
            break
        add = min(left, float(amt) - float(paid))
        cur.execute(
            "UPDATE object_payments SET paid_amount = paid_amount + %s, paid_at = CURRENT_DATE WHERE id = %s",
            (round(add, 2), pid)
        )
        left -= add


def mark_paid_online(cur, conn, company_id, inv_id, payment_row_id, amount):
    '''Отмечает счёт оплаченным по подтверждению ЮKassa (один раз)'''
    cur.execute("UPDATE invoice_payments SET status = 'succeeded', paid_at = NOW(), applied = TRUE WHERE id = %s AND applied = FALSE RETURNING id", (payment_row_id,))
    if not cur.fetchone():
        conn.commit()
        return False
    cur.execute(
        "UPDATE invoices SET status = 'paid', paid_at = NOW(), paid_online = TRUE, updated_at = NOW() "
        "WHERE id = %s AND status <> 'paid' RETURNING object_id, invoice_number",
        (inv_id,)
    )
    row = cur.fetchone()
    if row:
        object_id, number = row
        apply_to_schedule(cur, company_id, object_id, amount)
        cur.execute("SELECT object_code, client_name FROM objects WHERE id = %s", (object_id,))
        code, client = cur.fetchone() or ('', '')
        cur.execute(
            "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
            (company_id, 'invoice_paid', 'Заказчик оплатил счёт онлайн',
             f'{client} оплатил счёт № {number} на {fmt_rub(amount)} по объекту {code} через ЮKassa',
             json.dumps({'object_id': object_id, 'invoice_id': int(inv_id)}))
        )
        conn.commit()
        send_thanks(cur, company_id, inv_id)
    conn.commit()
    return True


def sync_payment(cur, conn, pay_row):
    '''Сверяет статус платежа с ЮKassa и применяет оплату'''
    row_id, company_id, inv_id, provider_id, amount = pay_row
    settings = yookassa.load_settings(cur, company_id)
    if not settings.get('shop_id'):
        return 'unknown'
    data, err = yookassa.get_payment(settings, provider_id)
    if err or not data:
        return 'unknown'
    status = data.get('status') or 'pending'
    paid_value = float((data.get('amount') or {}).get('value') or 0)
    if status == 'succeeded' and data.get('paid') and abs(paid_value - float(amount)) < 0.01:
        mark_paid_online(cur, conn, company_id, inv_id, row_id, amount)
        return 'succeeded'
    if status == 'canceled':
        cur.execute("UPDATE invoice_payments SET status = 'canceled' WHERE id = %s AND applied = FALSE", (row_id,))
        conn.commit()
    return status


def pay_settings(cur, conn, user, method, body, params):
    '''Раздел «Финансы → ЮKassa»: чтение, сохранение и проверка подключения'''
    company_id = user['company_id']
    s = yookassa.load_settings(cur, company_id)

    def view(extra=None):
        cur.execute("SELECT 1 FROM company_payment_settings WHERE company_id = %s", (company_id,))
        out = {k: v for k, v in s.items() if k != 'secret_key'}
        out['secret_key_masked'] = yookassa.mask(s.get('secret_key'))
        out['has_secret'] = bool(s.get('secret_key'))
        out['from_env'] = not cur.fetchone() and bool(s.get('secret_key'))
        cur.execute(
            "SELECT p.amount, p.status, p.created_at, p.paid_at, p.receipt_sent, i.invoice_number, o.object_code "
            "FROM invoice_payments p JOIN invoices i ON i.id = p.invoice_id JOIN objects o ON o.id = i.object_id "
            "WHERE p.company_id = %s ORDER BY p.id DESC LIMIT 20",
            (company_id,)
        )
        keys = ['amount', 'status', 'created_at', 'paid_at', 'receipt_sent', 'invoice_number', 'object_code']
        out['recent'] = [dict(zip(keys, r)) for r in cur.fetchall()]
        if extra:
            out.update(extra)
        return response(200, out)

    if method == 'GET':
        return view()

    if method == 'POST' and params.get('check') == '1':
        if not s.get('shop_id') or not s.get('secret_key'):
            return response(400, {'error': 'Сначала укажите shopId и секретный ключ'})
        ok, err, info = yookassa.check_credentials(s)
        if not ok:
            return response(200, {'check': {'ok': False, 'error': err}})
        fiscal = bool((info or {}).get('fiscalization_enabled') or (info or {}).get('fiscalization', {}).get('enabled'))
        return response(200, {'check': {'ok': True, 'test': bool((info or {}).get('test')), 'fiscalization': fiscal,
                                        'account_id': (info or {}).get('account_id', '')}})

    if method == 'PUT':
        shop_id = str(body.get('shop_id') if body.get('shop_id') is not None else s['shop_id']).strip()[:50]
        if shop_id and not shop_id.isdigit():
            return response(400, {'error': 'shopId состоит только из цифр'})
        secret = str(body.get('secret_key') or '').strip()
        if secret and not re.match(r'^(live|test)_[A-Za-z0-9_\-]{10,}$', secret):
            return response(400, {'error': 'Секретный ключ должен начинаться с live_ или test_'})
        secret = secret or s.get('secret_key') or ''
        tax = int(body.get('tax_system_code', s['tax_system_code']) or 0)
        vat = int(body.get('default_vat_code', s['default_vat_code']) or 1)
        subject = str(body.get('payment_subject') or s['payment_subject'])
        mode = str(body.get('payment_mode') or s['payment_mode'])
        if tax not in yookassa.TAX_SYSTEMS or vat not in yookassa.VAT_CODES or subject not in yookassa.SUBJECTS or mode not in yookassa.MODES:
            return response(400, {'error': 'Проверьте параметры чека'})
        enabled = bool(body.get('enabled', s['enabled']))
        receipts = bool(body.get('receipts_enabled', s['receipts_enabled']))
        if enabled and (not shop_id or not secret):
            return response(400, {'error': 'Для включения оплаты укажите shopId и секретный ключ'})
        cur.execute(
            "INSERT INTO company_payment_settings (company_id, enabled, shop_id, secret_key, receipts_enabled, tax_system_code, "
            "default_vat_code, use_invoice_vat, payment_subject, payment_mode, updated_at, updated_by) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), %s) ON CONFLICT (company_id) DO UPDATE SET "
            "enabled = EXCLUDED.enabled, shop_id = EXCLUDED.shop_id, secret_key = EXCLUDED.secret_key, "
            "receipts_enabled = EXCLUDED.receipts_enabled, tax_system_code = EXCLUDED.tax_system_code, "
            "default_vat_code = EXCLUDED.default_vat_code, use_invoice_vat = EXCLUDED.use_invoice_vat, "
            "payment_subject = EXCLUDED.payment_subject, payment_mode = EXCLUDED.payment_mode, updated_at = NOW(), updated_by = EXCLUDED.updated_by",
            (company_id, enabled, shop_id, secret, receipts, tax, vat, bool(body.get('use_invoice_vat', s['use_invoice_vat'])),
             subject, mode, user['user_id'])
        )
        conn.commit()
        s = yookassa.load_settings(cur, company_id)
        return view({'saved': True})

    return response(405, {'error': 'Метод не поддерживается'})



def handle_webhook(event):
    '''Уведомление ЮKassa: статус перепроверяется запросом в API, телу запроса не доверяем'''
    try:
        body = json.loads(event.get('body') or '{}')
    except ValueError:
        return response(200, {'ok': True})
    obj = body.get('object') or {}
    pid = str(obj.get('id') or '')[:100]
    if not pid:
        return response(200, {'ok': True})
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, company_id, invoice_id, provider_payment_id, amount FROM invoice_payments "
            "WHERE provider = 'yookassa' AND provider_payment_id = %s",
            (pid,)
        )
        row = cur.fetchone()
        if row:
            print(f'yookassa webhook {pid}: {sync_payment(cur, conn, row)}')
        return response(200, {'ok': True})
    finally:
        cur.close()
        conn.close()


def handler(event: dict, context) -> dict:
    '''Счета на оплату по договору или акту: создание, редактирование, просмотр и отправка заказчику на почту'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}
    if method == 'POST' and (event.get('queryStringParameters') or {}).get('action') == 'yookassa_webhook':
        return handle_webhook(event)

    conn = get_conn()
    cur = conn.cursor()
    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        is_client = user['role'] == 'client'
        company_id = user['company_id']
        client_filter = ''
        client_args = []
        if is_client:
            client_filter = " AND i.object_id IN (SELECT object_id FROM object_access WHERE user_id = %s)"
            client_args = [user['user_id']]
        params = event.get('queryStringParameters') or {}
        inv_id = params.get('id')
        action = params.get('action')

        if method == 'GET' and action == 'pay_config':
            return response(200, {'online': yookassa.configured(yookassa.load_settings(cur, company_id))})

        if action == 'pay_settings':
            if user['role'] not in ('owner', 'admin'):
                return response(403, {'error': 'Настройки кассы доступны руководителю'})
            return pay_settings(cur, conn, user, method, json.loads(event.get('body') or '{}') if method in ('PUT', 'POST') else {}, params)

        if method == 'POST' and action == 'pay':
            settings = yookassa.load_settings(cur, company_id)
            if not yookassa.configured(settings):
                return response(400, {'error': 'Онлайн-оплата пока не подключена подрядчиком'})
            body = json.loads(event.get('body') or '{}')
            cur.execute(
                "SELECT i.id, i.invoice_number, i.total_amount, i.status, o.email, o.object_code, i.items, i.vat_mode "
                "FROM invoices i JOIN objects o ON o.id = i.object_id WHERE i.id = %s AND i.company_id = %s" + client_filter,
                (inv_id, company_id, *client_args)
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Счёт не найден'})
            _, number, total, status, email, code, inv_items, vat_mode = row
            if status == 'paid':
                return response(400, {'error': 'Счёт уже оплачен'})
            amount = round(float(total or 0), 2)
            m = re.match(r'^on_top(?:_(\d+))?$', vat_mode or '')
            if m:
                amount = round(amount * (1 + int(m.group(1) or 20) / 100), 2)
            if amount <= 0:
                return response(400, {'error': 'В счёте нет суммы к оплате'})
            return_url = str(body.get('return_url') or '')
            if not return_url.startswith('https://'):
                return response(400, {'error': 'Некорректный адрес возврата'})
            cur.execute(
                "SELECT confirmation_url FROM invoice_payments WHERE invoice_id = %s AND status = 'pending' "
                "AND amount = %s AND receipt_sent = %s AND created_at > NOW() - INTERVAL '50 minutes' ORDER BY id DESC LIMIT 1",
                (inv_id, amount, bool(settings.get('receipts_enabled')))
            )
            fresh = cur.fetchone()
            if fresh and fresh[0]:
                return response(200, {'confirmation_url': fresh[0]})
            receipt = None
            receipt_email = ''
            if settings.get('receipts_enabled'):
                receipt_email = str(body.get('receipt_email') or email or '').strip()[:255]
                if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', receipt_email):
                    return response(400, {'error': 'Укажите почту для электронного чека', 'need_email': True})
                receipt = yookassa.build_receipt(settings, receipt_email, inv_items if isinstance(inv_items, list) else json.loads(inv_items or '[]'), vat_mode, amount)
            data, err = yookassa.create_payment(
                settings, amount, f'Оплата счёта № {number} по объекту {code}', return_url,
                {'invoice_id': str(inv_id), 'company_id': str(company_id)}, receipt
            )
            if err or not data:
                print(f'yookassa create failed: {err}')
                return response(502, {'error': f'Не удалось создать платёж: {err}'})
            url = ((data.get('confirmation') or {}).get('confirmation_url')) or ''
            cur.execute(
                "INSERT INTO invoice_payments (company_id, invoice_id, user_id, provider_payment_id, amount, status, confirmation_url, receipt_email, receipt_sent) "
                "VALUES (%s, %s, %s, %s, %s, 'pending', %s, %s, %s) ON CONFLICT DO NOTHING",
                (company_id, inv_id, user['user_id'], data['id'], amount, url, receipt_email, bool(receipt))
            )
            conn.commit()
            return response(200, {'confirmation_url': url})

        if method == 'POST' and action == 'pay_check':
            cur.execute(
                "SELECT p.id, p.company_id, p.invoice_id, p.provider_payment_id, p.amount FROM invoice_payments p "
                "JOIN invoices i ON i.id = p.invoice_id WHERE p.invoice_id = %s AND p.company_id = %s AND p.applied = FALSE "
                "AND p.status = 'pending'" + client_filter + " ORDER BY p.id DESC LIMIT 3",
                (inv_id, company_id, *client_args)
            )
            result = 'pending'
            for row in cur.fetchall():
                st = sync_payment(cur, conn, row)
                if st == 'succeeded':
                    result = 'succeeded'
                    break
                result = st
            cur.execute("SELECT status FROM invoices WHERE id = %s AND company_id = %s", (inv_id, company_id))
            inv = cur.fetchone()
            return response(200, {'payment': result, 'invoice_status': inv[0] if inv else ''})

        if is_client and method != 'GET':
            return response(403, {'error': 'Недостаточно прав'})

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
                "purpose, items, vat_mode, total_amount, apply_signature, apply_stamp, notes, payment_note, created_by) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    company_id, object_id, body.get('contract_id') or None, body.get('act_id') or None, number,
                    body.get('invoice_date') or date.today().isoformat(), body.get('due_date') or None,
                    str(body.get('purpose') or '')[:500], json.dumps(items, ensure_ascii=False),
                    body.get('vat_mode') or 'none', total, bool(body.get('apply_signature')),
                    bool(body.get('apply_stamp')), str(body.get('notes') or '')[:2000],
                    (str(body['payment_note'])[:500] if body.get('payment_note') is not None else None), user['user_id'],
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
            for key in ('invoice_number', 'invoice_date', 'due_date', 'purpose', 'vat_mode', 'notes', 'payment_note', 'status'):
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
            cur.execute("SELECT status FROM invoices WHERE id = %s", (inv_id,))
            prev_status = cur.fetchone()[0]
            new_status = body.get('status')
            if new_status == 'paid' and prev_status != 'paid':
                fields.append('paid_at = NOW()')
            elif 'status' in body and new_status != 'paid':
                fields.append('paid_at = NULL')
            if fields:
                fields.append('updated_at = NOW()')
                cur.execute(f"UPDATE invoices SET {', '.join(fields)} WHERE id = %s", (*values, inv_id))
                conn.commit()
            result = {'success': True}
            if new_status == 'paid' and prev_status != 'paid':
                cur.execute("SELECT object_id, total_amount FROM invoices WHERE id = %s", (inv_id,))
                ob = cur.fetchone()
                if ob:
                    apply_to_schedule(cur, company_id, ob[0], ob[1])
                    conn.commit()
                ok, info = send_thanks(cur, company_id, inv_id)
                conn.commit()
                result['thanks'] = {'sent': ok, 'email': info if ok else '', 'reason': '' if ok else info}
            return response(200, result)

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
