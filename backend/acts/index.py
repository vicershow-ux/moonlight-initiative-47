import json
import os
import re
import html as html_lib
import psycopg2
import mimetypes
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from mailer import send_document_email



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
    token = headers.get('X-Authorization') or headers.get('x-authorization') or ''
    token = token.replace('Bearer ', '')
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.company_id, u.role, u.full_name FROM sessions s "
        "JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2], 'full_name': row[3]}


ACT_KEYS = [
    'id', 'object_id', 'contract_id', 'estimate_id', 'act_number', 'act_date',
    'act_type', 'status', 'options', 'items', 'content_html', 'total_amount',
    'created_by', 'created_at', 'updated_at', 'signed_at',
]

BASE_COLS = ", ".join([f"a.{k}" for k in ACT_KEYS])


def apply_client_signature(content, stamp):
    '''Ставит отметку электронной подписи в поле подписи заказчика'''
    mark = ('<div style="position:absolute;left:0;bottom:6px;border:2px solid #2e7d32;color:#2e7d32;border-radius:8px;'
            'padding:6px 10px;font-size:11px;font-weight:700;line-height:1.35;background:#fff">ПОДПИСАНО ЭЛЕКТРОННО<br/>'
            f'<span style="font-weight:600">{html_lib.escape(stamp)}</span></div>')
    idx = content.rfind('ОТ ИМЕНИ ЗАКАЗЧИКА')
    if idx != -1:
        m = re.compile(r'(<div style="position:relative;height:84px;[^"]*">)(</div>)').search(content, idx)
        if m:
            return content[:m.end(1)] + mark + content[m.end(1):]
    flat = mark.replace('position:absolute;left:0;bottom:6px;', 'display:inline-block;margin-top:12px;')
    return content + f'<p style="margin-top:16px"><strong>Заказчик:</strong></p>{flat}'



def extract_city(address):
    if not address:
        return ''
    m = re.search(r'\bг\.?\s*([А-ЯЁ][а-яё\-]+(?:\s+[А-ЯЁ][а-яё\-]+)?)', address)
    if m:
        return m.group(1).strip()
    first = address.split(',')[0].strip()
    if first and not re.search(r'\d|ул|д\.|кв', first, re.I):
        return first
    return ''


def esc(v):
    return '' if v is None else str(v)


ACT_TYPE_LABELS = {
    'acceptance': 'Акт сдачи-приёмки выполненных работ',
    'intermediate': 'Промежуточный акт выполненных работ',
    'hidden_works': 'Акт освидетельствования скрытых работ',
    'defect': 'Дефектный акт',
}

INSPECTION_LABELS = {
    'no_defects': 'Работы выполнены в полном объёме, надлежащего качества, претензий Заказчик не имеет.',
    'minor_defects': 'Выявлены незначительные недостатки, не препятствующие приёмке. Подрядчик обязуется устранить их в согласованный срок.',
    'defects': 'Выявлены недостатки, препятствующие приёмке работ. Составлен перечень замечаний.',
}


def fmt_money(amount):
    try:
        n = float(amount)
    except (TypeError, ValueError):
        n = 0.0
    return f"{n:,.0f}".replace(',', ' ') + ' руб.'


MONTHS_RU = ['', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
             'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']


def fmt_date(d):
    if not d:
        return ''
    s = str(d)
    parts = s.split('-')
    if len(parts) == 3:
        return f"{parts[2][:2]}.{parts[1]}.{parts[0]}"
    return s


def fmt_date_long(d):
    if not d:
        return ''
    s = str(d)
    parts = s.split('-')
    if len(parts) == 3:
        try:
            day = int(parts[2][:2])
            month = int(parts[1])
            return f"{day:02d} {MONTHS_RU[month]} {parts[0]} г."
        except (ValueError, IndexError):
            return s
    return s


UNITS_M = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
UNITS_F = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
TEENS = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
         "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"]
TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"]
HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"]
SCALES = [
    (10 ** 9, True, ("миллиард", "миллиарда", "миллиардов")),
    (10 ** 6, True, ("миллион", "миллиона", "миллионов")),
    (10 ** 3, True, ("тысяча", "тысячи", "тысяч")),
]


def _three(n, feminine=False):
    words = []
    h, rem = n // 100, n % 100
    if h:
        words.append(HUNDREDS[h])
    if 10 <= rem < 20:
        words.append(TEENS[rem - 10])
    else:
        t, u = rem // 10, rem % 10
        if t:
            words.append(TENS[t])
        if u:
            words.append((UNITS_F if feminine else UNITS_M)[u])
    return words


def _plural(n, forms):
    n100 = n % 100
    if 11 <= n100 <= 19:
        return forms[2]
    n10 = n % 10
    if n10 == 1:
        return forms[0]
    if 2 <= n10 <= 4:
        return forms[1]
    return forms[2]


def _num_words(n):
    if n == 0:
        return 'ноль'
    remaining, parts = n, []
    for scale_val, feminine, forms in SCALES:
        if remaining >= scale_val:
            count = remaining // scale_val
            remaining %= scale_val
            parts += _three(count, feminine)
            parts.append(_plural(count, forms))
    if remaining:
        parts += _three(remaining, False)
    return ' '.join(parts)


