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
        "SELECT u.id, u.company_id, u.role, u.full_name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2], 'full_name': row[3]}


def has_object_access(cur, user, object_id):
    if user['role'] != 'client':
        return True
    cur.execute(
        "SELECT 1 FROM object_access WHERE user_id = %s AND object_id = %s",
        (user['user_id'], object_id)
    )
    return cur.fetchone() is not None


ESTIMATE_KEYS = [
    'id', 'object_id', 'total_amount', 'created_at',
    'contract_number', 'contract_date', 'discount_percent', 'discount_amount',
    'notes', 'subtotal_amount', 'status', 'revision_number', 'created_by',
]


def handler(event: dict, context) -> dict:
    '''Создание и просмотр смет по объектам с позициями услуг, группировкой по помещениям, скидками, статусами стадий и заявками заказчиков на доп. работы'''
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
        is_client = user['role'] == 'client'

        params = event.get('queryStringParameters') or {}
        estimate_id = params.get('id')
        object_id = params.get('object_id')
        item_id = params.get('item_id')
        action = params.get('action')

        if method == 'GET':
            if estimate_id:
                cur.execute(
                    f"SELECT {', '.join(ESTIMATE_KEYS)} FROM estimates WHERE id = %s AND company_id = %s",
                    (estimate_id, company_id)
                )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Смета не найдена'})
                estimate = dict(zip(ESTIMATE_KEYS, row))

                if not has_object_access(cur, user, estimate['object_id']):
                    return response(403, {'error': 'Недостаточно прав'})

                cur.execute(
                    "SELECT o.object_code, o.client_name, o.client_phone, o.email, o.object_type, o.area "
                    "FROM objects o WHERE o.id = %s",
                    (estimate['object_id'],)
                )
                obj_row = cur.fetchone()
                if obj_row:
                    obj_keys = ['object_code', 'client_name', 'client_phone', 'email', 'object_type', 'area']
                    estimate.update(dict(zip(obj_keys, obj_row)))

                if estimate.get('created_by'):
                    cur.execute("SELECT full_name, phone, email FROM users WHERE id = %s", (estimate['created_by'],))
                    creator_row = cur.fetchone()
                    if creator_row:
                        estimate['created_by_name'] = creator_row[0]
                        estimate['created_by_phone'] = creator_row[1]
                        estimate['created_by_email'] = creator_row[2]

                cur.execute("SELECT c.name FROM companies c WHERE c.id = %s", (company_id,))
                company_row = cur.fetchone()
                estimate['company_name'] = company_row[0] if company_row else ''

                cur.execute(
                    "SELECT id, total_amount, created_at, revision_number, status FROM estimates WHERE object_id = %s AND company_id = %s ORDER BY revision_number DESC",
                    (estimate['object_id'], company_id)
                )
                rev_keys = ['id', 'total_amount', 'created_at', 'revision_number', 'status']
                estimate['revisions'] = [dict(zip(rev_keys, r)) for r in cur.fetchall()]

                cur.execute(
                    "SELECT ei.id, ei.name, ei.unit, ei.price, ei.quantity, ei.times, ei.discount_percent, ei.amount, ei.status, ei.proposed_by, u.full_name, ei.room_id, ei.room_name, ei.category, ei.subcategory "
                    "FROM estimate_items ei LEFT JOIN users u ON u.id = ei.proposed_by WHERE ei.estimate_id = %s ORDER BY ei.room_id NULLS FIRST, ei.id",
                    (estimate_id,)
                )
                item_keys = ['id', 'name', 'unit', 'price', 'quantity', 'times', 'discount_percent', 'amount', 'status', 'proposed_by', 'proposed_by_name', 'room_id', 'room_name', 'category', 'subcategory']
                estimate['items'] = [dict(zip(item_keys, r)) for r in cur.fetchall()]
                return response(200, estimate)

            if object_id:
                if not has_object_access(cur, user, object_id):
                    return response(403, {'error': 'Недостаточно прав'})
                cur.execute(
                    f"SELECT {', '.join(ESTIMATE_KEYS)} FROM estimates WHERE object_id = %s AND company_id = %s ORDER BY revision_number DESC",
                    (object_id, company_id)
                )
                rows = cur.fetchall()
                return response(200, {'estimates': [dict(zip(ESTIMATE_KEYS, r)) for r in rows]})

            base_cols = ', '.join(f'e.{k}' for k in ESTIMATE_KEYS)
            if is_client:
                cur.execute(
                    f"SELECT {base_cols}, o.object_code, o.client_name, o.object_type, o.area, EXISTS(SELECT 1 FROM estimate_items ei WHERE ei.estimate_id = e.id AND ei.status = 'pending') FROM estimates e JOIN object_access oa ON oa.object_id = e.object_id JOIN objects o ON o.id = e.object_id WHERE e.company_id = %s AND oa.user_id = %s ORDER BY e.created_at DESC",
                    (company_id, user['user_id'])
                )
            else:
                cur.execute(
                    f"SELECT {base_cols}, o.object_code, o.client_name, o.object_type, o.area, EXISTS(SELECT 1 FROM estimate_items ei WHERE ei.estimate_id = e.id AND ei.status = 'pending') FROM estimates e JOIN objects o ON o.id = e.object_id WHERE e.company_id = %s ORDER BY e.created_at DESC",
                    (company_id,)
                )
            rows = cur.fetchall()
            keys = ESTIMATE_KEYS + ['object_code', 'client_name', 'object_type', 'area', 'has_pending']
            return response(200, {'estimates': [dict(zip(keys, r)) for r in rows]})

        if method == 'POST' and action == 'propose':
            body = json.loads(event.get('body') or '{}')
            est_id = body.get('estimate_id')
            name = (body.get('name') or '').strip()
            unit = (body.get('unit') or 'м²').strip()
            price = float(body.get('price') or 0)
            quantity = float(body.get('quantity') or 0)

            if not is_client:
                return response(403, {'error': 'Доступно только заказчику'})
            if not est_id or not name or quantity <= 0:
                return response(400, {'error': 'Заполните все поля позиции'})

            cur.execute("SELECT object_id FROM estimates WHERE id = %s AND company_id = %s", (est_id, company_id))
            est_row = cur.fetchone()
            if not est_row:
                return response(404, {'error': 'Смета не найдена'})
            if not has_object_access(cur, user, est_row[0]):
                return response(403, {'error': 'Недостаточно прав'})

            amount = round(price * quantity, 2)
            cur.execute(
                "INSERT INTO estimate_items (estimate_id, name, unit, price, quantity, amount, status, proposed_by) VALUES (%s, %s, %s, %s, %s, %s, 'pending', %s) RETURNING id",
                (est_id, name, unit, price, quantity, amount, user['user_id'])
            )
            new_item_id = cur.fetchone()[0]

            cur.execute(
                "SELECT object_code, client_name FROM objects WHERE id = %s",
                (est_row[0],)
            )
            obj_row = cur.fetchone()
            obj_label = obj_row[0] if obj_row else ''

            cur.execute(
                "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
                (
                    company_id, 'estimate_proposal',
                    'Новая позиция от заказчика',
                    f'{user["full_name"]} предложил добавить «{name}» в смету по объекту {obj_label}',
                    json.dumps({'estimate_id': est_id, 'item_id': new_item_id, 'object_id': est_row[0]})
                )
            )

            conn.commit()

            return response(200, {'id': new_item_id, 'status': 'pending'})

        if method == 'PUT' and action in ('approve', 'reject'):
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not item_id:
                return response(400, {'error': 'Не указан id позиции'})

            cur.execute(
                "SELECT ei.estimate_id, ei.amount FROM estimate_items ei JOIN estimates e ON e.id = ei.estimate_id WHERE ei.id = %s AND e.company_id = %s",
                (item_id, company_id)
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Позиция не найдена'})
            est_id, amount = row

            new_status = 'approved' if action == 'approve' else 'rejected'
            cur.execute("UPDATE estimate_items SET status = %s WHERE id = %s", (new_status, item_id))

            cur.execute(
                "UPDATE estimates SET total_amount = (SELECT COALESCE(SUM(amount), 0) FROM estimate_items WHERE estimate_id = %s AND status = 'approved') WHERE id = %s",
                (est_id, est_id)
            )
            conn.commit()

            return response(200, {'success': True, 'status': new_status})

        if method == 'PUT' and action == 'set_status':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not estimate_id:
                return response(400, {'error': 'Не указан id сметы'})

            body = json.loads(event.get('body') or '{}')
            new_status = (body.get('status') or '').strip()
            if new_status not in ('draft', 'ready'):
                return response(400, {'error': 'Недопустимый статус'})

            cur.execute(
                "UPDATE estimates SET status = %s WHERE id = %s AND company_id = %s RETURNING id",
                (new_status, estimate_id, company_id)
            )
            if not cur.fetchone():
                return response(404, {'error': 'Смета не найдена'})
            conn.commit()

            return response(200, {'success': True, 'status': new_status})

        if method == 'POST':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})

            body = json.loads(event.get('body') or '{}')
            obj_id = body.get('object_id')
            items = body.get('items') or []
            contract_number = (body.get('contract_number') or '').strip()
            contract_date = body.get('contract_date') or None
            discount_percent = float(body.get('discount_percent') or 0)
            discount_amount_input = float(body.get('discount_amount') or 0)
            notes = (body.get('notes') or '').strip()

            if not obj_id:
                return response(400, {'error': 'Не указан объект'})
            if not items:
                return response(400, {'error': 'Добавьте хотя бы одну позицию сметы'})

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (obj_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            subtotal = 0
            clean_items = []
            for it in items:
                name = (it.get('name') or '').strip()
                unit = (it.get('unit') or 'м²').strip()
                price = float(it.get('price') or 0)
                quantity = float(it.get('quantity') or 0)
                times = float(it.get('times') or 1)
                item_discount = float(it.get('discount_percent') or 0)
                if not name or quantity <= 0:
                    continue
                amount = round(price * quantity * times * (1 - item_discount / 100), 2)
                subtotal += amount
                clean_items.append({
                    'service_id': it.get('service_id'),
                    'name': name, 'unit': unit, 'price': price,
                    'quantity': quantity, 'times': times, 'discount_percent': item_discount,
                    'amount': amount,
                    'room_id': it.get('room_id'),
                    'room_name': (it.get('room_name') or '').strip(),
                    'category': (it.get('category') or '').strip(),
                    'subcategory': (it.get('subcategory') or '').strip(),
                })

            if not clean_items:
                return response(400, {'error': 'Добавьте хотя бы одну корректную позицию'})

            discount_amount = discount_amount_input
            if discount_percent > 0:
                discount_amount = round(subtotal * discount_percent / 100, 2)
            total = max(0, round(subtotal - discount_amount, 2))

            cur.execute(
                "SELECT COALESCE(MAX(revision_number), 0) FROM estimates WHERE object_id = %s AND company_id = %s",
                (obj_id, company_id)
            )
            next_revision = (cur.fetchone()[0] or 0) + 1

            cur.execute(
                "INSERT INTO estimates (company_id, object_id, total_amount, subtotal_amount, contract_number, contract_date, discount_percent, discount_amount, notes, revision_number, created_by) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id, created_at",
                (company_id, obj_id, total, subtotal, contract_number, contract_date, discount_percent, discount_amount, notes, next_revision, user['user_id'])
            )
            new_id, created_at = cur.fetchone()

            for it in clean_items:
                cur.execute(
                    "INSERT INTO estimate_items (estimate_id, service_id, name, unit, price, quantity, times, discount_percent, amount, status, room_id, room_name, category, subcategory) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'approved', %s, %s, %s, %s)",
                    (new_id, it['service_id'], it['name'], it['unit'], it['price'], it['quantity'], it['times'], it['discount_percent'], it['amount'], it['room_id'], it['room_name'], it['category'], it['subcategory'])
                )

            conn.commit()

            return response(200, {
                'id': new_id, 'object_id': obj_id, 'total_amount': total, 'subtotal_amount': subtotal,
                'contract_number': contract_number, 'contract_date': contract_date,
                'discount_percent': discount_percent, 'discount_amount': discount_amount, 'notes': notes,
                'created_at': created_at, 'items': clean_items, 'revision_number': next_revision, 'status': 'draft'
            })

        if method == 'DELETE':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not estimate_id:
                return response(400, {'error': 'Не указан id сметы'})
            cur.execute("DELETE FROM estimate_items WHERE estimate_id = %s", (estimate_id,))
            cur.execute("DELETE FROM estimates WHERE id = %s AND company_id = %s", (estimate_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
