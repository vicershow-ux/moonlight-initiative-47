import json
import os
from datetime import date

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


def response(status: int, body):
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
        "SELECT u.id, u.company_id, u.full_name FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'user_name': row[2] or ''}


def to_num(v, default=0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def s(v):
    return (v or '').strip()


CP_FIELDS = [
    'party_kind', 'display_name', 'phone', 'email', 'full_name',
    'passport_series', 'passport_number', 'passport_issued_by',
    'passport_department_code', 'registration_address',
    'org_name', 'inn', 'kpp', 'ogrn', 'legal_address',
    'bank_name', 'bik', 'account_number', 'correspondent_account',
    'director_position', 'director_name', 'acts_basis', 'notes',
]

CP_DATE_FIELDS = ['passport_issued_date', 'birth_date']

CP_COLS = ', '.join(['id'] + CP_FIELDS + CP_DATE_FIELDS + ['created_at'])
CP_KEYS = ['id'] + CP_FIELDS + CP_DATE_FIELDS + ['created_at']

RENTAL_COLS = (
    "r.id, r.direction, r.rental_number, r.counterparty_id, r.warehouse_item_id, "
    "r.warehouse_id, r.object_id, r.item_name, r.unit, r.qty, r.rate, r.rate_period, "
    "r.deposit, r.date_from, r.date_to, r.returned_at, r.returned_qty, r.status, "
    "r.paid_amount, r.condition_note, r.notes, r.created_at"
)

RENTAL_KEYS = [
    'id', 'direction', 'rental_number', 'counterparty_id', 'warehouse_item_id',
    'warehouse_id', 'object_id', 'item_name', 'unit', 'qty', 'rate', 'rate_period',
    'deposit', 'date_from', 'date_to', 'returned_at', 'returned_qty', 'status',
    'paid_amount', 'condition_note', 'notes', 'created_at',
]


def load_counterparties(cur, company_id):
    cur.execute(
        f"SELECT {CP_COLS} FROM rental_counterparties WHERE company_id = %s "
        "ORDER BY display_name",
        (company_id,)
    )
    return [dict(zip(CP_KEYS, r)) for r in cur.fetchall()]


def load_rentals(cur, company_id):
    cur.execute(
        f"SELECT {RENTAL_COLS}, c.display_name, c.party_kind, c.phone, "
        "w.name, o.object_code, "
        "(SELECT rc.id FROM rental_contracts rc WHERE rc.rental_id = r.id "
        "ORDER BY rc.id DESC LIMIT 1) "
        "FROM rentals r "
        "LEFT JOIN rental_counterparties c ON c.id = r.counterparty_id "
        "LEFT JOIN warehouses w ON w.id = r.warehouse_id "
        "LEFT JOIN objects o ON o.id = r.object_id "
        "WHERE r.company_id = %s ORDER BY r.created_at DESC",
        (company_id,)
    )
    keys = RENTAL_KEYS + [
        'counterparty_name', 'counterparty_kind', 'counterparty_phone',
        'warehouse_name', 'object_code', 'contract_id',
    ]
    return [dict(zip(keys, r)) for r in cur.fetchall()]


def load_stock(cur, company_id):
    cur.execute(
        "SELECT i.id, i.name, i.kind, i.unit, i.qty, i.price, i.warehouse_id, w.name "
        "FROM warehouse_items i LEFT JOIN warehouses w ON w.id = i.warehouse_id "
        "WHERE i.company_id = %s AND i.object_id IS NULL AND i.kind IN "
        "('инструмент', 'оборудование') ORDER BY i.name",
        (company_id,)
    )
    keys = ['id', 'name', 'kind', 'unit', 'qty', 'price', 'warehouse_id', 'warehouse_name']
    return [dict(zip(keys, r)) for r in cur.fetchall()]


def load_objects(cur, company_id):
    cur.execute(
        "SELECT id, object_code, client_name, address FROM objects "
        "WHERE company_id = %s ORDER BY created_at DESC",
        (company_id,)
    )
    return [dict(zip(['id', 'object_code', 'client_name', 'address'], r))
            for r in cur.fetchall()]


def next_rental_number(cur, company_id):
    cur.execute(
        "SELECT COUNT(*) FROM rentals WHERE company_id = %s", (company_id,)
    )
    n = (cur.fetchone()[0] or 0) + 1
    return f"АР-{date.today().year}-{n:04d}"


def save_counterparty(cur, company_id, body, cp_id=None):
    values = [s(body.get(f)) for f in CP_FIELDS]
    dates = [body.get(f) or None for f in CP_DATE_FIELDS]

    if cp_id:
        sets = ', '.join(f"{f} = %s" for f in CP_FIELDS + CP_DATE_FIELDS)
        cur.execute(
            f"UPDATE rental_counterparties SET {sets}, updated_at = now() "
            "WHERE id = %s AND company_id = %s RETURNING id",
            (*values, *dates, cp_id, company_id)
        )
        row = cur.fetchone()
        return row[0] if row else None

    cols = ', '.join(CP_FIELDS + CP_DATE_FIELDS)
    marks = ', '.join(['%s'] * (len(CP_FIELDS) + len(CP_DATE_FIELDS)))
    cur.execute(
        f"INSERT INTO rental_counterparties (company_id, {cols}) "
        f"VALUES (%s, {marks}) RETURNING id",
        (company_id, *values, *dates)
    )
    return cur.fetchone()[0]


def move_stock(cur, item_id, company_id, delta):
    if not item_id:
        return
    cur.execute(
        "UPDATE warehouse_items SET qty = GREATEST(qty + %s, 0), updated_at = now() "
        "WHERE id = %s AND company_id = %s",
        (delta, item_id, company_id)
    )


def handler(event: dict, context) -> dict:
    '''Аренда инструмента: выдача и получение техники, контрагенты с паспортными данными и реквизитами, договоры аренды'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    conn = get_conn()
    cur = conn.cursor()

    try:
        user = get_current_user(cur, event)
        if not user:
            return response(401, {'error': 'Не авторизован'})
        company_id = user['company_id']

        params = event.get('queryStringParameters') or {}
        entity = params.get('entity') or 'rental'
        action = params.get('action') or ''
        row_id = params.get('id')

        if method == 'GET':
            if entity == 'contract' and row_id:
                cur.execute(
                    "SELECT id, rental_id, contract_number, contract_date, status, "
                    "options, content_html, total_amount, created_at FROM rental_contracts "
                    "WHERE id = %s AND company_id = %s",
                    (row_id, company_id)
                )
                r = cur.fetchone()
                if not r:
                    return response(404, {'error': 'Договор не найден'})
                keys = ['id', 'rental_id', 'contract_number', 'contract_date', 'status',
                        'options', 'content_html', 'total_amount', 'created_at']
                return response(200, dict(zip(keys, r)))

            return response(200, {
                'rentals': load_rentals(cur, company_id),
                'counterparties': load_counterparties(cur, company_id),
                'stock': load_stock(cur, company_id),
                'objects': load_objects(cur, company_id),
            })

        body = json.loads(event.get('body') or '{}')

        if method == 'POST' and entity == 'counterparty':
            if len(s(body.get('display_name'))) < 2:
                return response(400, {'error': 'Укажите название или ФИО контрагента'})
            new_id = save_counterparty(cur, company_id, body)
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'PUT' and entity == 'counterparty' and row_id:
            if len(s(body.get('display_name'))) < 2:
                return response(400, {'error': 'Укажите название или ФИО контрагента'})
            updated = save_counterparty(cur, company_id, body, row_id)
            if not updated:
                return response(404, {'error': 'Контрагент не найден'})
            conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE' and entity == 'counterparty' and row_id:
            cur.execute(
                "SELECT COUNT(*) FROM rentals WHERE counterparty_id = %s AND company_id = %s",
                (row_id, company_id)
            )
            if (cur.fetchone()[0] or 0) > 0:
                return response(400, {'error': 'По контрагенту есть аренды — сначала закройте их'})
            cur.execute(
                "DELETE FROM rental_counterparties WHERE id = %s AND company_id = %s",
                (row_id, company_id)
            )
            conn.commit()
            return response(200, {'success': True})

        if method == 'POST' and entity == 'rental':
            item_name = s(body.get('item_name'))
            item_id = body.get('warehouse_item_id') or None
            qty = to_num(body.get('qty'), 1)

            if item_id:
                cur.execute(
                    "SELECT name, unit, qty, warehouse_id FROM warehouse_items "
                    "WHERE id = %s AND company_id = %s",
                    (item_id, company_id)
                )
                found = cur.fetchone()
                if not found:
                    return response(404, {'error': 'Позиция склада не найдена'})
                item_name = item_name or found[0]
                if s(body.get('direction') or 'out') == 'out' and to_num(found[2]) < qty:
                    return response(400, {
                        'error': f'На складе только {to_num(found[2]):g} {found[1]} — уменьшите количество'
                    })

            if len(item_name) < 2:
                return response(400, {'error': 'Укажите наименование инструмента'})
            if qty <= 0:
                return response(400, {'error': 'Количество должно быть больше нуля'})

            direction = s(body.get('direction')) or 'out'
            cp_id = body.get('counterparty_id') or None
            if not cp_id and body.get('counterparty'):
                cp_body = body['counterparty']
                if len(s(cp_body.get('display_name'))) < 2:
                    return response(400, {'error': 'Укажите название или ФИО контрагента'})
                cp_id = save_counterparty(cur, company_id, cp_body)

            number = s(body.get('rental_number')) or next_rental_number(cur, company_id)

            cur.execute(
                "INSERT INTO rentals (company_id, direction, rental_number, counterparty_id, "
                "warehouse_item_id, warehouse_id, object_id, item_name, unit, qty, rate, "
                "rate_period, deposit, date_from, date_to, condition_note, notes, created_by) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
                "RETURNING id",
                (company_id, direction, number, cp_id, item_id,
                 body.get('warehouse_id') or None, body.get('object_id') or None,
                 item_name, s(body.get('unit')) or 'шт', qty,
                 to_num(body.get('rate')), s(body.get('rate_period')) or 'day',
                 to_num(body.get('deposit')),
                 body.get('date_from') or date.today().isoformat(),
                 body.get('date_to') or None,
                 s(body.get('condition_note')), s(body.get('notes')), user['user_id'])
            )
            new_id = cur.fetchone()[0]

            if direction == 'out' and item_id:
                move_stock(cur, item_id, company_id, -qty)

            conn.commit()
            return response(200, {'success': True, 'id': new_id, 'rental_number': number})

        if method == 'PUT' and entity == 'rental' and row_id:
            cur.execute(
                "SELECT direction, warehouse_item_id, qty, returned_qty, status "
                "FROM rentals WHERE id = %s AND company_id = %s",
                (row_id, company_id)
            )
            cur_row = cur.fetchone()
            if not cur_row:
                return response(404, {'error': 'Аренда не найдена'})
            direction, item_id, old_qty, returned_qty, status = cur_row

            if action == 'return':
                back = to_num(body.get('qty'), to_num(old_qty) - to_num(returned_qty))
                if back <= 0:
                    return response(400, {'error': 'Количество возврата должно быть больше нуля'})
                total_back = to_num(returned_qty) + back
                if total_back > to_num(old_qty):
                    return response(400, {'error': 'Возврат больше, чем было выдано'})

                new_status = 'returned' if total_back >= to_num(old_qty) else 'active'
                cur.execute(
                    "UPDATE rentals SET returned_qty = %s, status = %s, "
                    "returned_at = CASE WHEN %s = 'returned' THEN now() ELSE returned_at END, "
                    "condition_note = COALESCE(NULLIF(%s, ''), condition_note), updated_at = now() "
                    "WHERE id = %s AND company_id = %s",
                    (total_back, new_status, new_status,
                     s(body.get('condition_note')), row_id, company_id)
                )
                if direction == 'out' and item_id:
                    move_stock(cur, item_id, company_id, back)
                conn.commit()
                return response(200, {'success': True, 'status': new_status})

            fields = []
            values = []
            for f in ['item_name', 'unit', 'rate_period', 'condition_note', 'notes', 'status']:
                if f in body:
                    fields.append(f"{f} = %s")
                    values.append(s(body.get(f)))
            for f in ['qty', 'rate', 'deposit', 'paid_amount']:
                if f in body:
                    fields.append(f"{f} = %s")
                    values.append(to_num(body.get(f)))
            for f in ['date_from', 'date_to', 'object_id', 'counterparty_id']:
                if f in body:
                    fields.append(f"{f} = %s")
                    values.append(body.get(f) or None)

            if not fields:
                return response(400, {'error': 'Нет данных для обновления'})

            if 'qty' in body and direction == 'out' and item_id and status == 'active':
                delta = to_num(old_qty) - to_num(body.get('qty'))
                move_stock(cur, item_id, company_id, delta)

            cur.execute(
                f"UPDATE rentals SET {', '.join(fields)}, updated_at = now() "
                "WHERE id = %s AND company_id = %s",
                (*values, row_id, company_id)
            )
            conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE' and entity == 'rental' and row_id:
            cur.execute(
                "SELECT direction, warehouse_item_id, qty, returned_qty, status "
                "FROM rentals WHERE id = %s AND company_id = %s",
                (row_id, company_id)
            )
            r = cur.fetchone()
            if not r:
                return response(404, {'error': 'Аренда не найдена'})
            direction, item_id, qty, returned_qty, status = r

            if direction == 'out' and item_id and status == 'active':
                move_stock(cur, item_id, company_id, to_num(qty) - to_num(returned_qty))

            cur.execute("DELETE FROM rental_contracts WHERE rental_id = %s AND company_id = %s",
                        (row_id, company_id))
            cur.execute("DELETE FROM rentals WHERE id = %s AND company_id = %s",
                        (row_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        if method == 'POST' and entity == 'contract':
            rental_id = body.get('rental_id')
            if not rental_id:
                return response(400, {'error': 'Не указана аренда'})
            cur.execute(
                "SELECT id FROM rentals WHERE id = %s AND company_id = %s",
                (rental_id, company_id)
            )
            if not cur.fetchone():
                return response(404, {'error': 'Аренда не найдена'})

            cur.execute(
                "INSERT INTO rental_contracts (company_id, rental_id, contract_number, "
                "contract_date, status, options, content_html, total_amount, created_by) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, rental_id, s(body.get('contract_number')),
                 body.get('contract_date') or date.today().isoformat(),
                 s(body.get('status')) or 'draft',
                 json.dumps(body.get('options') or {}),
                 body.get('content_html') or '',
                 to_num(body.get('total_amount')), user['user_id'])
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'PUT' and entity == 'contract' and row_id:
            cur.execute(
                "UPDATE rental_contracts SET contract_number = %s, contract_date = %s, "
                "status = %s, options = %s, content_html = %s, total_amount = %s, "
                "updated_at = now() WHERE id = %s AND company_id = %s RETURNING id",
                (s(body.get('contract_number')),
                 body.get('contract_date') or date.today().isoformat(),
                 s(body.get('status')) or 'draft',
                 json.dumps(body.get('options') or {}),
                 body.get('content_html') or '',
                 to_num(body.get('total_amount')), row_id, company_id)
            )
            if not cur.fetchone():
                return response(404, {'error': 'Договор не найден'})
            conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE' and entity == 'contract' and row_id:
            cur.execute("DELETE FROM rental_contracts WHERE id = %s AND company_id = %s",
                        (row_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(400, {'error': 'Неизвестный запрос'})

    except Exception as e:
        conn.rollback()
        return response(500, {'error': str(e)})
    finally:
        cur.close()
        conn.close()
