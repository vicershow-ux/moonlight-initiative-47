import json
import os
from datetime import datetime
import re
import urllib.error
import urllib.request
import psycopg2


FIELDS = [
    'client_name', 'client_phone', 'object_type', 'area', 'status',
    'email', 'legal_status', 'address', 'payment_type',
    'has_elevator', 'residence_during_works', 'material_unloading',
    'completion_type', 'warranty_waiver',
    'rough_material', 'finish_material', 'kitchen_furniture',
    'measurer_comment', 'design_project', 'client_requisites',
]

ALL_KEYS = ['id', 'object_code'] + FIELDS + ['lead_request', 'lead_works', 'created_at', 'updated_at', 'is_closed', 'closed_at']


REQUISITE_KEYS = [
    'org_name', 'inn', 'kpp', 'ogrn', 'legal_address', 'postal_address',
    'director_position', 'director_name', 'basis',
    'bank_name', 'bik', 'account', 'corr_account',
]


def clean_requisites(value) -> dict:
    """Реквизиты заказчика-юрлица: только известные поля, строки без пробелов по краям"""
    if isinstance(value, str):
        try:
            value = json.loads(value or '{}')
        except ValueError:
            value = {}
    if not isinstance(value, dict):
        return {}
    return {k: str(value.get(k) or '').strip()[:500] for k in REQUISITE_KEYS if str(value.get(k) or '').strip()}


def dadata_key(cur, company_id):
    '''Ключ DaData компании; если свой не задан — общий ключ проекта'''
    cur.execute("SELECT api_key, enabled FROM company_dadata_settings WHERE company_id = %s", (company_id,))
    row = cur.fetchone()
    own = (row[0] if row else '') or ''
    enabled = row[1] if row else True
    return (own or os.environ.get('DADATA_API_KEY') or ''), enabled


def dadata_view(cur, company_id):
    cur.execute("SELECT api_key, enabled, requests_count, last_used_at FROM company_dadata_settings WHERE company_id = %s", (company_id,))
    row = cur.fetchone() or ('', True, 0, None)
    own = row[0] or ''
    env = bool(os.environ.get('DADATA_API_KEY'))
    masked = (own[:4] + '•' * 8 + own[-4:]) if len(own) > 8 else ('•' * len(own))
    return {
        'enabled': row[1], 'has_key': bool(own), 'key_masked': masked,
        'from_env': not own and env, 'requests_count': row[2], 'last_used_at': row[3],
    }


def party_by_inn(inn: str, key: str = ''):
    '''Реквизиты организации по ИНН из DaData: название, КПП, ОГРН, адрес, руководитель'''
    inn = re.sub(r'\D', '', inn or '')
    if len(inn) not in (10, 12):
        return response(400, {'error': 'ИНН — 10 цифр для организации или 12 для ИП'})
    if not key:
        return response(503, {'error': 'Автозаполнение не подключено — укажите ключ в «Интеграции → DaData»'})
    req = urllib.request.Request(
        'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party',
        data=json.dumps({'query': inn, 'count': 1}).encode(),
        headers={'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': f'Token {key}'},
    )
    try:
        with urllib.request.urlopen(req, timeout=4) as r:
            data = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return response(502, {'error': 'Ключ DaData не подошёл' if e.code in (401, 403) else 'Сервис реквизитов недоступен'})
    except (urllib.error.URLError, TimeoutError):
        return response(502, {'error': 'Сервис реквизитов не ответил, попробуйте ещё раз'})
    items = data.get('suggestions') or []
    if not items:
        return response(404, {'error': 'Организация с таким ИНН не найдена'})
    d = items[0].get('data') or {}
    mgmt = d.get('management') or {}
    name = d.get('name') or {}
    addr = d.get('address') or {}
    is_ip = d.get('type') == 'INDIVIDUAL'
    fio = d.get('fio') or {}
    ip_name = ' '.join(x for x in [fio.get('surname'), fio.get('name'), fio.get('patronymic')] if x)
    post = (mgmt.get('post') or '').strip()
    return response(200, {
        'org_name': name.get('short_with_opf') or name.get('full_with_opf') or items[0].get('value') or '',
        'inn': d.get('inn') or inn,
        'kpp': '' if is_ip else (d.get('kpp') or ''),
        'ogrn': d.get('ogrn') or '',
        'legal_address': addr.get('unrestricted_value') or addr.get('value') or '',
        'director_position': 'Индивидуальный предприниматель' if is_ip else (post[:1].upper() + post[1:].lower() if post else ''),
        'director_name': ip_name if is_ip else (mgmt.get('name') or ''),
        'status': (d.get('state') or {}).get('status') or '',
    })


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
        "SELECT u.id, u.company_id, u.role, u.position, u.extra_positions FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'user_id': row[0], 'company_id': row[1], 'role': row[2], 'position': row[3],
            'positions': split_positions(row[3], row[4])}


