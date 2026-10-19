import json
from datetime import date
from html import escape as h

ADD_KEYS = ['id', 'contract_id', 'object_id', 'addendum_number', 'addendum_date', 'status',
            'options', 'content_html', 'total_amount', 'created_at', 'updated_at', 'signed_at']

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


BORDER = '#6B4508'


def dark_block(text):
    return ('<div style="background:#B9A27A;color:#1F1405;border:1.5px solid #5C3A11;'
            'border-left:5px solid #3E2608;border-radius:8px;page-break-inside:avoid;break-inside:avoid;'
            'padding:12px 16px;margin:10px 0;font-size:13px;font-weight:600">' + text + '</div>')


def works_table(rows, title):
    cell = f'border:1.2px solid {BORDER};padding:7px'
    th = f'{cell};color:#ffffff;font-weight:700'
    body = ''
    total = 0.0
    for i, r in enumerate(rows, 1):
        amount = fnum(r.get('quantity')) * fnum(r.get('price'))
        total += amount
        bg = '#ffffff' if i % 2 else '#D3C2A2'
        body += (f'<tr style="background:{bg};page-break-inside:avoid;break-inside:avoid">'
                 f'<td style="{cell};text-align:center">{i}</td><td style="{cell}">{h(str(r.get("name")))}</td>'
                 f'<td style="{cell};text-align:center">{h(str(r.get("unit") or ""))}</td>'
                 f'<td style="{cell};text-align:center">{fnum(r.get("quantity")):g}</td>'
                 f'<td style="{cell};text-align:right">{fmt(r.get("price"))}</td>'
                 f'<td style="{cell};text-align:right">{fmt(amount)}</td></tr>')
    return (f'<p style="font-weight:600;margin:18px 0 8px">{title}</p>'
            '<table class="works-table" style="border-collapse:collapse;width:100%;font-size:12.5px;color:#1a1a1a">'
            f'<thead><tr style="background:#5C3A11;color:#ffffff"><th style="{th};width:4%">№</th>'
            f'<th style="{th};width:46%">Наименование работ</th><th style="{th};width:7%">Ед.</th>'
            f'<th style="{th};width:9%">Кол-во</th><th style="{th};width:16%">Цена, руб.</th>'
            f'<th style="{th};width:18%">Сумма, руб.</th></tr></thead><tbody>{body}'
            f'<tr style="background:#B9A27A;page-break-inside:avoid"><td colspan="5" style="{cell};text-align:right;font-weight:700;color:#1F1405">Итого:</td>'
            f'<td style="{cell};text-align:right;font-weight:700;color:#1F1405">{fmt(total)}</td></tr></tbody></table>')


def info_row(label, value, mono=False, hl=False):
    if not value:
        return ''
    bg = 'background:#F3EBDC;' if hl else ''
    font = 'font-family:Courier New,monospace;letter-spacing:.2px;white-space:nowrap;' if mono else ''
    return (f'<tr><td style="{bg}padding:4px 12px;width:36%;color:#6b5a3e;font-size:11px;vertical-align:top">{label}</td>'
            f'<td style="{bg}padding:4px 12px;font-size:12.5px;font-weight:600;{font}word-break:break-word">{h(str(value))}</td></tr>')


def group4(v):
    d = ''.join(str(v or '').split())
    return ' '.join(d[i:i + 4] for i in range(0, len(d), 4))


