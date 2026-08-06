import json
import os
import psycopg2


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
        '<div style="background:#F5EBD9;color:#3A2404;border:1.5px solid #7A4E10;'
        'border-left:5px solid #5C3A11;border-radius:8px;'
        'padding:12px 16px;margin:10px 0;font-size:13px;font-weight:600">' + text + '</div>'
    )


def build_act_html(object_row, company_row, contract_row, opts, items, act_number, act_date, act_type, total_amount):
    client_name = esc(object_row.get('client_name'))
    address = esc(object_row.get('address'))
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
        bg = '#ffffff' if i % 2 else '#F5EBD9'
        rows_html += (
            f'<tr style="background:{bg}">'
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
    if client_phone:
        customer_contacts += f'<p style="margin:2px 0">Тел.: {client_phone}</p>'
    if client_email:
        customer_contacts += f'<p style="margin:2px 0">Email: {client_email}</p>'

    return f"""<div class="act-doc" style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.55;font-size:13px">
<h2 style="text-align:center;margin:0 0 4px;font-size:18px">АКТ СДАЧИ-ПРИЁМКИ ВЫПОЛНЕННЫХ РАБОТ № {esc(act_number)}</h2>

<table style="width:100%;margin:10px 0 18px;font-size:12.5px;color:#6B4508;font-weight:600"><tr>
<td style="text-align:left">г. _______________</td>
<td style="text-align:right">{fmt_date_long(act_date)}</td>
</tr></table>

<p>{executor_display}, именуемый(ая) в дальнейшем «Исполнитель», с одной стороны, и {client_name}, именуемый(ая) в дальнейшем «Заказчик», с другой стороны, совместно именуемые «Стороны», составили настоящий Акт о сдаче и приёмке результата работ.</p>

<p>Основание: {basis_line}</p>

{dark_block(period_line)}
{dark_block('1. Работы, перечисленные в настоящем Акте, выполнены Подрядчиком и переданы Заказчику в указанном объёме.')}

<p style="font-weight:600;margin:18px 0 8px">Перечень и стоимость принятых работ</p>
<table style="border-collapse:collapse;width:100%;font-size:12.5px;color:#1a1a1a">
<thead><tr style="background:#5C3A11;color:#ffffff">
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:4%">№</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:46%">Наименование работ</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:7%">Ед.</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:9%">Кол-во</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:16%">Цена, руб.</th>
<th style="border:1.2px solid #6B4508;padding:7px;color:#ffffff;font-weight:700;width:18%">Сумма, руб.</th>
</tr></thead>
<tbody>{rows_html}
<tr style="background:#EADCC0"><td colspan="5" style="border:1.2px solid #6B4508;padding:7px;text-align:right;font-weight:700;color:#4A2E06">Итого:</td>
<td style="border:1.2px solid #6B4508;padding:7px;text-align:right;font-weight:700;color:#4A2E06">{fmt_money(total_amount)}</td></tr>
</tbody>
</table>

{dark_block(f'2. Общая стоимость принятых работ по настоящему Акту составляет <b>{fmt_money(total_amount)}</b> ({money_words(total_amount)}).')}
{dark_block(f'3. Заказчик осмотрел результат. {inspection_text}')}
{dark_block(f'4. {calc_text}')}
{appendix_block}
{dark_block('6. Гарантийные обязательства в отношении принятых работ определяются Договором подряда и применимым законодательством.')}

<hr style="border:none;border-top:1.5px solid #7A4E10;margin:26px 0 14px" />

<table style="width:100%;font-size:13px;margin-bottom:12px"><tr>
<td style="width:50%;vertical-align:top;padding-right:24px">
  <p style="margin:0 0 4px;font-size:11.5px;font-weight:700;letter-spacing:.4px;color:#6B4508">ИСПОЛНИТЕЛЬ</p>
  <p style="margin:0;font-weight:600">{executor_display}</p>
  {executor_contacts}
</td>
<td style="width:50%;vertical-align:top;padding-left:24px">
  <p style="margin:0 0 4px;font-size:11.5px;font-weight:700;letter-spacing:.4px;color:#6B4508">ЗАКАЗЧИК</p>
  <p style="margin:0;font-weight:600">{client_name}</p>
  {customer_contacts}
</td>
</tr></table>

<table style="width:100%;margin-top:32px;font-size:13px"><tr>
<td style="width:50%;vertical-align:top;padding-right:24px">
  <p style="margin:0 0 28px;font-size:11.5px;font-weight:700;letter-spacing:.4px;color:#6B4508">ИСПОЛНИТЕЛЬ</p>
  <div style="border-top:1.5px solid #5C3A11;padding-top:6px;font-size:13px;text-align:center;color:#1a1a1a">{executor_short}</div>
</td>
<td style="width:50%;vertical-align:top;padding-left:24px">
  <p style="margin:0 0 28px;font-size:11.5px;font-weight:700;letter-spacing:.4px;color:#6B4508">ЗАКАЗЧИК</p>
  <div style="border-top:1.5px solid #5C3A11;padding-top:6px;font-size:13px;text-align:center;color:#1a1a1a">{client_name}</div>
</td>
</tr></table>
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
        "SELECT name, contact_full_name, phone, email FROM companies WHERE id = %s",
        (company_id,)
    )
    c = cur.fetchone() or ('', '', '', '')
    company_row = {
        'name': c[0], 'contact_full_name': c[1] or '',
        'phone': c[2] or '', 'email': c[3] or '',
    }

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