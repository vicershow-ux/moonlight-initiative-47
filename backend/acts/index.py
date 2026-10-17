import json
import os
import re
import re
import html as html_lib
import psycopg2
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
    'created_by', 'created_at', 'updated_at',
]

BASE_COLS = ", ".join([f"a.{k}" for k in ACT_KEYS])



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
        font = 'font-family:Courier New,monospace;font-size:13px !important;letter-spacing:.3px;' if mono else ''
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

    contract_number = esc(contract_row.get('contract_number')) if contract_row else ''
    contract_date = contract_row.get('contract_date') if contract_row else ''

    period_from = opts.get('period_from') or ''
    period_to = opts.get('period_to') or ''
    inspection = opts.get('inspection_result') or 'no_defects'
    inspection_text = INSPECTION_ACT_TEXT.get(inspection, INSPECTION_ACT_TEXT['no_defects'])
    calculation = opts.get('calculation') or 'contract'
    calc_text = CALC_LABELS.get(calculation, CALC_LABELS['contract'])
    appendix = opts.get('appendix') or ''

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

    appendix_block = dark_block(
        f'5. Приложения и сопроводительные документы, переданные вместе с результатом работ: {esc(appendix)}.'
    ) if appendix else dark_block(
        '5. Приложения и сопроводительные документы вместе с результатом работ не передавались.'
    )

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

<p>{executor_display}, именуемый(ая) в дальнейшем «Исполнитель», с одной стороны, и {client_name}, именуемый(ая) в дальнейшем «Заказчик», с другой стороны, совместно именуемые «Стороны», составили настоящий Акт о сдаче и приёмке результата работ.</p>

<p>Основание: {basis_line}</p>

{dark_block(period_line)}
{dark_block('1. Работы, перечисленные в настоящем Акте, выполнены Подрядчиком и переданы Заказчику в указанном объёме.')}

<p style="font-weight:600;margin:18px 0 8px">Перечень и стоимость принятых работ</p>
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

{dark_block(f'2. Общая стоимость принятых работ по настоящему Акту составляет <b>{fmt_money(total_amount)}</b> ({money_words(total_amount)}).')}
{dark_block(f'3. Заказчик осмотрел результат. {inspection_text}')}
{dark_block(f'4. {calc_text}')}
{appendix_block}
{dark_block('6. Гарантийные обязательства в отношении принятых работ определяются Договором подряда и применимым законодательством.')}

<hr style="border:none;border-top:1.5px solid #7A4E10;margin:26px 0 14px" />

{parties_block(company_row, opts, executor_display, executor_short, client_name, customer_contacts)}
</div>"""


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
            "SELECT contract_number, contract_date FROM contracts WHERE id = %s AND company_id = %s",
            (contract_id, company_id)
        )
        cr = cur.fetchone()
        if cr:
            contract_row = {'contract_number': cr[0], 'contract_date': cr[1]}

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

        if method == 'GET':
            if act_id:
                cur.execute(
                    f"SELECT {BASE_COLS}, o.object_code, o.client_name, o.address "
                    f"FROM acts a JOIN objects o ON o.id = a.object_id "
                    f"WHERE a.id = %s AND a.company_id = %s",
                    (act_id, company_id)
                )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Акт не найден'})
                keys = ACT_KEYS + ['object_code', 'client_name', 'address']
                return response(200, dict(zip(keys, row)))

            object_id = params.get('object_id')
            contract_id = params.get('contract_id')
            where = "a.company_id = %s"
            args = [company_id]
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
            cur.execute("SELECT a.act_number, o.client_name FROM acts a JOIN objects o ON o.id = a.object_id WHERE a.id = %s AND a.company_id = %s", (act_id, company_id))
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Документ не найден'})
            number, client_name = row
            cur.execute("SELECT name, phone, email, website FROM companies WHERE id = %s", (company_id,))
            comp = cur.fetchone() or ('', '', '', '')
            brand = comp[0] or 'FixKey'
            label = f'Акт сдачи-приёмки выполненных работ № {number}'
            note = (body.get('message') or '').strip()[:2000]
            html_body, text_body = build_doc_email(brand, comp[1] or '', comp[2] or '', comp[3] or '', client_name, label.lower(), note)
            ok, err = send_document_email(to_email, label, html_body, text_body, pdf_b64, f'Акт_{number}.pdf', brand, comp[2] or '')
            if not ok:
                return response(502, {'error': err})
            return response(200, {'success': True})

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
            cur.execute("SELECT id FROM acts WHERE id = %s AND company_id = %s", (act_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Акт не найден'})

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
            cur.execute("DELETE FROM acts WHERE id = %s AND company_id = %s", (act_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()