def parties(company, client, signature):
    comp_name, inn, legal_address, bank_name, bik, account, corr, contact, phone, email = company
    client_name, address, client_phone, client_email = client
    contractor = comp_name or contact or 'Исполнитель'
    short = contact or comp_name
    card = f'border:1.2px solid {BORDER};border-radius:10px;overflow:hidden;page-break-inside:avoid;break-inside:avoid'
    head = ('background:#B9A27A;color:#1F1405;padding:7px 12px;font-weight:700;font-size:11.5px;'
            'letter-spacing:.4px;text-transform:uppercase')
    name_row = 'padding:8px 12px 4px;font-weight:700;font-size:13px'
    bank = ''.join([info_row('Расчётный счёт', group4(account), mono=True, hl=True), info_row('Банк', bank_name),
                    info_row('БИК', bik, mono=True), info_row('Корр. счёт', group4(corr), mono=True)])
    ex_rows = ''.join([info_row('ИНН', inn), info_row('Адрес', legal_address), info_row('Телефон', phone), info_row('E-mail', email)])
    if bank:
        ex_rows += ('<tr><td colspan="2" style="padding:8px 12px 3px;font-size:10.5px;font-weight:700;letter-spacing:.4px;'
                    'color:#6B4508;text-transform:uppercase;border-top:1px solid #D9C9A8">Банковские реквизиты</td></tr>' + bank)
    cl_rows = ''.join([info_row('Адрес объекта', address), info_row('Телефон', client_phone), info_row('E-mail', client_email)])
    label = 'margin:0 0 6px;font-size:11.5px;font-weight:700;letter-spacing:.4px;color:#4A2E06'
    box = '<div style="position:relative;height:84px;border-bottom:1.5px solid #5C3A11;margin:0 0 4px">{}</div>'
    client_sig = ''
    if signature:
        client_sig = ('<div style="position:absolute;left:0;bottom:6px;border:2px solid #2e7d32;color:#2e7d32;border-radius:8px;'
                      'padding:6px 10px;font-size:11px;font-weight:700;line-height:1.35">ПОДПИСАНО ЭЛЕКТРОННО<br/>'
                      f'<span style="font-weight:600">{h(signature)}</span></div>')
    return f'''<table style="width:100%;font-size:13px;margin-bottom:12px;border-collapse:collapse"><tr>
<td style="width:50%;vertical-align:top;padding-right:8px"><div style="{card}"><div style="{head}">Исполнитель</div>
<table style="width:100%;border-collapse:collapse"><tr><td colspan="2" style="{name_row}">{h(contractor)}</td></tr>{ex_rows}
<tr><td colspan="2" style="height:6px"></td></tr></table></div></td>
<td style="width:50%;vertical-align:top;padding-left:8px"><div style="{card}"><div style="{head}">Заказчик</div>
<table style="width:100%;border-collapse:collapse"><tr><td colspan="2" style="{name_row}">{h(client_name or '')}</td></tr>{cl_rows}
<tr><td colspan="2" style="height:6px"></td></tr></table></div></td></tr>
<tr style="page-break-inside:avoid;break-inside:avoid">
<td style="width:50%;vertical-align:top;padding:36px 24px 0 0"><p style="{label}">ОТ ИМЕНИ ИСПОЛНИТЕЛЯ</p>{box.format('')}
<p style="margin:0">{h(short or '')}</p><p style="font-size:11px;color:#555;margin:2px 0 0">(подпись)</p></td>
<td style="width:50%;vertical-align:top;padding:36px 0 0 24px"><p style="{label}">ОТ ИМЕНИ ЗАКАЗЧИКА</p>{box.format(client_sig)}
<p style="margin:0">{h(client_name or '')}</p><p style="font-size:11px;color:#555;margin:2px 0 0">(подпись)</p></td>
</tr></table>'''


