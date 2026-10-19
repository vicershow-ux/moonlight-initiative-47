import re

RULES = [
    ('taxes', r'налог|ндфл|страхов\w* взнос|казначейств|уфк|фнс|пени|госпошлин|усн'),
    ('salary', r'зарплат|заработн|з/п|аванс сотрудник|оплата труда|отпускн|больничн|реестр\w* №'),
    ('rent', r'аренд'),
    ('transport', r'топлив|бензин|дизел|азс|лукойл|роснефть|газпромнефт|татнефт|шелл|shell|такси|яндекс\.?go|транспорт|доставк|грузоперевоз|перевозк|парков|платн\w* дорог|автодор|штраф гибдд'),
    ('tools', r'инструмент|электроинструмент|перфоратор|шуруповерт|болгарк|vseinstrumenti|всеинструменты|220 ?вольт|оборудован'),
    ('materials', r'леруа|lemana|лемана|оби\b|obi\b|петрович|максидом|строймаркет|стройматериал|материал|касторама|бауцентр'),
    ('office', r'связ|мтс|мегафон|билайн|теле2|ростелеком|интернет|хостинг|подписк|программ|1с|канцеляр|офис'),
    ('ads', r'реклам|авито|avito|яндекс\.?директ|директ|таргет|vk ?реклам|продвижен|2гис'),
    ('subcontract', r'субподряд|подряд|выполнен\w* работ|монтаж\w* работ|по договору подряда'),
]
SKIP = r'перевод собственных|между своими счетами|пополнение счета|размещение депозит|возврат депозит|покупка валют|продажа валют'


def guess_category(purpose, payee, bank_category=''):
    text = f'{purpose} {payee}'.lower()
    for cat, rx in RULES:
        if re.search(rx, text):
            return cat
    bc = (bank_category or '').lower()
    if 'tax' in bc or 'budget' in bc:
        return 'taxes'
    if 'salary' in bc:
        return 'salary'
    if 'fuel' in bc or 'transport' in bc:
        return 'transport'
    return ''


def is_internal(purpose):
    return bool(re.search(SKIP, (purpose or '').lower()))


def remembered(cur, cid):
    '''Последний выбор категории и объекта по каждому получателю'''
    cur.execute(
        "SELECT DISTINCT ON (key) key, category, object_id FROM ("
        "  SELECT COALESCE(NULLIF(payee_inn, ''), lower(payee)) AS key, category, object_id, id FROM company_expenses "
        "  WHERE company_id = %s AND bank_operation_id IS NOT NULL"
        ") t WHERE key <> '' ORDER BY key, id DESC",
        (cid,)
    )
    return {k: {'category': c, 'object_id': o} for k, c, o in cur.fetchall()}


def inbox(cur, cid, known):
    '''Списания из выписки, ещё не разнесённые по расходам'''
    cur.execute(
        "SELECT id, operation_date, amount, purpose, payer_name, payer_inn FROM bank_operations "
        "WHERE company_id = %s AND direction = 'debit' AND match_status = 'unmatched' AND expense_id IS NULL "
        "ORDER BY operation_date DESC NULLS LAST, id DESC LIMIT 200",
        (cid,)
    )
    rows = []
    for oid, dt, amount, purpose, name, inn in cur.fetchall():
        if is_internal(purpose):
            continue
        memo = known.get(inn or '') or known.get((name or '').lower()) or {}
        rows.append({
            'id': oid, 'operation_date': dt, 'amount': float(amount or 0), 'purpose': purpose or '',
            'payee': name or '', 'payee_inn': inn or '',
            'category': memo.get('category') or guess_category(purpose, name),
            'object_id': memo.get('object_id'),
            'remembered': bool(memo),
        })
    return rows


def accept(cur, conn, cid, user_id, items, categories):
    '''Разносит выбранные списания в расходы'''
    done = 0
    for it in items or []:
        cat = str(it.get('category') or '')
        if cat not in categories:
            continue
        object_id = it.get('object_id') or None
        if object_id:
            cur.execute("SELECT 1 FROM objects WHERE id = %s AND company_id = %s", (object_id, cid))
            if not cur.fetchone():
                object_id = None
        cur.execute(
            "SELECT id, operation_date, amount, purpose, payer_name, payer_inn FROM bank_operations "
            "WHERE id = %s AND company_id = %s AND direction = 'debit' AND expense_id IS NULL FOR UPDATE",
            (it.get('id'), cid)
        )
        op = cur.fetchone()
        if not op:
            continue
        oid, dt, amount, purpose, name, inn = op
        cur.execute(
            "INSERT INTO company_expenses (company_id, object_id, category, amount, expense_date, description, payee, payee_inn, "
            "created_by, bank_operation_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (cid, object_id, cat, amount, dt.date() if dt else None, (purpose or '')[:1000], (name or '')[:255], inn or '', user_id, oid)
        )
        exp_id = cur.fetchone()[0]
        cur.execute("UPDATE bank_operations SET expense_id = %s, match_status = 'expense' WHERE id = %s", (exp_id, oid))
        done += 1
    conn.commit()
    return done


def skip(cur, conn, cid, ids):
    '''Списание — не расход компании (перевод себе, возврат и т.п.)'''
    cur.execute(
        "UPDATE bank_operations SET match_status = 'ignored' WHERE company_id = %s AND direction = 'debit' "
        "AND expense_id IS NULL AND id = ANY(%s)",
        (cid, [int(i) for i in ids or [] if str(i).isdigit()])
    )
    conn.commit()
