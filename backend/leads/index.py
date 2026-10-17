import json
import os
import re
import smtplib
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr

import psycopg2
from html import escape

LEADS_COMPANY_ID = 2


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def normalize_phone(raw):
    digits = re.sub(r'\D', '', raw or '')
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    if len(digits) == 10 and digits.startswith('9'):
        digits = '7' + digits
    if len(digits) != 11 or not digits.startswith('7'):
        return ''
    return f'+7 ({digits[1:4]}) {digits[4:7]}-{digits[7:9]}-{digits[9:11]}'


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
        'Access-Control-Max-Age': '86400'
    }


def response(status: int, body):
    return {
        'statusCode': status,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(body, default=str)
    }


def money(v):
    return f"{v:,.2f}".replace(',', ' ').replace('.', ',')


def clean_works(cur, raw):
    '''Сверяет выбранные работы с прайсом компании, цены берёт из базы'''
    out = []
    for it in (raw or [])[:200]:
        if not isinstance(it, dict):
            continue
        name = str(it.get('name') or '').strip()[:500]
        category = str(it.get('category') or '').strip()[:200]
        try:
            qty = round(float(it.get('quantity') or 0), 2)
        except (TypeError, ValueError):
            qty = 0
        if not name or qty <= 0 or qty > 1000000:
            continue
        cur.execute(
            "SELECT unit, price, id, subcategory FROM services WHERE company_id = %s AND is_active = true AND name = %s AND category = %s LIMIT 1",
            (LEADS_COMPANY_ID, name, category)
        )
        row = cur.fetchone()
        if not row:
            continue
        price = float(row[1] or 0)
        out.append({'name': name, 'category': category, 'unit': row[0] or '', 'quantity': qty,
                    'price': price, 'amount': round(qty * price, 2), 'service_id': row[2], 'subcategory': row[3] or ''})
    return out


def works_text(works):
    if not works:
        return ''
    lines = [f"{i}. {w['name']} — {w['quantity']:g} {w['unit']} × {money(w['price'])} = {money(w['amount'])} ₽"
             for i, w in enumerate(works, 1)]
    total = sum(w['amount'] for w in works)
    return 'Выбранные работы:\n' + '\n'.join(lines) + f"\nИтого ориентировочно: {money(total)} ₽"


def works_html(works):
    if not works:
        return ''
    rows = ''.join(
        f'<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;">{escape(w["name"])}</td>'
        f'<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;text-align:right;">{w["quantity"]:g} {escape(w["unit"])}</td>'
        f'<td style="padding:6px 8px;border-bottom:1px solid #eee;white-space:nowrap;text-align:right;">{money(w["amount"])} ₽</td></tr>'
        for w in works
    )
    total = sum(w['amount'] for w in works)
    return (
        '<p style="margin:24px 0 8px;font-weight:bold;">Выбранные работы</p>'
        '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#161616;">'
        f'{rows}<tr><td colspan="2" style="padding:8px;font-weight:bold;">Итого ориентировочно</td>'
        f'<td style="padding:8px;font-weight:bold;text-align:right;white-space:nowrap;">{money(total)} ₽</td></tr></table>'
    )


def smtp_config():
    host = os.environ.get('SMTP_HOST', '').strip()
    host = host.replace('https://', '').replace('http://', '').replace('smtps://', '')
    host = host.strip().strip('/').split('/')[0]
    if ':' in host:
        host = host.split(':')[0]
    user = os.environ.get('SMTP_USER', '').strip().strip('<>').replace(' ', '')
    password = os.environ.get('SMTP_PASSWORD', '').strip()
    return host, user, password


def deliver(msgs, host, user, password):
    '''Отправляет одно или несколько писем за одно подключение к почтовому серверу'''
    errors = []

    try:
        with smtplib.SMTP_SSL(host, 465, timeout=5) as server:
            server.login(user, password)
            for m in msgs:
                server.send_message(m)
        return True, 'порт 465 (SSL)'
    except Exception as err:
        errors.append(f'465/SSL: {err}')

    for port in (587, 25):
        try:
            with smtplib.SMTP(host, port, timeout=5) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(user, password)
                for m in msgs:
                    server.send_message(m)
            return True, f'порт {port} (STARTTLS)'
        except Exception as err:
            errors.append(f'{port}/TLS: {err}')

    joined = ' | '.join(errors)
    if 'authentication' in joined.lower() or '535' in joined or '534' in joined:
        return False, 'Почтовый сервер отклонил пароль. Проверьте пароль от ящика-отправителя.'
    low = joined.lower()
    if 'not resolve' in low or 'name or service not known' in low or 'getaddrinfo' in low:
        return False, (
            f'Не найден почтовый сервер «{host}». '
            'Проверьте адрес в настройках: для Majordomo это smtp.majordomo.ru '
            '(без «https://», без пробелов и лишних символов).'
        )
    if 'timed out' in low or 'timeout' in low:
        return False, f'Почтовый сервер «{host}» не отвечает. Проверьте его адрес.'
    return False, joined


