import html as html_lib
import json
import re

from common import response, f, display_name

BOX_RE = re.compile(r'(<div style="position:relative;height:84px;[^"]*">)')


def apply_executor_signature(content, stamp, label):
    '''Ставит отметку электронной подписи исполнителя в его поле подписи'''
    mark = ('<div style="position:absolute;left:0;bottom:6px;border:2px solid #2e7d32;color:#2e7d32;border-radius:8px;'
            'padding:6px 10px;font-size:11px;font-weight:700;line-height:1.35;background:#fff;z-index:2">ПОДПИСАНО ЭЛЕКТРОННО<br/>'
            f'<span style="font-weight:600">{html_lib.escape(stamp)}</span></div>')
    idx = content.rfind(label)
    if idx != -1:
        m = BOX_RE.search(content, idx)
        if m:
            return content[:m.end(1)] + mark + content[m.end(1):]
    flat = mark.replace('position:absolute;left:0;bottom:6px;', 'display:inline-block;margin-top:12px;')
    return content + f'<p style="margin-top:16px"><strong>Исполнитель:</strong></p>{flat}'


def my_contract_ids_sql():
    return "SELECT id FROM contracts WHERE company_id = %s AND options->>'executor_id' = %s AND options->>'our_role' = 'customer'"


def portal_documents(cur, ex):
    '''Договоры и акты исполнителя — для просмотра и подписи в кабинете'''
    cid, eid = ex['company_id'], str(ex['id'])
    cur.execute(
        "SELECT c.id, c.object_id, c.contract_number, c.contract_date, c.total_amount, c.executor_signed_at, "
        "c.options->>'work_subject', o.object_code, "
        "COALESCE((SELECT SUM(amount) FROM company_expenses e WHERE e.contract_id = c.id AND e.source = 'executor_payment'), 0) "
        "FROM contracts c JOIN objects o ON o.id = c.object_id "
        "WHERE c.company_id = %s AND c.options->>'executor_id' = %s AND c.options->>'our_role' = 'customer' "
        "ORDER BY c.contract_date DESC", (cid, eid))
    contracts = [{'id': a, 'object_id': b, 'contract_number': c, 'contract_date': d, 'total_amount': f(t),
                  'executor_signed_at': s, 'work_subject': w or '', 'object_code': oc, 'paid': f(p)}
                 for a, b, c, d, t, s, w, oc, p in cur.fetchall()]
    cur.execute(
        "SELECT a.id, a.contract_id, a.object_id, a.act_number, a.act_date, a.total_amount, a.executor_signed_at, "
        "o.object_code, c.contract_number FROM acts a JOIN contracts c ON c.id = a.contract_id JOIN objects o ON o.id = a.object_id "
        f"WHERE a.company_id = %s AND a.contract_id IN ({my_contract_ids_sql()}) ORDER BY a.act_date DESC, a.id DESC",
        (cid, cid, eid))
    acts = [{'id': a, 'contract_id': b, 'object_id': c, 'act_number': d, 'act_date': e, 'total_amount': f(t),
             'executor_signed_at': s, 'object_code': oc, 'contract_number': cn}
            for a, b, c, d, e, t, s, oc, cn in cur.fetchall()]
    return contracts, acts


def portal_document(cur, ex, params):
    kind, doc_id = params.get('kind'), params.get('id')
    cid, eid = ex['company_id'], str(ex['id'])
    if kind == 'contract':
        cur.execute(
            "SELECT id, contract_number, contract_date, total_amount, content_html, executor_signed_at FROM contracts "
            "WHERE id = %s AND company_id = %s AND options->>'executor_id' = %s AND options->>'our_role' = 'customer'",
            (doc_id, cid, eid))
        r = cur.fetchone()
        if not r:
            return response(404, {'error': 'Договор не найден'})
        return response(200, {'kind': 'contract', 'id': r[0], 'number': r[1], 'date': r[2], 'total_amount': f(r[3]),
                              'content_html': r[4] or '', 'executor_signed_at': r[5]})
    if kind == 'act':
        cur.execute(
            "SELECT id, act_number, act_date, total_amount, content_html, executor_signed_at FROM acts "
            f"WHERE id = %s AND company_id = %s AND contract_id IN ({my_contract_ids_sql()})",
            (doc_id, cid, cid, eid))
        r = cur.fetchone()
        if not r:
            return response(404, {'error': 'Акт не найден'})
        return response(200, {'kind': 'act', 'id': r[0], 'number': r[1], 'date': r[2], 'total_amount': f(r[3]),
                              'content_html': r[4] or '', 'executor_signed_at': r[5]})
    return response(400, {'error': 'Неизвестный документ'})


def portal_sign(cur, conn, ex, params, event):
    '''Исполнитель подписывает договор или акт простой электронной подписью из своего кабинета'''
    kind, doc_id = params.get('kind'), params.get('id')
    cid, eid = ex['company_id'], str(ex['id'])
    ip = (((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp') or '')[:64]
    if kind == 'contract':
        cur.execute(
            "SELECT contract_number, executor_signed_at, content_html, object_id FROM contracts "
            "WHERE id = %s AND company_id = %s AND options->>'executor_id' = %s AND options->>'our_role' = 'customer'",
            (doc_id, cid, eid))
        table, label, title_tpl, number_label = 'contracts', 'ОТ ИМЕНИ ПОДРЯДЧИКА', 'Исполнитель подписал договор', 'договор №'
    elif kind == 'act':
        cur.execute(
            "SELECT act_number, executor_signed_at, content_html, object_id FROM acts "
            f"WHERE id = %s AND company_id = %s AND contract_id IN ({my_contract_ids_sql()})",
            (doc_id, cid, cid, eid))
        table, label, title_tpl, number_label = 'acts', 'ОТ ИМЕНИ ИСПОЛНИТЕЛЯ', 'Исполнитель подписал акт', 'акт №'
    else:
        return response(400, {'error': 'Неизвестный документ'})
    r = cur.fetchone()
    if not r:
        return response(404, {'error': 'Документ не найден'})
    number, signed_at, content, object_id = r
    if signed_at:
        return response(200, {'signed': True, 'executor_signed_at': signed_at})
    cur.execute("SELECT NOW()")
    now = cur.fetchone()[0]
    name = display_name(ex)
    stamp = f"{name}, {now.strftime('%d.%m.%Y %H:%M')}"
    signed_html = apply_executor_signature(content or '', stamp, label)
    cur.execute(f"UPDATE {table} SET executor_signed_at = %s, executor_signed_ip = %s, content_html = %s, updated_at = NOW() "
                "WHERE id = %s", (now, ip, signed_html, doc_id))
    cur.execute(
        "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
        (cid, f'executor_{kind}_signed', title_tpl, f"{name} подписал {number_label} {number}",
         json.dumps({'object_id': object_id, f'{kind}_id': int(doc_id)}))
    )
    conn.commit()
    return response(200, {'signed': True, 'executor_signed_at': now})
