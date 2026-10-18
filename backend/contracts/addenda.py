import json
from datetime import date
from html import escape as h

ADD_KEYS = ['id', 'contract_id', 'object_id', 'addendum_number', 'addendum_date', 'status',
            'options', 'content_html', 'total_amount', 'created_at', 'updated_at']

MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля',
          'августа', 'сентября', 'октября', 'ноября', 'декабря']


def ru_date(v):
    try:
        d = v if isinstance(v, date) else date.fromisoformat(str(v)[:10])
    except ValueError:
        d = date.today()
    return f'«{d.day:02d}» {MONTHS[d.month - 1]} {d.year} г.'


def fnum(v):
    try:
        return round(float(str(v).replace(',', '.').replace(' ', '') or 0), 2)
    except ValueError:
        return 0.0


def fmt(v):
    return f"{fnum(v):,.2f}".replace(',', ' ').replace('.', ',')


def build_addendum_html(contract, obj, company, opts, number, add_date, money_words):
    '''Собирает текст допсоглашения из выбранных разделов'''
    c_number, c_date, c_total = contract
    client_name, address = obj
    comp_name, inn, legal_address, bank_name, bik, account, corr, contact = company
    contractor = comp_name or contact or 'Подрядчик'

    items = [it for it in (opts.get('items') or []) if str(it.get('name') or '').strip()]
    removed = [it for it in (opts.get('removed_items') or []) if str(it.get('name') or '').strip()]
    add_sum = round(sum(fnum(it.get('quantity')) * fnum(it.get('price')) for it in items), 2)
    rem_sum = round(sum(fnum(it.get('quantity')) * fnum(it.get('price')) for it in removed), 2)
    old_total = fnum(opts.get('old_total') if opts.get('old_total') not in (None, '') else c_total)
    new_total = round(old_total + add_sum - rem_sum, 2)
    if opts.get('price_mode') == 'manual':
        new_total = fnum(opts.get('new_total'))

    points = []

    def table(rows, title):
        body = ''.join(
            f'<tr><td style="text-align:center">{i}</td><td>{h(str(r.get("name")))}</td>'
            f'<td style="text-align:center">{h(str(r.get("unit") or ""))}</td>'
            f'<td style="text-align:right">{fnum(r.get("quantity")):g}</td>'
            f'<td style="text-align:right">{fmt(r.get("price"))}</td>'
            f'<td style="text-align:right">{fmt(fnum(r.get("quantity")) * fnum(r.get("price")))}</td></tr>'
            for i, r in enumerate(rows, 1)
        )
        total = sum(fnum(r.get('quantity')) * fnum(r.get('price')) for r in rows)
        return (
            f'<p style="margin:10px 0 4px"><strong>{title}</strong></p>'
            '<table class="doc-table" style="width:100%;border-collapse:collapse" border="1" cellpadding="4">'
            '<tr><th>№</th><th>Наименование работ</th><th>Ед.</th><th>Кол-во</th><th>Цена, ₽</th><th>Сумма, ₽</th></tr>'
            f'{body}<tr><td colspan="5" style="text-align:right"><strong>Итого</strong></td>'
            f'<td style="text-align:right"><strong>{fmt(total)}</strong></td></tr></table>'
        )

    if items:
        points.append('Стороны договорились о выполнении Подрядчиком дополнительных работ, не предусмотренных Договором, '
                      'в объёме и по стоимости согласно таблице ниже:' + table(items, 'Дополнительные работы'))
    if removed:
        points.append('Стороны договорились исключить из объёма работ по Договору следующие работы:' + table(removed, 'Исключаемые работы'))
    if items or removed or opts.get('price_mode') == 'manual':
        points.append(
            f'В связи с изложенным цена Договора изменяется и составляет {h(money_words(new_total))}, '
            f'в том числе стоимость ранее согласованных работ — {fmt(old_total)} ₽'
            + (f', дополнительных работ — {fmt(add_sum)} ₽' if add_sum else '')
            + (f', исключённых работ — минус {fmt(rem_sum)} ₽' if rem_sum else '') + '.'
        )
        pay = str(opts.get('payment_terms') or '').strip()
        if pay:
            points.append(h(pay))
    if opts.get('change_deadline') and str(opts.get('new_deadline') or '').strip():
        reason = str(opts.get('deadline_reason') or '').strip()
        points.append(f'Срок окончания работ по Договору устанавливается: {h(ru_date(opts.get("new_deadline")))}'
                      + (f' в связи с {h(reason)}' if reason else '') + '.')
    custom = str(opts.get('custom_terms') or '').strip()
    if custom:
        for para in [p.strip() for p in custom.split('\n') if p.strip()]:
            points.append(h(para))
    points.append('Во всём остальном, что не предусмотрено настоящим Соглашением, Стороны руководствуются условиями Договора. '
                  'Обязательства Сторон, не затронутые настоящим Соглашением, остаются в неизменном виде.')
    points.append('Настоящее Соглашение является неотъемлемой частью Договора, вступает в силу с момента подписания обеими Сторонами '
                  'и составлено в двух экземплярах, имеющих одинаковую юридическую силу, по одному для каждой из Сторон.')

    body = ''.join(f'<p>{i}. {p}</p>' for i, p in enumerate(points, 1))
    html = f'''<div class="contract-doc">
<h2 style="text-align:center;margin-bottom:4px">ДОПОЛНИТЕЛЬНОЕ СОГЛАШЕНИЕ № {h(str(number))}</h2>
<p style="text-align:center;margin-top:0">к договору подряда № {h(str(c_number))} от {h(ru_date(c_date))}</p>
<table style="width:100%;margin:12px 0"><tr><td>Объект: {h(address or '')}</td><td style="text-align:right">{h(ru_date(add_date))}</td></tr></table>
<p>{h(contractor)}, именуемый в дальнейшем «Подрядчик», с одной стороны, и {h(client_name or '')}, именуемый в дальнейшем «Заказчик», с другой стороны,
вместе именуемые «Стороны», заключили настоящее Дополнительное соглашение (далее — «Соглашение») к договору подряда № {h(str(c_number))} от {h(ru_date(c_date))} (далее — «Договор») о нижеследующем:</p>
{body}
<h3>Подписи сторон</h3>
<table style="width:100%;margin-top:16px"><tr>
<td style="width:50%;vertical-align:top;padding-right:16px">
<p><strong>ПОДРЯДЧИК</strong></p><p>{h(contractor)}</p>
<p>ИНН: {h(inn or '')}</p><p>Юр. адрес: {h(legal_address or '')}</p>
<p>Банк: {h(bank_name or '')}, БИК: {h(bik or '')}</p><p>Р/с: {h(account or '')}</p>
<p style="margin-top:24px">Подпись: _______________</p></td>
<td style="width:50%;vertical-align:top;padding-left:16px">
<p><strong>ЗАКАЗЧИК</strong></p><p>{h(client_name or '')}</p><p>Объект: {h(address or '')}</p>
<p style="margin-top:24px">Подпись: _______________</p></td>
</tr></table></div>'''
    return html, new_total