def build_addendum_html(contract, obj, company, opts, number, add_date, money_words, signature=''):
    '''Собирает допсоглашение из выбранных разделов в фирменном стиле документов'''
    c_number, c_date, c_total = contract
    client_name, address = obj[0], obj[1]
    contractor = company[0] or company[7] or 'Исполнитель'

    items = [it for it in (opts.get('items') or []) if str(it.get('name') or '').strip()]
    removed = [it for it in (opts.get('removed_items') or []) if str(it.get('name') or '').strip()]
    add_sum = round(sum(fnum(it.get('quantity')) * fnum(it.get('price')) for it in items), 2)
    rem_sum = round(sum(fnum(it.get('quantity')) * fnum(it.get('price')) for it in removed), 2)
    old_total = fnum(opts.get('old_total') if opts.get('old_total') not in (None, '') else c_total)
    new_total = round(old_total + add_sum - rem_sum, 2)
    if opts.get('price_mode') == 'manual':
        new_total = fnum(opts.get('new_total'))

    parts = []
    k = 0

    def point(text):
        nonlocal k
        k += 1
        parts.append(dark_block(f'{k}. {text}'))

    if items:
        point('Стороны договорились о выполнении Исполнителем дополнительных работ, не предусмотренных Договором, '
              'в объёме и по стоимости согласно перечню ниже.')
        parts.append(works_table(items, 'Перечень и стоимость дополнительных работ'))
    if removed:
        point('Стороны договорились исключить из объёма работ по Договору работы согласно перечню ниже.')
        parts.append(works_table(removed, 'Перечень исключаемых работ'))
    if items or removed or opts.get('price_mode') == 'manual':
        detail = f'ранее согласованные работы — {fmt(old_total)} руб.'
        if add_sum:
            detail += f', дополнительные работы — {fmt(add_sum)} руб.'
        if rem_sum:
            detail += f', исключённые работы — минус {fmt(rem_sum)} руб.'
        point(f'Цена Договора изменяется и составляет <b>{h(money_words(new_total))}</b>, в том числе {detail}')
        pay = str(opts.get('payment_terms') or '').strip()
        if pay:
            point(h(pay))
    if opts.get('change_deadline') and str(opts.get('new_deadline') or '').strip():
        reason = str(opts.get('deadline_reason') or '').strip()
        point(f'Срок окончания работ по Договору устанавливается: <b>{h(ru_date(opts.get("new_deadline")))}</b>'
              + (f' в связи с {h(reason)}.' if reason else ''))
    for para in [p.strip() for p in str(opts.get('custom_terms') or '').split('\n') if p.strip()]:
        point(h(para))
    point('Во всём остальном, что не предусмотрено настоящим Соглашением, Стороны руководствуются условиями Договора. '
          'Обязательства Сторон, не затронутые настоящим Соглашением, остаются в неизменном виде.')
    point('Настоящее Соглашение является неотъемлемой частью Договора, вступает в силу с момента подписания обеими Сторонами '
          'и составлено в двух экземплярах, имеющих одинаковую юридическую силу.')

    html = f'''<div class="act-doc" style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.55;font-size:13px">
<h2 style="text-align:center;margin:0 0 4px;font-size:18px">ДОПОЛНИТЕЛЬНОЕ СОГЛАШЕНИЕ № {h(str(number))}</h2>
<p style="text-align:center;margin:0;font-size:13px;color:#4A2E06;font-weight:600">к договору подряда № {h(str(c_number))} от {h(ru_date(c_date))}</p>
<table style="width:100%;margin:10px 0 18px;font-size:12.5px;color:#6B4508;font-weight:600"><tr>
<td style="text-align:left">{h(address or '')}</td><td style="text-align:right;white-space:nowrap">{h(ru_date(add_date))}</td></tr></table>
<p>{h(contractor)}, именуемый в дальнейшем «Исполнитель», с одной стороны, и {h(client_name or '')}, именуемый в дальнейшем «Заказчик», с другой стороны,
совместно именуемые «Стороны», заключили настоящее Дополнительное соглашение (далее — «Соглашение») к договору подряда № {h(str(c_number))} от {h(ru_date(c_date))} (далее — «Договор») о нижеследующем:</p>
{''.join(parts)}
<hr style="border:none;border-top:1.5px solid #7A4E10;margin:26px 0 14px" />
{parties(company, (obj[0], obj[1], obj[2] if len(obj) > 2 else '', obj[3] if len(obj) > 3 else ''), signature)}
</div>'''
    return html, new_total