def split_positions(main, extra):
    """Основная должность + дополнительные роли"""
    out = [main] if main else []
    for p in (extra or '').split(','):
        p = p.strip()
        if p and p not in out:
            out.append(p)
    return out


OBJ_SUB = "SELECT id FROM {t} WHERE object_id = %s"


def purge_object(cur, oid):
    """Полностью убирает объект со всеми документами. Деньги и склад остаются, просто отвязываются."""
    inv = OBJ_SUB.format(t='invoices')
    act = OBJ_SUB.format(t='acts')
    con = OBJ_SUB.format(t='contracts')
    est = OBJ_SUB.format(t='estimates')
    cur.execute(f"UPDATE bank_operations SET invoice_id = NULL WHERE invoice_id IN ({inv})", (oid,))
    cur.execute(f"DELETE FROM invoice_payments WHERE invoice_id IN ({inv})", (oid,))
    cur.execute(f"UPDATE invoices SET act_id = NULL WHERE act_id IN ({act})", (oid,))
    cur.execute(f"UPDATE invoices SET contract_id = NULL WHERE contract_id IN ({con})", (oid,))
    cur.execute("DELETE FROM invoices WHERE object_id = %s", (oid,))
    cur.execute(f"DELETE FROM contract_addenda WHERE object_id = %s OR contract_id IN ({con})", (oid, oid))
    cur.execute(f"UPDATE acts SET contract_id = NULL WHERE contract_id IN ({con})", (oid,))
    cur.execute(f"UPDATE acts SET estimate_id = NULL WHERE estimate_id IN ({est})", (oid,))
    cur.execute("DELETE FROM acts WHERE object_id = %s", (oid,))
    cur.execute(f"UPDATE contracts SET estimate_id = NULL WHERE estimate_id IN ({est})", (oid,))
    cur.execute(f"UPDATE company_expenses SET contract_id = NULL WHERE contract_id IN ({con})", (oid,))
    cur.execute(f"UPDATE executor_reports SET contract_id = NULL WHERE contract_id IN ({con})", (oid,))
    cur.execute("DELETE FROM executor_reports WHERE object_id = %s", (oid,))
    cur.execute("DELETE FROM executor_objects WHERE object_id = %s", (oid,))
    cur.execute("DELETE FROM contracts WHERE object_id = %s", (oid,))
    cur.execute(f"DELETE FROM estimate_items WHERE estimate_id IN ({est})", (oid,))
    cur.execute("DELETE FROM estimates WHERE object_id = %s", (oid,))
    for t in ['company_expenses', 'company_incomes', 'documents', 'rentals', 'warehouse_items']:
        cur.execute(f"UPDATE {t} SET object_id = NULL WHERE object_id = %s", (oid,))
    for t in ['material_estimates', 'object_access', 'object_files', 'object_materials',
              'object_message_reads', 'object_messages', 'object_payments',
              'object_photo_reports', 'object_plans', 'object_rooms']:
        cur.execute(f"DELETE FROM {t} WHERE object_id = %s", (oid,))