def send_lead_email(to_email, brand, client_name, client_phone, comment, object_code, client_email='', works=None, extra=None):
    host, user, password = smtp_config()

    missing = []
    if not host:
        missing.append('адрес почтового сервера (SMTP_HOST)')
    if not user:
        missing.append('адрес ящика-отправителя (SMTP_USER)')
    if not password:
        missing.append('пароль от ящика (SMTP_PASSWORD)')
    if missing:
        return False, (
            'Почта не настроена. В настройках проекта не заполнено: '
            + ', '.join(missing)
        )
    if not to_email:
        if extra:
            deliver(extra, host, user, password)
        return False, 'Не указана почта получателя — заполните поле «Почта для новых заявок»'

    moscow_time = datetime.utcnow().timestamp() + 3 * 3600
    created = datetime.utcfromtimestamp(moscow_time).strftime('%d.%m.%Y в %H:%M')
    phone_digits = ''.join(ch for ch in client_phone if ch.isdigit() or ch == '+')

    text_body = (
        f"Новая заявка с сайта {brand}\n\n"
        f"Имя: {client_name}\n"
        f"Телефон: {client_phone}\n"
        f"Email: {client_email or '—'}\n"
        f"Комментарий: {comment or '—'}\n\n"
        + (works_text(works) + "\n\n" if works else '') +
        f""
        f"Номер объекта: {object_code}\n"
        f"Получена: {created} (МСК)\n\n"
        f"Заявка уже создана в кабинете в разделе «Объекты»."
    )

    email_row = (
        f'<tr><td style="padding:8px 0;color:#888;">Email</td>'
        f'<td style="padding:8px 0;"><a href="mailto:{client_email}" style="color:#B8860B;text-decoration:none;">{client_email}</a></td></tr>'
        if client_email else ''
    )

    html_body = f"""<!DOCTYPE html>
<html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#161616;padding:20px 28px;">
      <span style="color:#ffffff;font-size:18px;font-weight:bold;">Новая заявка с сайта</span>
    </td></tr>
    <tr><td style="padding:28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:#161616;">
        <tr><td style="padding:8px 0;color:#888;width:120px;">Имя</td><td style="padding:8px 0;font-weight:bold;">{client_name}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Телефон</td><td style="padding:8px 0;font-weight:bold;"><a href="tel:{phone_digits}" style="color:#B8860B;text-decoration:none;">{client_phone}</a></td></tr>
        {email_row}
        <tr><td style="padding:8px 0;color:#888;">Комментарий</td><td style="padding:8px 0;">{comment or '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Объект</td><td style="padding:8px 0;">{object_code}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Получена</td><td style="padding:8px 0;">{created} (МСК)</td></tr>
      </table>
      {works_html(works)}
      <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #eee;font-size:13px;color:#999;">
        Заявка автоматически создана в кабинете в разделе «Объекты» со статусом «лид».
      </p>
    </td></tr>
  </table>
</body></html>"""

    msg = EmailMessage()
    msg['Subject'] = f'Заявка с сайта: {client_name}, {client_phone}'
    msg['From'] = formataddr((f'Сайт {brand}', user))
    msg['To'] = to_email
    msg['Reply-To'] = to_email
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype='html')

    return deliver([msg] + list(extra or []), host, user, password)