def money_words(amount):
    try:
        total = float(amount)
    except (TypeError, ValueError):
        total = 0.0
    rub = int(total)
    kop = int(round((total - rub) * 100))
    words = _num_words(rub).capitalize()
    rub_word = _plural(rub, ('рубль', 'рубля', 'рублей'))
    return f"{words} {rub_word} {kop:02d} копеек"


CALC_LABELS = {
    'contract': 'Стоимость работ по настоящему Акту подлежит оплате в порядке и сроки, установленные Договором подряда.',
    'paid': 'Стоимость работ по настоящему Акту оплачена Заказчиком в полном объёме. Финансовых претензий Стороны друг к другу не имеют.',
    'remainder': 'На момент подписания настоящего Акта у Заказчика имеется остаток задолженности, подлежащий оплате в порядке и сроки, установленные Договором подряда.',
}

INSPECTION_ACT_TEXT = {
    'no_defects': 'При осмотре явные недостатки по объёму и качеству принятых работ не выявлены.',
    'minor_defects': 'При осмотре выявлены незначительные недостатки, не препятствующие приёмке. Подрядчик обязуется устранить их в согласованный срок.',
    'defects': 'При осмотре выявлены недостатки, препятствующие приёмке работ. К Акту прилагается перечень замечаний.',
}


def dark_block(text):
    return (
        '<div style="background:#B9A27A;color:#1F1405;border:1.5px solid #5C3A11;'
        'border-left:5px solid #3E2608;border-radius:8px;page-break-inside:avoid;break-inside:avoid;'
        'padding:12px 16px;margin:10px 0;font-size:13px;font-weight:600">' + text + '</div>'
    )


def parties_block(c, opts, executor_display, executor_short, client_name, customer_contacts):
    '''Реквизиты сторон и поля для подписей; подпись и печать компании накладываются по галочкам'''
    entity = (c.get('entity_type') or '').lower()
    is_legal = 'юрид' in entity or entity.startswith('ооо') or 'общество' in entity
    is_ip = 'предприниматель' in entity or entity == 'ип'
    def row(label, value, mono=False, hl=False):
        v = esc(value)
        if not v:
            return ''
        bg = 'background:#F3EBDC;' if hl else ''
        font = 'font-family:Courier New,monospace;font-size:12.5px !important;letter-spacing:.2px;white-space:nowrap;' if mono else ''
        return (f'<tr><td style="{bg}padding:4px 12px;width:36%;color:#6b5a3e;font-size:11px;vertical-align:top">{label}</td>'
                f'<td style="{bg}padding:4px 12px;font-size:12.5px;font-weight:600;{font}word-break:break-word">{v}</td></tr>')

    def group4(v):
        d = re.sub(r'\s+', '', v or '')
        return re.sub(r'(\d{4})(?=\d)', r'\1 ', d)

    req_rows = ''.join([
        row('ОГРН' if is_legal else 'ОГРНИП', c.get('ogrn')) if (is_ip or is_legal) else '',
        row('ИНН', c.get('inn')),
        row('КПП', c.get('kpp')) if is_legal else '',
        row('Адрес', c.get('legal_address')),
        row('Телефон', c.get('phone')),
        row('E-mail', c.get('email')),
        row('Сайт', c.get('website')),
    ])
    bank_rows = ''.join([
        row('Расчётный счёт', group4(c.get('account_number')), mono=True, hl=True),
        row('Банк', c.get('bank_name')),
        row('БИК', c.get('bik'), mono=True),
        row('Корр. счёт', group4(c.get('correspondent_account')), mono=True),
    ])
    executor_req = req_rows
    if bank_rows:
        executor_req += ('<tr><td colspan="2" style="padding:8px 12px 3px;font-size:10.5px;font-weight:700;'
                         'letter-spacing:.4px;color:#6B4508;text-transform:uppercase;border-top:1px solid #D9C9A8">'
                         'Банковские реквизиты</td></tr>' + bank_rows)
    title = f'ИП {executor_short}' if is_ip and executor_short else executor_display

    sig = ''
    if opts.get('apply_signature') and c.get('signature_url'):
        sig = (f'<img src="{esc(c["signature_url"])}" crossorigin="anonymous" alt="" '
               'style="position:absolute;left:10px;bottom:4px;height:62px;max-width:200px;object-fit:contain"/>')
    stamp = ''
    if opts.get('apply_stamp') and c.get('stamp_url'):
        stamp = (f'<img src="{esc(c["stamp_url"])}" crossorigin="anonymous" alt="" '
                 'style="position:absolute;right:0;top:88px;height:118px;width:118px;object-fit:contain;opacity:0.9"/>')
    pad = '80px' if stamp else '0'
    box = '<div style="position:relative;height:84px;border-bottom:1.5px solid #5C3A11;margin:0 0 4px">{}</div>'
    label = 'margin:0 0 6px;font-size:11.5px;font-weight:700;letter-spacing:.4px;color:#4A2E06'
    card = ('border:1.2px solid #6B4508;border-radius:10px;overflow:hidden;page-break-inside:avoid;break-inside:avoid')
    head = ('background:#B9A27A;color:#1F1405;padding:7px 12px;font-weight:700;font-size:11.5px;'
            'letter-spacing:.4px;text-transform:uppercase')
    name_row = 'padding:8px 12px 4px;font-weight:700;font-size:13px'
    return f'''<table style="width:100%;font-size:13px;margin-bottom:12px;border-collapse:collapse"><tr>
<td style="width:50%;vertical-align:top;padding-right:8px">
  <div style="{card}"><div style="{head}">Исполнитель</div>
  <table style="width:100%;border-collapse:collapse"><tr><td colspan="2" style="{name_row}">{title}</td></tr>{executor_req}
  <tr><td colspan="2" style="height:6px"></td></tr></table></div>
</td>
<td style="width:50%;vertical-align:top;padding-left:8px">
  <div style="{card}"><div style="{head}">Заказчик</div>
  <table style="width:100%;border-collapse:collapse"><tr><td colspan="2" style="{name_row}">{client_name}</td></tr>{customer_contacts}
  <tr><td colspan="2" style="height:6px"></td></tr></table></div>
</td>
</tr>
<tr style="page-break-inside:avoid;break-inside:avoid">
<td style="width:50%;vertical-align:top;padding:36px 24px {pad} 0">
  <p style="{label}">ОТ ИМЕНИ ИСПОЛНИТЕЛЯ</p>
  {box.format(sig + stamp)}
  <p style="margin:0">{executor_short}</p>
  <p style="font-size:11px;color:#555;margin:2px 0 0">(подпись)</p>
</td>
<td style="width:50%;vertical-align:top;padding:36px 0 0 24px">
  <p style="{label}">ОТ ИМЕНИ ЗАКАЗЧИКА</p>
  {box.format('')}
  <p style="margin:0">{client_name}</p>
  <p style="font-size:11px;color:#555;margin:2px 0 0">(подпись)</p>
</td>
</tr></table>'''


