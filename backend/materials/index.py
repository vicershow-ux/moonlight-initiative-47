import json
import os

import re
import html as html_lib
import psycopg2
from mailer import send_document_email


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
        "SELECT u.id, u.company_id, u.role FROM sessions s JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2]}


FIELDS = ['name', 'category', 'unit', 'price', 'shop_name', 'shop_address',
          'shop_phone', 'shop_url', 'note', 'consumption', 'consumption_unit',
          'consumption_mode']

KEYS = ['id'] + FIELDS + ['created_at']

COLS = 'id, ' + ', '.join(FIELDS) + ', created_at'

OFFER_FIELDS = ['shop_name', 'shop_address', 'shop_phone', 'shop_url',
                'price', 'stock', 'stock_known', 'note']

OFFER_KEYS = ['id', 'material_id'] + OFFER_FIELDS + ['checked_at']

OFFER_COLS = 'id, material_id, ' + ', '.join(OFFER_FIELDS) + ', checked_at'


def to_num(v, default=0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def has_offers_table(cur):
    """Проверяет, создана ли таблица магазинов.

    На своём сервере таблица появляется после обновления базы. Пока её нет,
    справочник должен работать по-старому, а не падать с ошибкой.
    """
    cur.execute(
        "SELECT to_regclass('public.material_offers') IS NOT NULL"
    )
    row = cur.fetchone()
    return bool(row and row[0])


def sync_material_best(cur, material_id, company_id):
    """Записывает в материал самое выгодное предложение из магазинов.

    Берём минимальную цену среди тех магазинов, где товар есть в наличии.
    Если наличие нигде не указано — просто минимальную цену.
    Так старые сметы и расчёты продолжают видеть привычные поля материала.
    """
    cur.execute(
        "SELECT shop_name, shop_address, shop_phone, shop_url, price FROM material_offers "
        "WHERE material_id = %s AND company_id = %s AND price > 0 "
        "ORDER BY (stock_known AND stock <= 0), price ASC, id ASC LIMIT 1",
        (material_id, company_id)
    )
    best = cur.fetchone()
    if not best:
        return
    cur.execute(
        "UPDATE materials SET shop_name = %s, shop_address = %s, shop_phone = %s, "
        "shop_url = %s, price = %s, updated_at = now() WHERE id = %s AND company_id = %s",
        (best[0], best[1], best[2], best[3], best[4], material_id, company_id)
    )


def build_doc_email(brand, phones, client_name, label, note):
    e = html_lib.escape
    greet = f'Здравствуйте, {client_name}!' if client_name else 'Здравствуйте!'
    note_html = f'<p style="margin:0 0 14px;white-space:pre-line">{e(note)}</p>' if note else ''
    html_body = f'''<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#161616">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#5C3A11;padding:18px 24px;color:#fff;font-size:18px;font-weight:bold">{e(brand)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{e(greet)}</p>
<p style="margin:0 0 14px">Направляем вам {e(label)}. Файл приложен к письму в формате PDF — в нём перечень материалов с ценами и магазинами.</p>
{note_html}
<p style="margin:0 0 14px">Если появятся вопросы — просто ответьте на это письмо.</p>
<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777">С уважением, {e(brand)}{('<br/>' + e(phones)) if phones else ''}</p>
</td></tr></table></body></html>'''
    text_body = f"{greet}\n\nНаправляем вам {label}. Файл приложен к письму.\n\n{note}\n\nС уважением, {brand}\n{phones}"
    return html_body, text_body


def handler(event: dict, context) -> dict:
    '''Справочник материалов: цены, магазины и адреса поставщиков'''
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
        row_id = params.get('id')
        entity = params.get('entity') or 'material'
        is_client = user.get('role') == 'client'
        if is_client and method != 'GET':
            return response(403, {'error': 'Недостаточно прав'})
        client_cond = " AND me.object_id IN (SELECT object_id FROM object_access WHERE user_id = %s)" if is_client else ""
        client_args = [user['user_id']] if is_client else []

        if is_client and method == 'GET' and not row_id:
            cur.execute(
                "SELECT me.id, me.object_id, me.title, me.room_names, me.total_amount, "
                "me.created_at, o.object_code, o.client_name "
                "FROM material_estimates me JOIN objects o ON o.id = me.object_id "
                f"WHERE me.company_id = %s{client_cond} ORDER BY me.created_at DESC",
                [company_id] + client_args
            )
            ekeys = ['id', 'object_id', 'title', 'room_names', 'total_amount',
                     'created_at', 'object_code', 'client_name']
            estimates = [dict(zip(ekeys, r)) for r in cur.fetchall()]
            cur.execute(
                "SELECT om.id, om.object_id, om.material_id, om.name, om.unit, om.qty, "
                "om.price, om.shop_name, om.note, om.created_at, om.room_id, om.room_name, om.work_type "
                "FROM object_materials om WHERE om.company_id = %s "
                "AND om.object_id IN (SELECT object_id FROM object_access WHERE user_id = %s) ORDER BY om.created_at DESC",
                (company_id, user['user_id'])
            )
            mkeys = ['id', 'object_id', 'material_id', 'name', 'unit', 'qty',
                     'price', 'shop_name', 'note', 'created_at', 'room_id', 'room_name', 'work_type']
            object_materials = [dict(zip(mkeys, r)) for r in cur.fetchall()]
            return response(200, {'materials': [], 'objects': [], 'object_materials': object_materials,
                                  'rooms': [], 'estimates': estimates})

        if method == 'POST' and entity == 'estimate' and params.get('action') == 'send_email':
            if user.get('role') == 'client':
                return response(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            to_email = (body.get('email') or '').strip()
            pdf_b64 = body.get('pdf_base64') or ''
            if not row_id:
                return response(400, {'error': 'Не указан документ'})
            if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', to_email):
                return response(400, {'error': 'Укажите корректный email заказчика'})
            if not pdf_b64:
                return response(400, {'error': 'Нет файла документа'})
            if len(pdf_b64) > 9_000_000:
                return response(400, {'error': 'Файл слишком большой для отправки'})
            cur.execute(
                "SELECT me.id, o.client_name, o.object_code FROM material_estimates me "
                "JOIN objects o ON o.id = me.object_id WHERE me.id = %s AND me.company_id = %s",
                (row_id, company_id)
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Смета не найдена'})
            cur.execute("SELECT name, phone, email, website FROM companies WHERE id = %s", (company_id,))
            comp = cur.fetchone() or ('', '', '', '')
            brand = comp[0] or 'FixKey'
            phones = ' · '.join(x for x in comp[1:] if x)
            label = f'смету на материалы № {row[0]}'
            note = (body.get('message') or '').strip()[:2000]
            html_body, text_body = build_doc_email(brand, phones, row[1], label, note)
            ok, err = send_document_email(
                to_email, f'Смета на материалы № {row[0]}', html_body, text_body, pdf_b64,
                f'Смета_материалы_{row[0]}.pdf', brand, comp[2] or ''
            )
            if not ok:
                return response(502, {'error': err})
            return response(200, {'success': True})

        if method == 'GET' and entity == 'estimate' and row_id:
            cur.execute(
                "SELECT me.id, me.object_id, me.title, me.room_names, me.total_amount, "
                "me.items_json, me.created_at, o.object_code, o.client_name, o.address "
                "FROM material_estimates me JOIN objects o ON o.id = me.object_id "
                f"WHERE me.id = %s AND me.company_id = %s{client_cond}",
                [row_id, company_id] + client_args
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Смета не найдена'})
            return response(200, {
                'estimate': {
                    'id': row[0], 'object_id': row[1], 'title': row[2],
                    'room_names': row[3], 'total_amount': row[4],
                    'items': json.loads(row[5] or '[]'), 'created_at': row[6],
                    'object_code': row[7], 'client_name': row[8], 'address': row[9],
                }
            })

        if method == 'GET':
            cur.execute(
                f"SELECT {COLS} FROM materials WHERE company_id = %s AND is_archived = false ORDER BY created_at DESC",
                (company_id,)
            )
            materials = [dict(zip(KEYS, r)) for r in cur.fetchall()]

            by_material = {}
            if has_offers_table(cur):
                cur.execute(
                    f"SELECT {OFFER_COLS} FROM material_offers WHERE company_id = %s "
                    "ORDER BY price ASC, id ASC",
                    (company_id,)
                )
                for r in cur.fetchall():
                    off = dict(zip(OFFER_KEYS, r))
                    by_material.setdefault(off['material_id'], []).append(off)
            for m in materials:
                m['offers'] = by_material.get(m['id'], [])

            cur.execute(
                "SELECT id, object_code, client_name, address FROM objects "
                "WHERE company_id = %s ORDER BY created_at DESC",
                (company_id,)
            )
            okeys = ['id', 'object_code', 'client_name', 'address']
            objects = [dict(zip(okeys, r)) for r in cur.fetchall()]

            cur.execute(
                "SELECT om.id, om.object_id, om.material_id, om.name, om.unit, om.qty, "
                "om.price, om.shop_name, om.note, om.created_at, om.room_id, om.room_name, "
                "om.work_type "
                "FROM object_materials om WHERE om.company_id = %s ORDER BY om.created_at DESC",
                (company_id,)
            )
            mkeys = ['id', 'object_id', 'material_id', 'name', 'unit', 'qty',
                     'price', 'shop_name', 'note', 'created_at', 'room_id', 'room_name',
                     'work_type']
            object_materials = [dict(zip(mkeys, r)) for r in cur.fetchall()]

            cur.execute(
                "SELECT r.id, r.object_id, r.name, r.room_type, r.area, r.perimeter, "
                "r.ceiling_height, r.wall_area FROM object_rooms r "
                "JOIN objects o ON o.id = r.object_id "
                "WHERE o.company_id = %s ORDER BY r.id",
                (company_id,)
            )
            rkeys = ['id', 'object_id', 'name', 'room_type', 'area', 'perimeter',
                     'ceiling_height', 'wall_area']
            rooms = [dict(zip(rkeys, r)) for r in cur.fetchall()]

            cur.execute(
                "SELECT me.id, me.object_id, me.title, me.room_names, me.total_amount, "
                "me.created_at, o.object_code, o.client_name "
                "FROM material_estimates me JOIN objects o ON o.id = me.object_id "
                "WHERE me.company_id = %s ORDER BY me.created_at DESC",
                (company_id,)
            )
            ekeys = ['id', 'object_id', 'title', 'room_names', 'total_amount',
                     'created_at', 'object_code', 'client_name']
            estimates = [dict(zip(ekeys, r)) for r in cur.fetchall()]

            return response(200, {
                'materials': materials,
                'objects': objects,
                'object_materials': object_materials,
                'rooms': rooms,
                'estimates': estimates,
            })

        body = json.loads(event.get('body') or '{}')

        if entity == 'offer':
            if not has_offers_table(cur):
                return response(400, {
                    'error': 'Раздел магазинов ещё не готов — обновите базу данных сервера'
                })
            if method == 'POST':
                material_id = body.get('material_id')
                if not material_id:
                    return response(400, {'error': 'Не указан материал'})
                cur.execute("SELECT id FROM materials WHERE id = %s AND company_id = %s",
                            (material_id, company_id))
                if not cur.fetchone():
                    return response(404, {'error': 'Материал не найден'})
                cur.execute(
                    "INSERT INTO material_offers (company_id, material_id, shop_name, "
                    "shop_address, shop_phone, shop_url, price, stock, stock_known, note) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                    (company_id, material_id,
                     (body.get('shop_name') or '').strip(),
                     (body.get('shop_address') or '').strip(),
                     (body.get('shop_phone') or '').strip(),
                     (body.get('shop_url') or '').strip(),
                     to_num(body.get('price')),
                     to_num(body.get('stock')),
                     bool(body.get('stock_known')),
                     (body.get('note') or '').strip())
                )
                new_id = cur.fetchone()[0]
                sync_material_best(cur, material_id, company_id)
                conn.commit()
                return response(200, {'id': new_id})

            if method == 'PUT':
                if not row_id:
                    return response(400, {'error': 'Не указан магазин'})
                fields = []
                values = []
                for key in OFFER_FIELDS:
                    if key in body:
                        fields.append(f"{key} = %s")
                        if key in ('price', 'stock'):
                            values.append(to_num(body[key]))
                        elif key == 'stock_known':
                            values.append(bool(body[key]))
                        else:
                            values.append(body[key])
                if not fields:
                    return response(400, {'error': 'Нет данных для сохранения'})
                values.extend([row_id, company_id])
                cur.execute(
                    f"UPDATE material_offers SET {', '.join(fields)}, "
                    "checked_at = now(), updated_at = now() "
                    "WHERE id = %s AND company_id = %s RETURNING material_id",
                    values
                )
                res = cur.fetchone()
                if not res:
                    return response(404, {'error': 'Магазин не найден'})
                sync_material_best(cur, res[0], company_id)
                conn.commit()
                return response(200, {'ok': True})

            if method == 'DELETE':
                if not row_id:
                    return response(400, {'error': 'Не указан магазин'})
                cur.execute(
                    "SELECT material_id FROM material_offers WHERE id = %s AND company_id = %s",
                    (row_id, company_id)
                )
                res = cur.fetchone()
                if not res:
                    return response(404, {'error': 'Магазин не найден'})
                cur.execute("DELETE FROM material_offers WHERE id = %s AND company_id = %s",
                            (row_id, company_id))
                sync_material_best(cur, res[0], company_id)
                conn.commit()
                return response(200, {'ok': True})

        if method == 'POST' and entity == 'object_material':
            object_id = body.get('object_id')
            if not object_id:
                return response(400, {'error': 'Выберите объект'})
            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s",
                        (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            material_id = body.get('material_id') or None
            name = (body.get('name') or '').strip()
            unit = (body.get('unit') or 'шт').strip()
            price = to_num(body.get('price'))
            shop_name = (body.get('shop_name') or '').strip()

            if material_id:
                cur.execute(
                    "SELECT name, unit, price, shop_name FROM materials "
                    "WHERE id = %s AND company_id = %s",
                    (material_id, company_id)
                )
                m = cur.fetchone()
                if not m:
                    return response(404, {'error': 'Материал не найден в справочнике'})
                name = name or m[0]
                unit = m[1]
                if not body.get('price'):
                    price = float(m[2])
                shop_name = shop_name or m[3]

            if len(name) < 2:
                return response(400, {'error': 'Выберите материал из справочника'})

            qty = to_num(body.get('qty'))
            if qty <= 0:
                return response(400, {'error': 'Укажите количество больше нуля'})

            room_id = body.get('room_id') or None
            room_name = (body.get('room_name') or '').strip()
            note = (body.get('note') or '').strip()
            work_type = (body.get('work_type') or '').strip()

            if body.get('merge') and material_id and room_id:
                cur.execute(
                    "SELECT id, qty FROM object_materials WHERE company_id = %s AND object_id = %s "
                    "AND material_id = %s AND room_id = %s AND work_type = %s LIMIT 1",
                    (company_id, object_id, material_id, room_id, work_type)
                )
                existing = cur.fetchone()
                if existing:
                    cur.execute(
                        "UPDATE object_materials SET qty = qty + %s, price = %s, note = %s "
                        "WHERE id = %s",
                        (qty, price, note, existing[0])
                    )
                    conn.commit()
                    return response(200, {
                        'success': True,
                        'id': existing[0],
                        'merged': True,
                        'qty': float(existing[1]) + qty,
                    })

            cur.execute(
                "INSERT INTO object_materials (company_id, object_id, material_id, name, unit, "
                "qty, price, shop_name, note, room_id, room_name, work_type) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, object_id, material_id, name, unit, qty, price, shop_name,
                 note, room_id, room_name, work_type)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'PUT' and entity == 'object_material':
            if not row_id:
                return response(400, {'error': 'Не указана запись'})
            fields = []
            values = []
            for key in ['name', 'unit', 'qty', 'price', 'shop_name', 'note',
                        'object_id', 'work_type', 'room_id', 'room_name', 'material_id']:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(to_num(body[key]) if key in ('qty', 'price') else body[key])
            if fields:
                values.extend([row_id, company_id])
                cur.execute(
                    f"UPDATE object_materials SET {', '.join(fields)} "
                    "WHERE id = %s AND company_id = %s",
                    values
                )
                conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE' and entity == 'object_material':
            if not row_id:
                return response(400, {'error': 'Не указана запись'})
            cur.execute(
                "DELETE FROM object_materials WHERE id = %s AND company_id = %s",
                (row_id, company_id)
            )
            conn.commit()
            return response(200, {'success': True})

        if method == 'POST' and entity == 'estimate':
            object_id = body.get('object_id')
            if not object_id:
                return response(400, {'error': 'Выберите объект'})
            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s",
                        (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            items = body.get('items') or []
            if not items:
                return response(400, {'error': 'В смете нет позиций'})

            total = sum(to_num(i.get('qty')) * to_num(i.get('price')) for i in items)
            room_names = ', '.join(
                sorted({(i.get('room_name') or '').strip() for i in items if i.get('room_name')})
            )

            cur.execute(
                "INSERT INTO material_estimates (company_id, object_id, title, room_names, "
                "total_amount, items_json) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, object_id,
                 (body.get('title') or 'Смета на материал').strip(),
                 room_names, total, json.dumps(items, default=str))
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'DELETE' and entity == 'estimate':
            if not row_id:
                return response(400, {'error': 'Не указана смета'})
            cur.execute(
                "DELETE FROM material_estimates WHERE id = %s AND company_id = %s",
                (row_id, company_id)
            )
            conn.commit()
            return response(200, {'success': True})

        if method == 'POST':
            name = (body.get('name') or '').strip()
            if len(name) < 2:
                return response(400, {'error': 'Введите название материала'})
            cur.execute(
                "INSERT INTO materials (company_id, name, category, unit, price, shop_name, "
                "shop_address, shop_phone, shop_url, note, consumption, consumption_unit, "
                "consumption_mode) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (company_id, name, (body.get('category') or '').strip(),
                 (body.get('unit') or 'шт').strip(), to_num(body.get('price')),
                 (body.get('shop_name') or '').strip(), (body.get('shop_address') or '').strip(),
                 (body.get('shop_phone') or '').strip(), (body.get('shop_url') or '').strip(),
                 (body.get('note') or '').strip(), to_num(body.get('consumption')),
                 (body.get('consumption_unit') or 'м²').strip(),
                 (body.get('consumption_mode') or 'coverage').strip())
            )
            new_id = cur.fetchone()[0]

            shop_name = (body.get('shop_name') or '').strip()
            if (shop_name or to_num(body.get('price')) > 0) and has_offers_table(cur):
                cur.execute(
                    "INSERT INTO material_offers (company_id, material_id, shop_name, "
                    "shop_address, shop_phone, shop_url, price) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (company_id, new_id, shop_name,
                     (body.get('shop_address') or '').strip(),
                     (body.get('shop_phone') or '').strip(),
                     (body.get('shop_url') or '').strip(),
                     to_num(body.get('price')))
                )
            conn.commit()
            return response(200, {'success': True, 'id': new_id})

        if method == 'PUT':
            if not row_id:
                return response(400, {'error': 'Не указан материал'})
            fields = []
            values = []
            for key in FIELDS:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(
                        to_num(body[key]) if key in ('price', 'consumption') else body[key]
                    )
            if fields:
                values.extend([row_id, company_id])
                cur.execute(
                    f"UPDATE materials SET {', '.join(fields)}, updated_at = now() "
                    "WHERE id = %s AND company_id = %s",
                    values
                )
                conn.commit()
            return response(200, {'success': True})

        if method == 'DELETE':
            if not row_id:
                return response(400, {'error': 'Не указан материал'})
            cur.execute(
                "UPDATE materials SET is_archived = true, updated_at = now() WHERE id = %s AND company_id = %s",
                (row_id, company_id)
            )
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})

    finally:
        cur.close()
        conn.close()