def build_client_copy(to_email, client_name, comment, object_code, works, company):
    '''Копия заявки клиенту: что выбрал и ориентировочная сумма'''
    host, user, password = smtp_config()
    if not host or not user or not password:
        return None
    brand = company['brand']
    phone = company['phone']
    reply_to = company['email'] or user
    total = sum(w['amount'] for w in works) if works else 0
    phone_digits = ''.join(ch for ch in phone if ch.isdigit() or ch == '+')

    text_parts = [
        f"Здравствуйте, {client_name}!",
        f"Спасибо за заявку в {brand}. Мы получили её и свяжемся с вами в ближайшее время, чтобы согласовать бесплатный замер.",
        f"Номер заявки: {object_code}",
    ]
    if works:
        text_parts.append(works_text(works))
        text_parts.append("Сумма ориентировочная: указана стоимость работ без материалов. "
                          "Точную стоимость зафиксируем в смете после замера.")
    if comment:
        text_parts.append(f"Ваш комментарий: {comment}")
    if phone:
        text_parts.append(f"Если захотите что-то уточнить — звоните: {phone} или просто ответьте на это письмо.")
    text_parts.append(f"С уважением, команда {brand}")
    text_body = "\n\n".join(text_parts)

    works_block = ''
    if works:
        works_block = works_html(works) + (
            '<p style="margin:12px 0 0;font-size:13px;color:#888;line-height:1.5;">'
            'Сумма ориентировочная: указана стоимость работ без материалов. '
            'Точную стоимость зафиксируем в смете после бесплатного замера.</p>'
        )
    comment_block = (
        f'<p style="margin:20px 0 0;font-size:14px;"><span style="color:#888;">Ваш комментарий:</span> {escape(comment)}</p>'
        if comment else ''
    )
    phone_block = (
        f'<p style="margin:24px 0 0;font-size:14px;line-height:1.6;">Если захотите что-то уточнить — звоните '
        f'<a href="tel:{phone_digits}" style="color:#B8860B;text-decoration:none;font-weight:bold;">{escape(phone)}</a> '
        'или просто ответьте на это письмо.</p>'
        if phone else ''
    )
    total_line = (
        f'<p style="margin:16px 0 0;font-size:15px;">Ориентировочная стоимость работ: '
        f'<b style="font-size:18px;">{money(total)} ₽</b></p>' if works else ''
    )

    html_body = f"""<!DOCTYPE html>
<html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#161616;padding:20px 28px;">
      <span style="color:#D4AF37;font-size:18px;font-weight:bold;">{escape(brand)}</span>
      <span style="color:#ffffff;font-size:15px;"> · Ваша заявка принята</span>
    </td></tr>
    <tr><td style="padding:28px;color:#161616;font-size:15px;line-height:1.6;">
      <p style="margin:0 0 12px;">Здравствуйте, {escape(client_name)}!</p>
      <p style="margin:0;">Спасибо за заявку. Мы получили её и свяжемся с вами в ближайшее время, чтобы согласовать бесплатный замер.</p>
      <p style="margin:16px 0 0;color:#888;font-size:13px;">Номер заявки: <b style="color:#161616;">{escape(object_code)}</b></p>
      {total_line}
      {works_block}
      {comment_block}
      {phone_block}
      <p style="margin:28px 0 0;padding-top:20px;border-top:1px solid #eee;font-size:13px;color:#999;">
        С уважением, команда {escape(brand)}
      </p>
    </td></tr>
  </table>
</body></html>"""

    msg = EmailMessage()
    msg['Subject'] = f'{brand}: ваша заявка № {object_code} принята'
    msg['From'] = formataddr((brand, user))
    msg['To'] = to_email
    msg['Reply-To'] = reply_to
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype='html')
    return msg


def handle_test_email(event):
    '''Проверка настроек почты — отправляет пробное письмо, доступна владельцу кабинета'''
    headers = event.get('headers') or {}
    token = (headers.get('X-Authorization') or headers.get('x-authorization') or '').replace('Bearer ', '')
    if not token:
        return response(401, {'error': 'Не авторизован'})

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT u.role, u.position, u.extra_positions FROM sessions s JOIN users u ON u.id = s.user_id "
            "WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE",
            (token,)
        )
        row = cur.fetchone()
        if not row:
            return response(401, {'error': 'Сессия истекла, войдите заново'})
        if row[0] != 'owner' and row[1] != 'super_admin' and 'super_admin' not in (row[2] or '').split(','):
            return response(403, {'error': 'Доступно только владельцу'})

        cur.execute(
            "SELECT COALESCE(NULLIF(lead_notify_email, ''), email), COALESCE(brand_name, 'FixKey') "
            "FROM site_settings WHERE company_id = %s",
            (LEADS_COMPANY_ID,)
        )
        srow = cur.fetchone()
        to_email = (srow[0] or '').strip() if srow else ''
        brand = srow[1] if srow else 'FixKey'
    finally:
        cur.close()
        conn.close()

    sent, note = send_lead_email(
        to_email, brand,
        'Проверка настроек', '+7 000 000-00-00',
        'Это пробное письмо. Если оно пришло — заявки с сайта будут дублироваться на эту почту.',
        'ПРОВЕРКА'
    )

    if sent:
        return response(200, {'success': True, 'email': to_email, 'detail': note})
    return response(200, {'success': False, 'email': to_email, 'detail': note})


