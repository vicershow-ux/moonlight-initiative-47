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


def fmt_date(d):
    if not d:
        return ''
    s = str(d)
    parts = s.split('-')
    if len(parts) == 3:
        return f"{parts[2][:2]}.{parts[1]}.{parts[0]}"
    return s


def build_act_html(object_row, company_row, contract_row, opts, items, act_number, act_date, act_type, total_amount):
    obj_client_name, obj_address = object_row
    company_name, contact_full_name = company_row
    contract_number, contract_date = (contract_row if contract_row else ('', ''))

    act_title = ACT_TYPE_LABELS.get(act_type, ACT_TYPE_LABELS['acceptance'])
    period_from = opts.get('period_from') or ''
    period_to = opts.get('period_to') or ''
    inspection = opts.get('inspection_result') or ''
    inspection_text = INSPECTION_LABELS.get(inspection, '')
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
        rows_html += (
            f"<tr><td style=\"border:1px solid #333;padding:6px;text-align:center\">{i}</td>"
            f"<td style=\"border:1px solid #333;padding:6px\">{name}</td>"
            f"<td style=\"border:1px solid #333;padding:6px;text-align:center\">{unit}</td>"
            f"<td style=\"border:1px solid #333;padding:6px;text-align:center\">{qty}</td>"
            f"<td style=\"border:1px solid #333;padding:6px;text-align:right\">{fmt_money(price)}</td>"
            f"<td style=\"border:1px solid #333;padding:6px;text-align:right\">{fmt_money(amount)}</td></tr>"
        )

    period_html = ''
    if period_from or period_to:
        period_html = f"<p>Период выполнения работ: с {fmt_date(period_from) or '—'} по {fmt_date(period_to) or '—'}.</p>"

    contract_ref = ''
    if contract_number:
        contract_ref = f" к Договору подряда № {esc(contract_number)} от {fmt_date(contract_date)}"

    inspection_html = f"<p>{inspection_text}</p>" if inspection_text else ''
    appendix_html = f"<p>Приложения и переданные документы: {esc(appendix)}.</p>" if appendix else ''

    return f"""<div class="act-doc" style="font-family:Arial,sans-serif;color:#161616;line-height:1.5;font-size:13px">
<h2 style="text-align:center;margin-bottom:4px">{act_title}</h2>
<p style="text-align:center;margin-top:0">№ {esc(act_number)} от {fmt_date(act_date)}{contract_ref}</p>
<p>Настоящий Акт составлен о том, что Подрядчик {esc(company_name) or esc(contact_full_name)} сдал, а Заказчик {esc(obj_client_name)} принял выполненные работы по объекту, расположенному по адресу: {esc(obj_address)}.</p>
{period_html}
<h3>Перечень выполненных работ</h3>
<table style="border-collapse:collapse;width:100%;font-size:12px">
<thead><tr>
<th style="border:1px solid #333;padding:6px">№</th>
<th style="border:1px solid #333;padding:6px">Наименование работ</th>
<th style="border:1px solid #333;padding:6px">Ед.</th>
<th style="border:1px solid #333;padding:6px">Кол-во</th>
<th style="border:1px solid #333;padding:6px">Цена</th>
<th style="border:1px solid #333;padding:6px">Сумма</th>
</tr></thead>
<tbody>{rows_html}</tbody>
</table>
<p style="text-align:right;font-weight:bold;margin-top:8px">Итого: {fmt_money(total_amount)}</p>
{inspection_html}
<p>Стороны взаимных претензий по объёму, качеству и срокам выполнения работ не имеют. Работы подлежат оплате в соответствии с условиями Договора.</p>
{appendix_html}
<br/>
<table style="width:100%;margin-top:24px;font-size:13px"><tr>
<td style="width:50%;vertical-align:top"><p><b>Подрядчик</b></p><p>{esc(company_name) or esc(contact_full_name)}</p><br/><p>_______________ / _______________</p></td>
<td style="width:50%;vertical-align:top"><p><b>Заказчик</b></p><p>{esc(obj_client_name)}</p><br/><p>_______________ / _______________</p></td>
</tr></table>
</div>"""


def load_context(cur, company_id, object_id, contract_id):
    cur.execute("SELECT client_name, address FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
    object_row = cur.fetchone() or ('', '')

    cur.execute(
        "SELECT name, contact_full_name FROM companies WHERE id = %s",
        (company_id,)
    )
    company_row = cur.fetchone() or ('', '')

    contract_row = None
    if contract_id:
        cur.execute(
            "SELECT contract_number, contract_date FROM contracts WHERE id = %s AND company_id = %s",
            (contract_id, company_id)
        )
        contract_row = cur.fetchone()

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