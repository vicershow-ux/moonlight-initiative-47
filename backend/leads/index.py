import json
import os
import re
import smtplib
import urllib.parse
import urllib.request
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr

import psycopg2

LEADS_COMPANY_ID = 2


def escape_html(text):
    return (str(text or '')
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;'))


def send_telegram(text):
    '''Отправляет сообщение в Telegram. Молча пропускает, если не настроен.'''
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '').strip()
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '').strip()
    if not token or not chat_id:
        return False, 'Telegram не настроен'

    payload = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
        'disable_web_page_preview': 'true',
    }).encode()

    url = f'https://api.telegram.org/bot{token}/sendMessage'
    try:
        req = urllib.request.Request(url, data=payload)
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
        if data.get('ok'):
            return True, 'отправлено'
        return False, str(data.get('description') or 'неизвестная ошибка')
    except Exception as err:
        return False, str(err)


def build_lead_message(brand, client_name, client_phone, comment, object_code, client_email=''):
    moscow = datetime.utcfromtimestamp(datetime.utcnow().timestamp() + 3 * 3600)
    created = moscow.strftime('%d.%m.%Y в %H:%M')
    digits = ''.join(ch for ch in client_phone if ch.isdigit())
    lines = [
        f'<b>Новая заявка с сайта {escape_html(brand)}</b>',
        '',
        f'Имя: <b>{escape_html(client_name)}</b>',
        f'Телефон: <a href="tel:+{digits}">{escape_html(client_phone)}</a>',
    ]
    if client_email:
        lines.append(f'Почта: {escape_html(client_email)}')
    if comment:
        lines.append(f'Комментарий: {escape_html(comment)}')
    lines += [
        '',
        f'Объект: {escape_html(object_code)}',
        f'Получена: {created} (МСК)',
        '',
        '<i>Заявка уже в кабинете, раздел «Объекты».</i>',
    ]
    return '\n'.join(lines)


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


def send_lead_email(to_email, brand, client_name, client_phone, comment, object_code, client_email=''):
    host = os.environ.get('SMTP_HOST', '').strip()
    host = host.replace('https://', '').replace('http://', '').replace('smtps://', '')
    host = host.strip().strip('/').split('/')[0]
    if ':' in host:
        host = host.split(':')[0]
    user = os.environ.get('SMTP_USER', '').strip().strip('<>').replace(' ', '')
    password = os.environ.get('SMTP_PASSWORD', '').strip()

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

    errors = []

    try:
        with smtplib.SMTP_SSL(host, 465, timeout=5) as server:
            server.login(user, password)
            server.send_message(msg)
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
                server.send_message(msg)
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
            "SELECT u.role, u.position FROM sessions s JOIN users u ON u.id = s.user_id "
            "WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE",
            (token,)
        )
        row = cur.fetchone()
        if not row:
            return response(401, {'error': 'Сессия истекла, войдите заново'})
        if row[0] != 'owner' and row[1] != 'super_admin':
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
    comment = (body.get('comment') or '').strip()

    if len(client_name) < 2:
        return response(400, {'error': 'Введите имя'})
    if not client_phone:
        return response(400, {'error': 'Введите корректный номер телефона'})
    if client_email and not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]{2,}$', client_email):
        return response(400, {'error': 'Проверьте адрес электронной почты'})

    conn = get_conn()
    cur = conn.cursor()

    try:
        year = datetime.utcnow().strftime('%y')
        cur.execute("SELECT COUNT(*) FROM objects WHERE company_id = %s", (LEADS_COMPANY_ID,))
        seq = cur.fetchone()[0] + 1
        object_code = f"{LEADS_COMPANY_ID:03d}-20{year}-{seq:04d}"

        cur.execute(
            "INSERT INTO objects (company_id, object_code, client_name, client_phone, email, object_type, area, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (LEADS_COMPANY_ID, object_code, client_name, client_phone, client_email, 'Заявка с сайта', 0, 'лид')
        )
        new_id = cur.fetchone()[0]

        message = f"{client_name}, {client_phone}"
        if client_email:
            message += f", {client_email}"
        if comment:
            message += f" — {comment}"

        cur.execute(
            "INSERT INTO notifications (company_id, type, title, message, payload) "
            "VALUES (%s, %s, %s, %s, %s)",
            (LEADS_COMPANY_ID, 'lead', 'Новая заявка с сайта', message,
             json.dumps({'object_id': new_id, 'object_code': object_code}))
        )

        conn.commit()

        cur.execute(
            "SELECT COALESCE(NULLIF(lead_notify_email, ''), email), COALESCE(brand_name, 'FixKey') "
            "FROM site_settings WHERE company_id = %s",
            (LEADS_COMPANY_ID,)
        )
        row = cur.fetchone()
        notify_email = (row[0] or '').strip() if row else ''
        brand = row[1] if row else 'FixKey'
    finally:
        cur.close()
        conn.close()

    email_sent, email_note = send_lead_email(
        notify_email, brand, client_name, client_phone, comment, object_code, client_email
    )
    if email_sent:
        print(f'Lead email OK ({object_code}) -> {notify_email}')
    else:
        print(f'Lead email FAILED ({object_code}) -> {notify_email or "получатель не задан"}: {email_note}')

    tg_sent, tg_note = send_telegram(
        build_lead_message(brand, client_name, client_phone, comment, object_code, client_email)
    )
    if tg_sent:
        print(f'Lead telegram OK ({object_code})')
    else:
        print(f'Lead telegram SKIP ({object_code}): {tg_note}')

    return response(200, {'success': True, 'object_code': object_code})