def handler(event: dict, context) -> dict:
    '''Публичная форма заявки с лендинга FixKey — создаёт объект-лид и уведомление в CRM компании'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    if method != 'POST':
        return response(405, {'error': 'Метод не поддерживается'})

    body = json.loads(event.get('body') or '{}')

    if body.get('action') == 'test_email':
        return handle_test_email(event)

    client_name = (body.get('client_name') or '').strip()
    client_phone = normalize_phone(body.get('client_phone') or '')
    client_email = (body.get('email') or '').strip()
    comment = (body.get('comment') or '').strip()[:2000]

    if len(client_name) < 2:
        return response(400, {'error': 'Введите имя'})
    if not client_phone:
        return response(400, {'error': 'Введите корректный номер телефона'})
    if client_email and not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]{2,}$', client_email):
        return response(400, {'error': 'Проверьте адрес электронной почты'})

    conn = get_conn()
    cur = conn.cursor()

    try:
        works = clean_works(cur, body.get('works'))
        lead_request = works_text(works)
        year = datetime.utcnow().strftime('%y')
        cur.execute("SELECT COUNT(*) FROM objects WHERE company_id = %s", (LEADS_COMPANY_ID,))
        seq = cur.fetchone()[0] + 1
        object_code = f"{LEADS_COMPANY_ID:03d}-20{year}-{seq:04d}"

        cur.execute(
            "INSERT INTO objects (company_id, object_code, client_name, client_phone, email, object_type, area, status, lead_request, lead_works) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (LEADS_COMPANY_ID, object_code, client_name, client_phone, client_email, 'Заявка с сайта', 0, 'лид',
             '\n\n'.join(x for x in [f'Комментарий: {comment}' if comment and works else '', lead_request] if x),
             json.dumps(works, ensure_ascii=False) if works else '')
        )
        new_id = cur.fetchone()[0]

        message = f"{client_name}, {client_phone}"
        if client_email:
            message += f", {client_email}"
        if comment:
            message += f" — {comment}"
        if works:
            message += f" · выбрано работ: {len(works)} на {money(sum(w['amount'] for w in works))} ₽"

        cur.execute(
            "INSERT INTO notifications (company_id, type, title, message, payload) "
            "VALUES (%s, %s, %s, %s, %s)",
            (LEADS_COMPANY_ID, 'lead', 'Новая заявка с сайта', message,
             json.dumps({'object_id': new_id, 'object_code': object_code, 'works': len(works)}))
        )

        conn.commit()

        cur.execute(
            "SELECT COALESCE(NULLIF(lead_notify_email, ''), email), COALESCE(brand_name, 'FixKey'), "
            "COALESCE(phone, ''), COALESCE(email, '') "
            "FROM site_settings WHERE company_id = %s",
            (LEADS_COMPANY_ID,)
        )
        row = cur.fetchone()
        notify_email = (row[0] or '').strip() if row else ''
        brand = row[1] if row else 'FixKey'
        company = {'brand': brand, 'phone': (row[2] if row else '').strip(), 'email': (row[3] if row else '').strip()}
    finally:
        cur.close()
        conn.close()

    client_copy = build_client_copy(client_email, client_name, comment, object_code, works, company) if client_email else None
    email_sent, email_note = send_lead_email(
        notify_email, brand, client_name, client_phone, comment, object_code, client_email, works,
        [client_copy] if client_copy else None
    )
    if email_sent:
        print(f'Lead email OK ({object_code}) -> {notify_email}')
    else:
        print(f'Lead email FAILED ({object_code}) -> {notify_email or "получатель не задан"}: {email_note}')

    if client_copy:
        print(f'Client copy queued ({object_code}) -> {client_email}')

    return response(200, {'success': True, 'object_code': object_code})