def is_hire(contract_row):
    return bool(contract_row and (contract_row.get('options') or {}).get('our_role') == 'customer')


def hired_names(o):
    t = o.get('contractor_type')
    person = o.get('contractor_name') or ''
    if t == 'legal':
        return o.get('contractor_org_name') or person, (
            f"{o.get('contractor_director_position') or 'Директор'} {o.get('contractor_director_name') or ''}".strip())
    if t == 'entrepreneur':
        return f'ИП {person}'.strip(), person
    return person, person


def parties_block_hire(c, opts, contract_opts, address):
    '''Мы — Заказчик: слева нанятый исполнитель, справа наша компания с подписью и печатью'''
    o = contract_opts
    def row(label, value, mono=False, hl=False):
        v = esc(value)
        if not v:
            return ''
        bg = 'background:#F3EBDC;' if hl else ''
        font = 'font-family:Courier New,monospace;font-size:12.5px !important;letter-spacing:.2px;white-space:nowrap;' if mono else ''
        return (f'<tr><td style="{bg}padding:4px 12px;width:36%;color:#6b5a3e;font-size:11px;vertical-align:top">{label}</td>'
                f'<td style="{bg}padding:4px 12px;font-size:12.5px;font-weight:600;{font}word-break:break-word">{v}</td></tr>')

    def group4(v):
        d = re.sub(r'\s+', '', v or '')
        return re.sub(r'(\d{4})(?=\d)', r'\1 ', d)

    def bank(account, bank_name, bik, corr):
        rows = ''.join([row('Расчётный счёт', group4(account), mono=True, hl=True), row('Банк', bank_name),
                        row('БИК', bik, mono=True), row('Корр. счёт', group4(corr), mono=True)])
        if not rows:
            return ''
        return ('<tr><td colspan="2" style="padding:8px 12px 3px;font-size:10.5px;font-weight:700;'
                'letter-spacing:.4px;color:#6B4508;text-transform:uppercase;border-top:1px solid #D9C9A8">'
                'Банковские реквизиты</td></tr>' + rows)

    t = o.get('contractor_type')
    person_kind = t in ('individual', 'self_employed', 'foreign_citizen')
    ex_title, ex_signer = hired_names(o)
    ex_rows = ''.join([
        row('ОГРН' if t == 'legal' else 'ОГРНИП', o.get('contractor_ogrnip')) if t in ('legal', 'entrepreneur') else '',
        row('ИНН', o.get('contractor_inn')),
        row('Паспорт', o.get('contractor_passport')) if person_kind else '',
        row('Адрес', o.get('contractor_address')),
        row('Телефон', o.get('contractor_phone')),
        row('E-mail', o.get('contractor_email')),
    ]) + bank(o.get('contractor_account'), o.get('contractor_bank_name'), o.get('contractor_bik'), o.get('contractor_corr_account'))

    entity = (c.get('entity_type') or '').lower()
    is_legal = 'юрид' in entity or entity.startswith('ооо') or 'общество' in entity
    is_ip = 'предприниматель' in entity or entity == 'ип'
    cust_title = esc(o.get('customer_org_name') if o.get('customer_type') == 'legal' and o.get('customer_org_name')
                     else (f"ИП {o.get('customer_name') or c.get('contact_full_name') or ''}" if o.get('customer_type') == 'entrepreneur'
                           else o.get('customer_name') or c.get('name') or c.get('contact_full_name')))
    cust_signer = esc((f"{o.get('customer_director_position') or 'Директор'} {o.get('customer_director_name') or ''}".strip()
                       if o.get('customer_type') == 'legal' else o.get('customer_name')) or c.get('contact_full_name') or c.get('name'))
    cust_rows = ''.join([
        row('ОГРН' if is_legal else 'ОГРНИП', c.get('ogrn')) if (is_ip or is_legal) else '',
        row('ИНН', c.get('inn')),
        row('КПП', c.get('kpp')) if is_legal else '',
        row('Адрес', c.get('legal_address')),
        row('Телефон', c.get('phone')),
        row('E-mail', c.get('email')),
        row('Адрес объекта', address),
    ]) + bank(c.get('account_number'), c.get('bank_name'), c.get('bik'), c.get('correspondent_account'))

    sig = ''
    if opts.get('apply_signature') and c.get('signature_url'):
        sig = (f'<img src="{esc(c["signature_url"])}" crossorigin="anonymous" alt="" '
               'style="position:absolute;left:10px;bottom:4px;height:62px;max-width:200px;object-fit:contain"/>')
    stamp = ''
    if opts.get('apply_stamp') and c.get('stamp_url'):
        stamp = (f'<img src="{esc(c["stamp_url"])}" crossorigin="anonymous" alt="" '
                 'style="position:absolute;right:0;top:88px;height:118px;width:118px;object-fit:contain;opacity:0.9"/>')
    pad = '80px' if stamp else '0'
    box = '<div style="position:relative;height:84px;border-bottom:1.5px solid #5C3A11;margin:0 0 4px">{}</div>'
    label = 'margin:0 0 6px;font-size:11.5px;font-weight:700;letter-spacing:.4px;color:#4A2E06'
    card = 'border:1.2px solid #6B4508;border-radius:10px;overflow:hidden;page-break-inside:avoid;break-inside:avoid'
    head = ('background:#B9A27A;color:#1F1405;padding:7px 12px;font-weight:700;font-size:11.5px;'
            'letter-spacing:.4px;text-transform:uppercase')
    name_row = 'padding:8px 12px 4px;font-weight:700;font-size:13px'
    return f'''<table style="width:100%;font-size:13px;margin-bottom:12px;border-collapse:collapse"><tr>
<td style="width:50%;vertical-align:top;padding-right:8px">
  <div style="{card}"><div style="{head}">Исполнитель</div>
  <table style="width:100%;border-collapse:collapse"><tr><td colspan="2" style="{name_row}">{esc(ex_title)}</td></tr>{ex_rows}
  <tr><td colspan="2" style="height:6px"></td></tr></table></div>
</td>
<td style="width:50%;vertical-align:top;padding-left:8px">
  <div style="{card}"><div style="{head}">Заказчик</div>
  <table style="width:100%;border-collapse:collapse"><tr><td colspan="2" style="{name_row}">{cust_title}</td></tr>{cust_rows}
  <tr><td colspan="2" style="height:6px"></td></tr></table></div>
</td>
</tr>
<tr style="page-break-inside:avoid;break-inside:avoid">
<td style="width:50%;vertical-align:top;padding:36px 24px {pad} 0">
  <p style="{label}">ОТ ИМЕНИ ИСПОЛНИТЕЛЯ</p>
  {box.format('')}
  <p style="margin:0">{esc(ex_signer)}</p>
  <p style="font-size:11px;color:#555;margin:2px 0 0">(подпись)</p>
</td>
<td style="width:50%;vertical-align:top;padding:36px 0 {pad} 24px">
  <p style="{label}">ОТ ИМЕНИ ЗАКАЗЧИКА</p>
  {box.format(sig + stamp)}
  <p style="margin:0">{cust_signer}</p>
  <p style="font-size:11px;color:#555;margin:2px 0 0">(подпись)</p>
</td>
</tr></table>'''