def load_context(cur, company_id, contract_id):
    cur.execute(
        "SELECT c.contract_number, c.contract_date, c.total_amount, c.object_id, o.client_name, o.address "
        "FROM contracts c JOIN objects o ON o.id = c.object_id WHERE c.id = %s AND c.company_id = %s",
        (contract_id, company_id)
    )
    r = cur.fetchone()
    if not r:
        return None
    cur.execute(
        "SELECT name, inn, legal_address, bank_name, bik, account_number, correspondent_account, contact_full_name "
        "FROM companies WHERE id = %s", (company_id,)
    )
    comp = cur.fetchone() or ('',) * 8
    return {'contract': (r[0], r[1], r[2]), 'object_id': r[3], 'obj': (r[4], r[5]), 'company': comp}


def next_number(cur, contract_id):
    cur.execute("SELECT COUNT(*) FROM contract_addenda WHERE contract_id = %s", (contract_id,))
    return str(cur.fetchone()[0] + 1)


def handle(cur, conn, user, method, params, body, response, has_object_access, money_words):
    company_id = user['company_id']
    is_client = user['role'] == 'client'
    add_id = params.get('id')
    action = params.get('action')

    if method == 'GET':
        if add_id:
            cur.execute(f"SELECT {', '.join(ADD_KEYS)} FROM contract_addenda WHERE id = %s AND company_id = %s", (add_id, company_id))
            r = cur.fetchone()
            if not r:
                return response(404, {'error': 'Соглашение не найдено'})
            data = dict(zip(ADD_KEYS, r))
            if not has_object_access(cur, user, data['object_id']):
                return response(404, {'error': 'Соглашение не найдено'})
            cur.execute("SELECT contract_number FROM contracts WHERE id = %s", (data['contract_id'],))
            data['contract_number'] = (cur.fetchone() or [''])[0]
            return response(200, data)
        where, args = "company_id = %s", [company_id]
        if params.get('contract_id'):
            where += " AND contract_id = %s"
            args.append(params['contract_id'])
        if params.get('object_id'):
            where += " AND object_id = %s"
            args.append(params['object_id'])
        if is_client:
            where += " AND object_id IN (SELECT object_id FROM object_access WHERE user_id = %s)"
            args.append(user['user_id'])
        cols = ', '.join(k for k in ADD_KEYS if k != 'content_html')
        cur.execute(f"SELECT {cols} FROM contract_addenda WHERE {where} ORDER BY created_at", args)
        keys = [k for k in ADD_KEYS if k != 'content_html']
        return response(200, {'addenda': [dict(zip(keys, r)) for r in cur.fetchall()]})

    if is_client:
        return response(403, {'error': 'Недостаточно прав'})

    if method == 'DELETE':
        cur.execute("DELETE FROM contract_addenda WHERE id = %s AND company_id = %s", (add_id, company_id))
        conn.commit()
        return response(200, {'success': True})

    contract_id = body.get('contract_id')
    if method == 'PUT' and add_id:
        cur.execute("SELECT contract_id FROM contract_addenda WHERE id = %s AND company_id = %s", (add_id, company_id))
        r = cur.fetchone()
        if not r:
            return response(404, {'error': 'Соглашение не найдено'})
        contract_id = r[0]
    ctx = load_context(cur, company_id, contract_id)
    if not ctx:
        return response(404, {'error': 'Договор не найден'})

    opts = body.get('options') or {}
    number = str(body.get('addendum_number') or '').strip()[:50] or next_number(cur, contract_id)
    add_date = str(body.get('addendum_date') or date.today().isoformat())[:10]
    html, total = build_addendum_html(ctx['contract'], ctx['obj'], ctx['company'], opts, number, add_date, money_words)

    if method == 'POST' and action == 'preview':
        return response(200, {'content_html': html, 'total_amount': total, 'addendum_number': number})

    status = body.get('status') if body.get('status') in ('draft', 'signed') else 'draft'
    if method == 'POST':
        cur.execute(
            "INSERT INTO contract_addenda (company_id, contract_id, object_id, addendum_number, addendum_date, status, options, content_html, total_amount, created_by) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (company_id, contract_id, ctx['object_id'], number, add_date, status, json.dumps(opts, ensure_ascii=False), html, total, user['user_id'])
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return response(200, {'id': new_id, 'object_id': ctx['object_id']})
    if method == 'PUT':
        cur.execute(
            "UPDATE contract_addenda SET addendum_number = %s, addendum_date = %s, status = %s, options = %s, content_html = %s, "
            "total_amount = %s, updated_at = NOW() WHERE id = %s",
            (number, add_date, status, json.dumps(opts, ensure_ascii=False), html, total, add_id)
        )
        conn.commit()
        return response(200, {'id': int(add_id), 'object_id': ctx['object_id']})
    return response(405, {'error': 'Метод не поддерживается'})
