import base64
import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr


def _smtp_settings():
    host = os.environ.get('SMTP_HOST', '').strip()
    host = host.replace('https://', '').replace('http://', '').replace('smtps://', '')
    host = host.strip().strip('/').split('/')[0].split(':')[0]
    user = os.environ.get('SMTP_USER', '').strip().strip('<>').replace(' ', '')
    password = os.environ.get('SMTP_PASSWORD', '').strip()
    return host, user, password


def send_document_email(to_email, subject, html_body, text_body, pdf_b64, filename, sender_name, reply_to=''):
    '''Отправляет письмо с PDF во вложении. Возвращает (ok, сообщение об ошибке)'''
    host, user, password = _smtp_settings()
    if not host or not user or not password:
        return False, 'Почта для отправки не настроена (SMTP_HOST, SMTP_USER, SMTP_PASSWORD).'

    pdf_bytes = None
    if pdf_b64:
        raw = pdf_b64.split(',', 1)[1] if ',' in pdf_b64 else pdf_b64
        pdf_bytes = base64.b64decode(raw)

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = formataddr((sender_name or 'FixKey', user))
    msg['To'] = to_email
    if reply_to:
        msg['Reply-To'] = reply_to
    # Копия отправленного документа — в рабочий ящик, чтобы было видно, что и кому ушло
    if user.lower() != to_email.lower():
        msg['Bcc'] = user
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype='html')
    if pdf_bytes:
        msg.add_attachment(pdf_bytes, maintype='application', subtype='pdf', filename=filename)

    errors = []
    try:
        with smtplib.SMTP_SSL(host, 465, timeout=8) as server:
            server.login(user, password)
            server.send_message(msg)
        return True, ''
    except Exception as err:
        errors.append(str(err))
    try:
        with smtplib.SMTP(host, 587, timeout=8) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.send_message(msg)
        return True, ''
    except Exception as err:
        errors.append(str(err))

    joined = ' | '.join(errors).lower()
    if 'authentication' in joined or '535' in joined:
        return False, 'Почтовый сервер отклонил пароль ящика-отправителя.'
    if 'timed out' in joined or 'timeout' in joined:
        return False, 'Почтовый сервер не отвечает, попробуйте позже.'
    return False, 'Не удалось отправить письмо: ' + ' | '.join(errors)[:300]