def build_act_html(object_row, company_row, contract_row, opts, items, act_number, act_date, act_type, total_amount):
    client_name = esc(object_row.get('client_name'))
    address = esc(object_row.get('address'))
    city = esc(extract_city(object_row.get('address')))
    city_line = f'г. {city}' if city else 'г. _______________'
    client_phone = esc(object_row.get('client_phone'))
    client_email = esc(object_row.get('email'))

    company_name = esc(company_row.get('name'))
    contact = esc(company_row.get('contact_full_name'))
    company_phone = esc(company_row.get('phone'))
    company_email = esc(company_row.get('email'))
    executor_display = company_name or contact
    executor_short = contact or company_name
    hire = is_hire(contract_row)
    contract_opts = (contract_row or {}).get('options') or {}
    if hire:
        ex_title, ex_signer = hired_names(contract_opts)
        executor_display = esc(ex_title)
        executor_short = esc(ex_signer)
        client_name = esc(contract_opts.get('customer_org_name') if contract_opts.get('customer_type') == 'legal' and contract_opts.get('customer_org_name')
                          else contract_opts.get('customer_name') or company_row.get('name') or contact)

    contract_number = esc(contract_row.get('contract_number')) if contract_row else ''
    contract_date = contract_row.get('contract_date') if contract_row else ''

    entity = (company_row.get('entity_type') or '').lower()
    executor_is_org = ('юрид' in entity or entity.startswith('ооо') or 'общество' in entity) and bool(company_name)
    if hire:
        executor_is_org = contract_opts.get('contractor_type') == 'legal'
    if executor_is_org:
        named_executor = 'именуемое'
    else:
        named_executor = 'именуемая' if opts.get('executor_gender') == 'f' else 'именуемый'
    named_customer = 'именуемая' if opts.get('customer_gender') == 'f' else 'именуемый'
    if hire and contract_opts.get('customer_type') == 'legal':
        named_customer = 'именуемое'

    period_from = opts.get('period_from') or ''
    period_to = opts.get('period_to') or ''
    inspection = opts.get('inspection_result') or 'no_defects'
    inspection_text = INSPECTION_ACT_TEXT.get(inspection, INSPECTION_ACT_TEXT['no_defects'])
    calculation = opts.get('calculation') or 'contract'
    calc_text = CALC_LABELS.get(calculation, CALC_LABELS['contract'])
    appendix = opts.get('appendix') or ''
    stage_label = re.sub(r'\s*\(\d+%\)', '', str(opts.get('stage_label') or '')).strip() if opts.get('scope') == 'stage' else ''
    stage_suffix = f' — {esc(stage_label.lower())}' if stage_label else ''
    stage_note = (
        f' Работы приняты в части этапа «{esc(stage_label)}» по Договору подряда; стоимость каждой позиции указана в доле, приходящейся на этот этап.'
        if stage_label else ''
    )

    rows_html = ''
    for i, it in enumerate(items, 1):
        name = esc(it.get('name'))
        unit = esc(it.get('unit'))
        qty = it.get('quantity') or 0
        price = it.get('price') or 0
        amount = it.get('amount')
        if amount is None:
            try:
                amount = float(qty) * float(price)
            except (TypeError, ValueError):
                amount = 0
        bg = '#ffffff' if i % 2 else '#D3C2A2'
        rows_html += (
            f'<tr style="background:{bg};page-break-inside:avoid;break-inside:avoid">'
            f'<td style="border:1.2px solid #6B4508;padding:7px;text-align:center">{i}</td>'
            f'<td style="border:1.2px solid #6B4508;padding:7px">{name}</td>'
            f'<td style="border:1.2px solid #6B4508;padding:7px;text-align:center">{unit}</td>'
            f'<td style="border:1.2px solid #6B4508;padding:7px;text-align:center">{qty}</td>'
            f'<td style="border:1.2px solid #6B4508;padding:7px;text-align:right">{fmt_money(price)}</td>'
            f'<td style="border:1.2px solid #6B4508;padding:7px;text-align:right">{fmt_money(amount)}</td>'
            f'</tr>'
        )

    period_line = (
        f'Отчётный период: с {fmt_date(period_from) or "_______________"} '
        f'по {fmt_date(period_to) or "_______________"}.'
    )

    basis_parts = []
    if contract_number:
        basis_parts.append(f'Договор подряда № {contract_number} от {fmt_date(contract_date)}')
    if address:
        basis_parts.append(f'Объект: {object_row.get("object_type", "")} по адресу: {address}')
    basis_line = '. '.join(basis_parts) + '.' if basis_parts else ''

    attachments = [f for f in (opts.get('attachments') or []) if isinstance(f, dict) and f.get('url')]
    att_names = ', '.join(html_lib.escape(f.get('name') or 'файл') for f in attachments)
    appendix_parts = [p for p in [esc(appendix.strip().rstrip('.')), att_names] if p]
    appendix_block = dark_block(
        f'5. Приложения и сопроводительные документы, переданные вместе с результатом работ: {"; ".join(appendix_parts)}.'
    ) if appendix_parts else dark_block(
        '5. Приложения и сопроводительные документы вместе с результатом работ не передавались.'
    )

    photos = [f for f in attachments if f.get('type') == 'photo']
    docs = [f for f in attachments if f.get('type') != 'photo']
    attachments_html = ''
    if attachments:
        title_html = '<p style="font-weight:700;font-size:15px;margin:18px 0 12px;color:#4A2E06;page-break-after:avoid;break-after:avoid">Приложение к Акту № ' + esc(act_number) + '</p>'
        parts = [] if photos else [title_html]
        for i, f in enumerate(photos):
            parts.append(
                '<div style="page-break-inside:avoid;break-inside:avoid;margin:0 0 16px">'
                + (title_html if i == 0 else '') +
                f'<img src="{html_lib.escape(f["url"])}" crossorigin="anonymous" alt="" style="display:block;max-width:100%;max-height:400px;margin:0 auto;border-radius:8px;object-fit:contain"/>'
                f'<p style="text-align:center;font-size:11px;color:#6b5a3e;margin:6px 0 0">Фото {i + 1}. {html_lib.escape(f.get("name") or "")}</p>'
                '</div>'
            )
        if docs:
            items_li = ''.join(
                f'<li style="margin:0 0 4px"><a href="{html_lib.escape(f["url"])}" style="color:#4A2E06">{html_lib.escape(f.get("name") or "документ")}</a></li>'
                for f in docs
            )
            parts.append(f'<p style="font-weight:600;margin:12px 0 6px">Документы:</p><ol style="margin:0;padding-left:20px">{items_li}</ol>')
        attachments_html = '\n'.join(parts)

    executor_contacts = ''
    if company_phone:
        executor_contacts += f'<p style="margin:2px 0">Тел.: {company_phone}</p>'
    if company_email:
        executor_contacts += f'<p style="margin:2px 0">Email: {company_email}</p>'

    customer_contacts = ''
    if address:
        customer_contacts += f'<tr><td style="padding:4px 12px;width:36%;color:#6b5a3e;font-size:11px;vertical-align:top">Адрес объекта</td><td style="padding:4px 12px;font-size:12.5px;font-weight:600;word-break:break-word">{address}</td></tr>'
    if client_phone:
        customer_contacts += f'<tr><td style="padding:4px 12px;width:36%;color:#6b5a3e;font-size:11px;vertical-align:top">Телефон</td><td style="padding:4px 12px;font-size:12.5px;font-weight:600;word-break:break-word">{client_phone}</td></tr>'
    if client_email:
        customer_contacts += f'<tr><td style="padding:4px 12px;width:36%;color:#6b5a3e;font-size:11px;vertical-align:top">E-mail</td><td style="padding:4px 12px;font-size:12.5px;font-weight:600;word-break:break-word">{client_email}</td></tr>'

    return f"""<div class="act-doc" style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.55;font-size:13px">
<h2 style="text-align:center;margin:0 0 4px;font-size:18px">АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ № {esc(act_number)}</h2>

<table style="width:100%;margin:10px 0 18px;font-size:12.5px;color:#6B4508;font-weight:600"><tr>
<td style="text-align:left">{city_line}</td>
<td style="text-align:right">{fmt_date_long(act_date)}</td>
</tr></table>

<p>{executor_display}, {named_executor} в дальнейшем «Исполнитель», с одной стороны, и {client_name}, {named_customer} в дальнейшем «Заказчик», с другой стороны, совместно именуемые «Стороны», составили настоящий Акт о сдаче и приёмке результата работ.</p>

<p>Основание: {basis_line}</p>

{dark_block(period_line)}
{dark_block('1. Работы, перечисленные в настоящем Акте, выполнены Подрядчиком и переданы Заказчику в указанном объёме.')}

<p style="font-weight:600;margin:18px 0 8px">Перечень и стоимость принятых работ{stage_suffix}</p>
<table class="works-table" style="border-collapse:collapse;width:100%;font-size:12.5px;color:#1a1a1a">
<thead><tr style="background:#5C3A11;color:#ffffff">
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:4%">№</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:46%">Наименование работ</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:7%">Ед.</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:9%">Кол-во</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:16%">Цена, руб.</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:18%">Сумма, руб.</th>
</tr></thead>
<tbody>{rows_html}
<tr style="background:#B9A27A;page-break-inside:avoid"><td colspan="5" style="border:1.2px solid #6B4508;padding:7px;text-align:right;font-weight:700;color:#1F1405">Итого:</td>
<td style="border:1.2px solid #6B4508;padding:7px;text-align:right;font-weight:700;color:#1F1405">{fmt_money(total_amount)}</td></tr>
</tbody>
</table>

{dark_block(f'2. Общая стоимость принятых работ по настоящему Акту составляет <b>{fmt_money(total_amount)}</b> ({money_words(total_amount)}).{stage_note}')}
{dark_block(f'3. Заказчик осмотрел результат. {inspection_text}')}
{dark_block(f'4. {calc_text}')}
{appendix_block}
{dark_block('6. Гарантийные обязательства в отношении принятых работ определяются Договором подряда и применимым законодательством.')}

{attachments_html}

<hr style="border:none;border-top:1.5px solid #7A4E10;margin:26px 0 14px" />

{parties_block_hire(company_row, opts, contract_opts, address) if hire else parties_block(company_row, opts, executor_display, executor_short, client_name, customer_contacts)}
</div>"""