def load_context(cur, company_id, contract_id):
    cur.execute(
        "SELECT c.contract_number, c.contract_date, c.total_amount, c.object_id, o.client_name, o.address, "
        "COALESCE(o.client_phone, ''), COALESCE(o.email, '') "
        "FROM contracts c JOIN objects o ON o.id = c.object_id WHERE c.id = %s AND c.company_id = %s",
        (contract_id, company_id)
    )
    r = cur.fetchone()
    if not r:
        return None
    cur.execute(
        "SELECT name, inn, legal_address, bank_name, bik, account_number, correspondent_account, contact_full_name, phone, email "
        "FROM companies WHERE id = %s", (company_id,)
    )
    comp = tuple(v or '' for v in (cur.fetchone() or ('',) * 10))
    return {'contract': (r[0], r[1], r[2]), 'object_id': r[3], 'obj': (r[4], r[5], r[6], r[7]), 'company': comp}


def next_number(cur, contract_id):
    cur.execute("SELECT COUNT(*) FROM contract_addenda WHERE contract_id = %s", (contract_id,))
    return str(cur.fetchone()[0] + 1)


def handle(cur, conn, user, method, params, body, response, has_object_access, money_words, ip=''):
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

    if method == 'POST' and action == 'sign':
        return client_sign(cur, conn, user, add_id, response, has_object_access, money_words, ip)

    if is_client:
        return response(403, {'error': 'Недостаточно прав'})

    if method == 'DELETE':
        cur.execute("DELETE FROM contract_addenda WHERE id = %s AND company_id = %s", (add_id, company_id))
        conn.commit()
        return response(200, {'success': True})

    contract_id = body.get('contract_id')
    if method == 'PUT' and add_id:
        cur.execute("SELECT contract_id, signed_at FROM contract_addenda WHERE id = %s AND company_id = %s", (add_id, company_id))
        r = cur.fetchone()
        if not r:
            return response(404, {'error': 'Соглашение не найдено'})
        if r[1]:
            return response(400, {'error': 'Заказчик уже подписал соглашение — изменить его нельзя. Составьте новое.'})
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


def client_sign(cur, conn, user, add_id, response, has_object_access, money_words, ip):
    '''Заказчик подписывает допсоглашение онлайн'''
    if user['role'] != 'client':
        return response(403, {'error': 'Подписать может только заказчик'})
    cur.execute(
        "SELECT contract_id, object_id, addendum_number, addendum_date, options, signed_at, total_amount "
        "FROM contract_addenda WHERE id = %s AND company_id = %s",
        (add_id, user['company_id'])
    )
    r = cur.fetchone()
    if not r or not has_object_access(cur, user, r[1]):
        return response(404, {'error': 'Соглашение не найдено'})
    contract_id, object_id, number, add_date, opts, signed_at, total = r
    if signed_at:
        return response(200, {'success': True, 'status': 'signed'})
    ctx = load_context(cur, user['company_id'], contract_id)
    if not ctx:
        return response(404, {'error': 'Договор не найден'})
    cur.execute("SELECT NOW()")
    now = cur.fetchone()[0]
    stamp = f"{user['full_name']}, {now.strftime('%d.%m.%Y %H:%M')}"
    opts = opts if isinstance(opts, dict) else json.loads(opts or '{}')
    html, _ = build_addendum_html(ctx['contract'], ctx['obj'], ctx['company'], opts, number, add_date, money_words, stamp)
    cur.execute(
        "UPDATE contract_addenda SET status = 'signed', signed_at = %s, signed_by = %s, signed_ip = %s, content_html = %s, updated_at = NOW() WHERE id = %s",
        (now, user['user_id'], (ip or '')[:64], html, add_id)
    )
    cur.execute("SELECT object_code FROM objects WHERE id = %s", (object_id,))
    code = (cur.fetchone() or [''])[0]
    cur.execute(
        "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
        (user['company_id'], 'addendum_signed', 'Заказчик подписал допсоглашение',
         f"{user['full_name']} подписал допсоглашение № {number} к договору № {ctx['contract'][0]} по объекту {code}",
         json.dumps({'object_id': object_id, 'contract_id': contract_id, 'addendum_id': int(add_id)}))
    )
    conn.commit()
    return response(200, {'success': True, 'status': 'signed', 'signed_at': now})