def handler(event: dict, context) -> dict:
    '''CRUD объектов недвижимости: доступ по роли и должности'''
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
        is_designer = user['role'] == 'employee' and 'designer' in user['positions'] and set(user['positions']) <= {'designer'}
        only_own = is_client or is_designer

        params = event.get('queryStringParameters') or {}
        object_id = params.get('id')

        select_cols = ', '.join(ALL_KEYS)

        if params.get('action') == 'party_by_inn' and method == 'GET':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            key, enabled = dadata_key(cur, company_id)
            if not enabled:
                return response(503, {'error': 'Автозаполнение по ИНН выключено в «Интеграции → DaData»'})
            res = party_by_inn(params.get('inn') or '', key)
            if res['statusCode'] in (200, 404):
                cur.execute(
                    "UPDATE company_dadata_settings SET requests_count = requests_count + 1, last_used_at = NOW() WHERE company_id = %s",
                    (company_id,)
                )
                conn.commit()
            return res

        if params.get('action') == 'dadata_settings':
            if user['role'] not in ('owner', 'admin'):
                return response(403, {'error': 'Настройки интеграций доступны руководителю'})
            if method == 'PUT':
                body = json.loads(event.get('body') or '{}')
                if body.get('test'):
                    key, _ = dadata_key(cur, company_id)
                    k = (body.get('api_key') or '').strip() or key
                    res = party_by_inn('7707083893', k)
                    return response(200, {'ok': res['statusCode'] == 200, 'error': json.loads(res['body']).get('error', '') if res['statusCode'] != 200 else ''})
                cur.execute("INSERT INTO company_dadata_settings (company_id) VALUES (%s) ON CONFLICT DO NOTHING", (company_id,))
                if 'api_key' in body and body['api_key'] is not None:
                    cur.execute("UPDATE company_dadata_settings SET api_key = %s, updated_at = NOW() WHERE company_id = %s",
                                (str(body['api_key']).strip()[:200], company_id))
                if 'enabled' in body:
                    cur.execute("UPDATE company_dadata_settings SET enabled = %s, updated_at = NOW() WHERE company_id = %s",
                                (bool(body['enabled']), company_id))
                conn.commit()
            return response(200, dadata_view(cur, company_id))

        if method == 'GET':
            if object_id:
                if only_own:
                    cur.execute(
                        f"SELECT o.{f', o.'.join(ALL_KEYS)} FROM objects o JOIN object_access oa ON oa.object_id = o.id "
                        "WHERE o.id = %s AND o.company_id = %s AND oa.user_id = %s",
                        (object_id, company_id, user['user_id'])
                    )
                else:
                    cur.execute(
                        f"SELECT {select_cols} FROM objects WHERE id = %s AND company_id = %s",
                        (object_id, company_id)
                    )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Объект не найден'})
                return response(200, dict(zip(ALL_KEYS, row)))

            if only_own:
                cur.execute(
                    f"SELECT o.{f', o.'.join(ALL_KEYS)} FROM objects o JOIN object_access oa ON oa.object_id = o.id "
                    "WHERE o.company_id = %s AND oa.user_id = %s ORDER BY o.created_at DESC",
                    (company_id, user['user_id'])
                )
            else:
                cur.execute(
                    f"SELECT {select_cols} FROM objects WHERE company_id = %s ORDER BY created_at DESC",
                    (company_id,)
                )
            rows = cur.fetchall()
            return response(200, {'objects': [dict(zip(ALL_KEYS, r)) for r in rows]})

        if method == 'POST':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            body = json.loads(event.get('body') or '{}')
            client_name = (body.get('client_name') or '').strip()

            if len(client_name) < 2:
                return response(400, {'error': 'Введите имя клиента'})

            design_project = body.get('design_project')
            if isinstance(design_project, list):
                design_project = json.dumps(design_project, ensure_ascii=False)
            else:
                design_project = (design_project or '').strip()

            values_map = {
                'client_name': client_name,
                'client_phone': (body.get('client_phone') or '').strip(),
                'object_type': (body.get('object_type') or 'вторичка').strip(),
                'area': body.get('area') or 0,
                'status': (body.get('status') or 'лид').strip(),
                'email': (body.get('email') or '').strip(),
                'legal_status': (body.get('legal_status') or 'физическое лицо').strip(),
                'address': (body.get('address') or '').strip(),
                'payment_type': (body.get('payment_type') or 'наличный расчет').strip(),
                'has_elevator': (body.get('has_elevator') or '').strip(),
                'residence_during_works': bool(body.get('residence_during_works', False)),
                'material_unloading': (body.get('material_unloading') or '').strip(),
                'completion_type': (body.get('completion_type') or 'стандарт').strip(),
                'warranty_waiver': bool(body.get('warranty_waiver', False)),
                'rough_material': (body.get('rough_material') or '').strip(),
                'finish_material': (body.get('finish_material') or '').strip(),
                'kitchen_furniture': (body.get('kitchen_furniture') or '').strip(),
                'measurer_comment': (body.get('measurer_comment') or '').strip(),
                'design_project': design_project,
                'client_requisites': json.dumps(clean_requisites(body.get('client_requisites')), ensure_ascii=False),
            }

            year = datetime.utcnow().strftime('%y')
            cur.execute("SELECT COUNT(*) FROM objects WHERE company_id = %s", (company_id,))
            seq = cur.fetchone()[0] + 1
            object_code = f"{company_id:03d}-20{year}-{seq:04d}"

            insert_cols = ['company_id', 'object_code'] + FIELDS
            insert_vals = [company_id, object_code] + [values_map[f] for f in FIELDS]
            placeholders = ', '.join(['%s'] * len(insert_vals))

            cur.execute(
                f"INSERT INTO objects ({', '.join(insert_cols)}) VALUES ({placeholders}) RETURNING id, created_at, updated_at",
                insert_vals
            )
            new_id, created_at, updated_at = cur.fetchone()
            if is_designer:
                cur.execute(
                    "INSERT INTO object_access (user_id, object_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                    (user['user_id'], new_id)
                )
            conn.commit()

            return response(200, {
                'id': new_id, 'object_code': object_code, 'created_at': created_at,
                'updated_at': updated_at, **values_map,
                'client_requisites': json.loads(values_map['client_requisites']),
            })

        if method == 'PUT':
            if is_client:
                return response(403, {'error': 'Недостаточно прав'})
            if not object_id:
                return response(400, {'error': 'Не указан id объекта'})
            body = json.loads(event.get('body') or '{}')
            if is_designer:
                cur.execute("SELECT 1 FROM object_access WHERE user_id = %s AND object_id = %s", (user['user_id'], object_id))
                if not cur.fetchone():
                    return response(403, {'error': 'Нет доступа к объекту'})

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            fields = []
            values = []
            for key in FIELDS:
                if key in body:
                    value = body[key]
                    if key == 'design_project' and isinstance(value, list):
                        value = json.dumps(value, ensure_ascii=False)
                    if key == 'client_requisites':
                        value = json.dumps(clean_requisites(value), ensure_ascii=False)
                    fields.append(f"{key} = %s")
                    values.append(value)
            if 'is_closed' in body:
                closed = bool(body.get('is_closed'))
                fields.append("is_closed = %s")
                values.append(closed)
                fields.append("closed_at = NOW()" if closed else "closed_at = NULL")

            if fields:
                fields.append("updated_at = NOW()")
                values.append(object_id)
                values.append(company_id)
                cur.execute(f"UPDATE objects SET {', '.join(fields)} WHERE id = %s AND company_id = %s", values)
                conn.commit()

            return response(200, {'success': True})

        if method == 'DELETE':
            if is_client or is_designer:
                return response(403, {'error': 'Недостаточно прав'})
            if not object_id:
                return response(400, {'error': 'Не указан id объекта'})

            cur.execute("SELECT id FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Объект не найден'})

            purge_object(cur, int(object_id))
            cur.execute("DELETE FROM objects WHERE id = %s AND company_id = %s", (object_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})
    finally:
        cur.close()
        conn.close()