MAX_MAIL_FILES_BYTES = 20 * 1024 * 1024


def _fetch_file(f):
    url = f.get('url') or ''
    if not url.startswith('https://'):
        return None
    try:
        with urllib.request.urlopen(url, timeout=4) as r:
            data = r.read(MAX_MAIL_FILES_BYTES + 1)
        name = f.get('name') or url.rsplit('/', 1)[-1]
        mime = mimetypes.guess_type(name)[0] or mimetypes.guess_type(url)[0] or 'application/octet-stream'
        return data, name, mime
    except Exception:
        return None


def load_attachment_files(options):
    """Скачивает прикреплённые к акту файлы для отправки письмом"""
    if isinstance(options, str):
        try:
            options = json.loads(options)
        except Exception:
            options = {}
    files = [f for f in ((options or {}).get('attachments') or []) if isinstance(f, dict) and f.get('url')]
    if not files:
        return [], []
    with ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(_fetch_file, files))
    out, skipped, total = [], [], 0
    for f, res in zip(files, results):
        if not res or total + len(res[0]) > MAX_MAIL_FILES_BYTES:
            skipped.append(f.get('name') or 'файл')
            continue
        total += len(res[0])
        out.append(res)
    return out, skipped


def load_context(cur, company_id, object_id, contract_id):
    cur.execute(
        "SELECT client_name, address, client_phone, email, object_type FROM objects "
        "WHERE id = %s AND company_id = %s",
        (object_id, company_id)
    )
    o = cur.fetchone() or ('', '', '', '', '')
    object_row = {
        'client_name': o[0], 'address': o[1], 'client_phone': o[2] or '',
        'email': o[3] or '', 'object_type': o[4] or 'вторичка',
    }

    cur.execute(
        "SELECT name, contact_full_name, phone, email, entity_type, ogrn, inn, kpp, legal_address, "
        "bank_name, bik, account_number, correspondent_account, signature_url, stamp_url, website "
        "FROM companies WHERE id = %s",
        (company_id,)
    )
    c = cur.fetchone() or ('',) * 16
    keys = ['name', 'contact_full_name', 'phone', 'email', 'entity_type', 'ogrn', 'inn', 'kpp', 'legal_address',
            'bank_name', 'bik', 'account_number', 'correspondent_account', 'signature_url', 'stamp_url', 'website']
    company_row = {k: (v or '') for k, v in zip(keys, c)}

    contract_row = None
    if contract_id:
        cur.execute(
            "SELECT contract_number, contract_date, options FROM contracts WHERE id = %s AND company_id = %s",
            (contract_id, company_id)
        )
        cr = cur.fetchone()
        if cr:
            contract_row = {'contract_number': cr[0], 'contract_date': cr[1], 'options': cr[2] or {}}

    return object_row, company_row, contract_row


