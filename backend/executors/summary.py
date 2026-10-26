from common import response, f

DUE = ("(i.total_amount * CASE WHEN i.vat_mode ~ '^on_top' THEN 1 + COALESCE(NULLIF(substring(i.vat_mode from 'on_top_(\\d+)'), '')::numeric, 20) / 100 "
       "ELSE 1 END)")

CAT_LABELS = {
    'salary': 'Зарплата', 'subcontract': 'Субподряд', 'transport': 'Транспорт', 'tools': 'Инструмент',
    'materials': 'Материалы (вне объекта)', 'rent': 'Аренда', 'taxes': 'Налоги и сборы', 'office': 'Офис и связь',
    'ads': 'Реклама', 'purchases': 'Закупки по чекам', 'other': 'Прочее',
}


def object_summary(cur, user, object_id):
    '''Сводка по объекту: доход (договоры, оплаты заказчика) и расходы (исполнители, чеки, материалы, прочее)'''
    cid = user['company_id']
    cur.execute("SELECT id, object_code, client_name, address FROM objects WHERE id = %s AND company_id = %s",
                (object_id, cid))
    obj = cur.fetchone()
    if not obj:
        return response(404, {'error': 'Объект не найден'})

    cur.execute(
        "SELECT COALESCE(SUM(total_amount), 0) FROM contracts WHERE object_id = %s AND company_id = %s "
        "AND status = 'signed' AND COALESCE(options->>'our_role', '') <> 'customer'",
        (object_id, cid)
    )
    contracted = f(cur.fetchone()[0])
    cur.execute(f"SELECT COALESCE(SUM({DUE}) FILTER (WHERE i.status = 'paid'), 0), "
                f"COALESCE(SUM({DUE}) FILTER (WHERE i.status <> 'paid'), 0) FROM invoices i "
                "WHERE i.object_id = %s AND i.company_id = %s", (object_id, cid))
    paid_inv, outstanding = cur.fetchone()
    cur.execute("SELECT COALESCE(SUM(amount), 0) FROM company_incomes WHERE object_id = %s AND company_id = %s",
                (object_id, cid))
    extra_income = f(cur.fetchone()[0])
    received = round(f(paid_inv) + extra_income, 2)

    cur.execute(
        "SELECT c.id, c.contract_number, c.contract_date, c.total_amount, c.status, c.options, "
        "COALESCE((SELECT SUM(amount) FROM company_expenses e WHERE e.contract_id = c.id AND e.source = 'executor_payment'), 0) "
        "FROM contracts c WHERE c.object_id = %s AND c.company_id = %s AND c.options->>'our_role' = 'customer' "
        "ORDER BY c.contract_date", (object_id, cid)
    )
    executors = []
    for cid_, num, d, total, st, opts, paid in cur.fetchall():
        opts = opts or {}
        t = opts.get('contractor_type')
        name = (opts.get('contractor_org_name') if t == 'legal' else
                (f"ИП {opts.get('contractor_name') or ''}" if t == 'entrepreneur' else opts.get('contractor_name'))) or '—'
        executors.append({'contract_id': cid_, 'contract_number': num, 'contract_date': d, 'name': name.strip(),
                          'work_subject': opts.get('work_subject') or '', 'total': f(total), 'paid': f(paid),
                          'status': st, 'executor_id': opts.get('executor_id')})

    cur.execute(
        "SELECT payee, COALESCE(SUM(amount), 0), COUNT(*) FROM company_expenses "
        "WHERE object_id = %s AND company_id = %s AND source = 'receipt' GROUP BY payee ORDER BY 2 DESC",
        (object_id, cid)
    )
    receipts = [{'shop': p or 'Без магазина', 'amount': f(a), 'count': n} for p, a, n in cur.fetchall()]

    cur.execute(
        "SELECT name, unit, qty, price, qty * price FROM object_materials WHERE object_id = %s AND company_id = %s "
        "ORDER BY qty * price DESC", (object_id, cid)
    )
    materials = [{'name': n, 'unit': u or '', 'qty': f(q), 'price': f(p), 'sum': f(s)} for n, u, q, p, s in cur.fetchall()]

    cur.execute(
        "SELECT category, COALESCE(SUM(amount), 0), COUNT(*) FROM company_expenses "
        "WHERE object_id = %s AND company_id = %s AND source NOT IN ('receipt', 'executor_payment') GROUP BY 1 ORDER BY 2 DESC",
        (object_id, cid)
    )
    other = [{'category': c, 'label': CAT_LABELS.get(c, c), 'amount': f(a), 'count': n} for c, a, n in cur.fetchall()]

    exec_paid = round(sum(e['paid'] for e in executors), 2)
    exec_total = round(sum(e['total'] for e in executors), 2)
    receipts_sum = round(sum(r['amount'] for r in receipts), 2)
    materials_sum = round(sum(m['sum'] for m in materials), 2)
    other_sum = round(sum(o['amount'] for o in other), 2)
    costs = round(exec_paid + receipts_sum + materials_sum + other_sum, 2)
    exec_debt = round(max(0, exec_total - exec_paid), 2)
    base_income = contracted or received
    return response(200, {
        'object': {'id': obj[0], 'object_code': obj[1], 'client_name': obj[2] or '', 'address': obj[3] or ''},
        'income': {'contracted': contracted, 'received': received, 'outstanding': f(outstanding)},
        'executors': executors, 'receipts': receipts, 'materials': materials, 'other': other,
        'totals': {
            'executors_paid': exec_paid, 'executors_total': exec_total, 'executors_debt': exec_debt,
            'receipts': receipts_sum, 'materials': materials_sum, 'other': other_sum, 'costs': costs,
            'profit': round(received - costs, 2),
            'planned_profit': round(base_income - costs - exec_debt, 2),
        },
    })