def next_act_number(cur, company_id):
    cur.execute("SELECT COUNT(*) FROM acts WHERE company_id = %s", (company_id,))
    count = cur.fetchone()[0]
    return str(count + 1)


def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = get_conn()
    cur = conn.cursor()
    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        company_id = user['company_id']

        method = event.get('httpMethod')
        params = event.get('queryStringParameters') or {}
        act_id = params.get('id')
        action = params.get('action')
        is_client = user['role'] == 'client'
        if is_client and method == 'POST' and action == 'sign':
            cur.execute(
                "SELECT a.object_id, a.act_number, a.signed_at, a.content_html, o.object_code FROM acts a "
                "JOIN objects o ON o.id = a.object_id WHERE a.id = %s AND a.company_id = %s "
                "AND a.object_id IN (SELECT object_id FROM object_access WHERE user_id = %s)",
                (act_id, company_id, user['user_id'])
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Акт не найден'})
            obj_id, number, signed_at, content, code = row
            if signed_at:
                return response(200, {'success': True, 'status': 'signed'})
            cur.execute("SELECT NOW()")
            now = cur.fetchone()[0]
            stamp = f"{user['full_name']}, {now.strftime('%d.%m.%Y %H:%M')}"
            ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')
            cur.execute(
                "UPDATE acts SET status = 'signed', signed_at = %s, signed_by = %s, signed_ip = %s, content_html = %s, updated_at = NOW() WHERE id = %s",
                (now, user['user_id'], (ip or '')[:64], apply_client_signature(content or '', stamp), act_id)
            )
            cur.execute(
                "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
                (company_id, 'act_signed', 'Заказчик подписал акт',
                 f"{user['full_name']} подписал акт № {number} по объекту {code}",
                 json.dumps({'object_id': obj_id, 'act_id': int(act_id)}))
            )
            conn.commit()
            return response(200, {'success': True, 'status': 'signed', 'signed_at': now})

        if is_client and method != 'GET':
            return response(403, {'error': 'Недостаточно прав'})
        client_cond = " AND a.object_id IN (SELECT object_id FROM object_access WHERE user_id = %s)" if is_client else ""
        client_args = [user['user_id']] if is_client else []

        if method == 'GET':
            if act_id:
                cur.execute(
                    f"SELECT {BASE_COLS}, o.object_code, o.client_name, o.address "
                    f"FROM acts a JOIN objects o ON o.id = a.object_id "
                    f"WHERE a.id = %s AND a.company_id = %s{client_cond}",
                    [act_id, company_id] + client_args
                )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Акт не найден'})
                keys = ACT_KEYS + ['object_code', 'client_name', 'address']
                return response(200, dict(zip(keys, row)))

            object_id = params.get('object_id')
            contract_id = params.get('contract_id')
            where = "a.company_id = %s" + client_cond
            args = [company_id] + client_args
            if object_id:
                where += " AND a.object_id = %s"
                args.append(object_id)
            if contract_id:
                where += " AND a.contract_id = %s"
                args.append(contract_id)
            cur.execute(
                f"SELECT {BASE_COLS}, o.object_code, o.client_name, o.address "
                f"FROM acts a JOIN objects o ON o.id = a.object_id "
                f"WHERE {where} ORDER BY a.created_at DESC",
                args
            )
            keys = ACT_KEYS + ['object_code', 'client_name', 'address']
            acts = [dict(zip(keys, r)) for r in cur.fetchall()]
            return response(200, {'acts': acts})

        if method == 'POST' and action == 'send_email':
            if user.get('role') == 'client':
                return response(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            to_email = (body.get('email') or '').strip()
            pdf_b64 = body.get('pdf_base64') or ''
            if not act_id:
                return response(400, {'error': 'Не указан документ'})
            if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', to_email):
                return response(400, {'error': 'Укажите корректный email заказчика'})
            if not pdf_b64:
                return response(400, {'error': 'Нет файла документа'})
            if len(pdf_b64) > 9_000_000:
                return response(400, {'error': 'Файл слишком большой для отправки'})
            cur.execute("SELECT a.act_number, o.client_name, a.options FROM acts a JOIN objects o ON o.id = a.object_id WHERE a.id = %s AND a.company_id = %s", (act_id, company_id))
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Документ не найден'})
            number, client_name, act_options = row
            extra_files, skipped_files = load_attachment_files(act_options)
            cur.execute("SELECT name, phone, email, website FROM companies WHERE id = %s", (company_id,))
            comp = cur.fetchone() or ('', '', '', '')
            brand = comp[0] or 'FixKey'
            label = f'Акт сдачи-приёмки выполненных работ № {number}'
            note = (body.get('message') or '').strip()[:2000]
            html_body, text_body = build_doc_email(brand, comp[1] or '', comp[2] or '', comp[3] or '', client_name, label.lower(), note)
            ok, err = send_document_email(to_email, label, html_body, text_body, pdf_b64, f'Акт_{number}.pdf', brand, comp[2] or '', extra_files)
            if not ok:
                return response(502, {'error': err})
            return response(200, {'success': True, 'attached': len(extra_files), 'skipped': skipped_files})

        if method == 'POST' and action == 'generate':
            body = json.loads(event.get('body') or '{}')
            object_id = body.get('object_id')
            contract_id = body.get('contract_id')
            act_type = body.get('act_type') or 'acceptance'
            act_number = body.get('act_number') or next_act_number(cur, company_id)
            act_date = body.get('act_date')
            opts = body.get('options') or {}
            items = body.get('items') or []
            total_amount = sum(float(it.get('amount') or 0) for it in items)

            object_row, company_row, contract_row = load_context(cur, company_id, object_id, contract_id)
            html = build_act_html(object_row, company_row, contract_row, opts, items, act_number, act_date, act_type, total_amount)
            return response(200, {'content_html': html, 'total_amount': total_amount, 'act_number': act_number})

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            object_id = body.get('object_id')
            if not object_id:
                return response(400, {'error': 'Не указан объект'})
            contract_id = body.get('contract_id')
            estimate_id = body.get('estimate_id')
            act_type = body.get('act_type') or 'acceptance'
            act_number = body.get('act_number') or next_act_number(cur, company_id)
            act_date = body.get('act_date')
            opts = body.get('options') or {}
            items = body.get('items') or []
            status = body.get('status') or 'draft'
            total_amount = body.get('total_amount')
            if total_amount is None:
                total_amount = sum(float(it.get('amount') or 0) for it in items)
            content_html = body.get('content_html')
            if not content_html:
                object_row, company_row, contract_row = load_context(cur, company_id, object_id, contract_id)
                content_html = build_act_html(object_row, company_row, contract_row, opts, items, act_number, act_date, act_type, total_amount)

            cur.execute(
                "INSERT INTO acts (company_id, object_id, contract_id, estimate_id, act_number, act_date, "
                "act_type, status, options, items, content_html, total_amount, created_by) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, created_at",
                (company_id, object_id, contract_id, estimate_id, act_number, act_date, act_type,
                 status, json.dumps(opts), json.dumps(items), content_html, total_amount, user['user_id'])
            )
            new_id, created_at = cur.fetchone()
            conn.commit()
            return response(200, {'id': new_id, 'act_number': act_number, 'created_at': created_at})

        if method == 'PUT':
            if not act_id:
                return response(400, {'error': 'Не указан id акта'})
            body = json.loads(event.get('body') or '{}')
            cur.execute("SELECT id, signed_at FROM acts WHERE id = %s AND company_id = %s", (act_id, company_id))
            ex = cur.fetchone()
            if not ex:
                return response(404, {'error': 'Акт не найден'})
            if ex[1] and (any(k in body for k in ('content_html', 'total_amount', 'items', 'options', 'act_number', 'act_date', 'act_type')) or body.get('status') == 'draft'):
                return response(400, {'error': 'Заказчик уже подписал акт онлайн — изменить его нельзя'})

            fields = []
            values = []
            for key in ['act_number', 'act_date', 'act_type', 'status', 'content_html', 'total_amount']:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(body[key])
            for key in ['options', 'items']:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(json.dumps(body[key]))
            if fields:
                fields.append("updated_at = now()")
                values.append(act_id)
                values.append(company_id)
                cur.execute(f"UPDATE acts SET {', '.join(fields)} WHERE id = %s AND company_id = %s", values)
                conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE':
            if not act_id:
                return response(400, {'error': 'Не указан id акта'})
            cur.execute("SELECT id FROM acts WHERE id = %s AND company_id = %s", (act_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Акт не найден'})
            cur.execute("UPDATE invoices SET act_id = NULL WHERE act_id = %s", (act_id,))
            cur.execute("DELETE FROM acts WHERE id = %s AND company_id = %s", (act_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()