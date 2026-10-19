import base64
import json
import os
import re
import urllib.error
import urllib.request
import uuid

API = 'https://api.yookassa.ru/v3'

TAX_SYSTEMS = {0, 1, 2, 3, 4, 5, 6}
VAT_CODES = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}
SUBJECTS = {'service', 'commodity', 'job', 'payment', 'another'}
MODES = {'auto', 'full_payment', 'full_prepayment', 'prepayment', 'advance', 'partial_payment'}

SETTINGS_COLS = ['enabled', 'shop_id', 'secret_key', 'receipts_enabled', 'tax_system_code',
                 'default_vat_code', 'use_invoice_vat', 'payment_subject', 'payment_mode', 'updated_at']

VAT_BY_RATE = {22: 11, 20: 4, 10: 3, 7: 9, 5: 7}


def load_settings(cur, company_id):
    '''Настройки кассы компании; ключи из секретов проекта — запасной вариант'''
    cur.execute(f"SELECT {', '.join(SETTINGS_COLS)} FROM company_payment_settings WHERE company_id = %s", (company_id,))
    r = cur.fetchone()
    s = dict(zip(SETTINGS_COLS, r)) if r else {
        'enabled': False, 'shop_id': '', 'secret_key': '', 'receipts_enabled': False, 'tax_system_code': 0,
        'default_vat_code': 1, 'use_invoice_vat': True, 'payment_subject': 'service', 'payment_mode': 'auto',
        'updated_at': None,
    }
    env_shop = os.environ.get('YOOKASSA_SHOP_ID', '').strip()
    env_key = os.environ.get('YOOKASSA_SECRET_KEY', '').strip()
    if not s['shop_id'] and not s['secret_key'] and env_shop and env_key:
        s['shop_id'], s['secret_key'] = env_shop, env_key
        if not r:
            s['enabled'] = True
    return s


def configured(settings):
    return bool(settings.get('enabled') and settings.get('shop_id') and settings.get('secret_key'))


def mask(key):
    key = key or ''
    if len(key) <= 10:
        return '•' * len(key)
    return key[:5] + '•' * 8 + key[-4:]


def _request(settings, method, path, payload=None, idempotence_key=None):
    auth = base64.b64encode(f"{settings['shop_id']}:{settings['secret_key']}".encode()).decode()
    headers = {'Authorization': f'Basic {auth}', 'Content-Type': 'application/json'}
    if idempotence_key:
        headers['Idempotence-Key'] = idempotence_key
    data = json.dumps(payload, ensure_ascii=False).encode() if payload is not None else None
    req = urllib.request.Request(API + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=4) as r:
            return json.loads(r.read().decode()), None
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read().decode())
            return None, err.get('description') or err.get('code') or f'HTTP {e.code}'
        except ValueError:
            return None, f'HTTP {e.code}'
    except Exception as e:
        return None, str(e)


def check_credentials(settings):
    '''Проверка ключей: запрос сведений о магазине'''
    data, err = _request(settings, 'GET', '/me')
    if err:
        return False, err, None
    return True, '', data


def vat_code_for(settings, vat_mode):
    if settings.get('use_invoice_vat'):
        m = re.match(r'^(included|on_top)(?:_(\d+))?$', vat_mode or '')
        if m:
            code = VAT_BY_RATE.get(int(m.group(2) or 20))
            if code:
                return code
        elif (vat_mode or 'none') == 'none':
            return 1
    return int(settings.get('default_vat_code') or 1)


SUBJECT_FIXES = {
    'ремонт квартиры': 'Ремонт квартиры',
    'Отопление': 'Монтаж отопления',
    'Благоустройство': 'Благоустройство территории',
    'Вентиляция и кондиционирование': 'Монтаж вентиляции и кондиционирования',
}

STAGE_RE = re.compile(r'^(Аванс|Сдача объекта|Этап\s*\d+|Полная стоимость работ|Работы(?=:))', re.I)


def service_title(work_subject):
    s = (work_subject or '').strip() or 'ремонт квартиры'
    t = SUBJECT_FIXES.get(s, s)
    return t[:1].upper() + t[1:]


def stage_of(name, last_stage=''):
    '''Этап оплаты из названия строки счёта: аванс, этап N, сдача объекта'''
    name = (name or '').strip()
    m = STAGE_RE.match(name) or STAGE_RE.match(name.split(' — ', 1)[1]) if ' — ' in name else STAGE_RE.match(name)
    if not m:
        return ''
    st = re.sub(r'\s+', ' ', m.group(1)).strip()
    low = st.lower()
    if low.startswith('аванс'):
        return 'Аванс'
    if low.startswith('сдача'):
        return 'Сдача объекта'
    if low.startswith('этап'):
        return 'Сдача объекта' if last_stage and st.lower() == last_stage.lower() else st.capitalize()
    return 'Оплата работ'


def contract_line_name(item_name, contract):
    '''«Электромонтажные работы — аванс по договору № 46»'''
    if not contract:
        return item_name
    stage = stage_of(item_name, contract.get('last_stage', ''))
    if not stage:
        return item_name
    title = service_title(contract.get('work_subject'))
    tail = f" по договору № {contract['number']}" if contract.get('number') else ''
    if stage == 'Оплата работ':
        return f'{title}{tail}'
    return f'{title} — {stage[:1].lower() + stage[1:]}{tail}'


def mode_for(settings, line_name, stage=''):
    mode = settings.get('payment_mode') or 'auto'
    if mode != 'auto':
        return mode
    if stage:
        return 'advance' if stage == 'Аванс' else 'full_payment'
    return 'advance' if ' — аванс' in line_name or line_name.lower().startswith('аванс') else 'full_payment'


def _floor2(v):
    return int(v * 100 + 1e-6) / 100


def estimate_lines(estimate_items, total, stage):
    '''Позиции сметы для чека: количество как в смете, цена пропорциональна сумме платежа'''
    rows = []
    for it in estimate_items or []:
        qty = float(it.get('quantity') or 0) * (float(it.get('times') or 0) or 1)
        amount = float(it.get('amount') or 0)
        if qty <= 0 or amount <= 0:
            continue
        rows.append({'name': str(it.get('name') or 'Работы').strip(), 'qty': round(qty, 3), 'amount': amount,
                     'category': str(it.get('category') or '').strip(), 'unit': str(it.get('unit') or '').strip()})
    base = sum(r['amount'] for r in rows)
    if not rows or base <= 0:
        return []
    if len(rows) > 100:
        groups = {}
        for r in rows:
            g = groups.setdefault(r['category'] or 'Прочие работы', {'name': r['category'] or 'Прочие работы', 'qty': 1.0, 'amount': 0.0, 'unit': 'усл.'})
            g['amount'] += r['amount']
        rows = list(groups.values())[:100]
    k = total / base
    suffix = f' ({stage.lower()})' if stage and stage != 'Оплата работ' and abs(k - 1) > 0.0001 else ''
    lines = []
    for r in rows:
        price = _floor2(r['amount'] * k / r['qty'])
        if price <= 0:
            continue
        name = r['name'][:128 - len(suffix)] + suffix
        lines.append({'name': name, 'qty': r['qty'], 'price': price, 'unit': r.get('unit') or 'усл.'})
    return lines


def receipt_lines(items, vat_mode, total, contract=None, estimate_items=None, with_vat=True):
    '''Строки чека/счёта: перечень работ из сметы или позиции счёта; сумма строк ровно равна total'''
    m = re.match(r'^on_top(?:_(\d+))?$', vat_mode or '')
    k = 1 + int(m.group(1) or 20) / 100 if (m and with_vat) else 1.0
    items = [it for it in (items or []) if float(it.get('quantity') or 0) > 0 and float(it.get('price') or 0) > 0]
    stage = ''
    lines = []
    if contract and len(items) == 1:
        stage = stage_of(str(items[0].get('name') or ''), contract.get('last_stage', ''))
        if stage and estimate_items:
            lines = estimate_lines(estimate_items, total, stage)
    from_estimate = bool(lines)
    if not lines:
        for it in items:
            lines.append({'name': contract_line_name(str(it.get('name') or 'Услуга'), contract),
                          'qty': float(it.get('quantity')), 'price': round(float(it.get('price')) * k, 2),
                          'unit': str(it.get('unit') or 'усл.')})
    fallback = service_title(contract.get('work_subject')) + (f" по договору № {contract['number']}" if contract.get('number') else '') if contract else 'Оплата по счёту'
    single = [{'name': lines[0]['name'] if len(lines) == 1 else fallback, 'qty': 1.0, 'price': round(total, 2), 'unit': 'усл.'}]
    if not lines or len(lines) > 100:
        lines, from_estimate = single, False
    diff = round(total - sum(round(ln['qty'] * ln['price'], 2) for ln in lines), 2)
    if abs(diff) >= 0.01:
        ones = [ln for ln in lines if ln['qty'] == 1 and ln['price'] + diff > 0]
        whole = [ln for ln in lines if ln['qty'] > 1 and ln['qty'] == int(ln['qty']) and ln['price'] + diff > 0]
        if ones:
            ones[-1]['price'] = round(ones[-1]['price'] + diff, 2)
        elif whole and len(lines) < 100:
            ln = whole[-1]
            ln['qty'] -= 1
            lines.insert(lines.index(ln) + 1, {**ln, 'qty': 1.0, 'price': round(ln['price'] + diff, 2)})
        else:
            lines, from_estimate = single, False
    return lines, stage, from_estimate


def build_receipt(settings, email, items, vat_mode, total, contract=None, estimate_items=None):
    '''Чек 54-ФЗ: перечень работ из сметы (для счетов по договору) или позиции счёта; копейки сверяются с суммой платежа'''
    code = vat_code_for(settings, vat_mode)
    lines, stage, _ = receipt_lines(items, vat_mode, total, contract, estimate_items)
    receipt = {
        'customer': {'email': email},
        'items': [{
            'description': ln['name'][:128],
            'quantity': (f"{ln['qty']:.3f}".rstrip('0').rstrip('.')) or '1',
            'amount': {'value': f"{ln['price']:.2f}", 'currency': 'RUB'},
            'vat_code': code,
            'payment_subject': settings.get('payment_subject') or 'service',
            'payment_mode': mode_for(settings, ln['name'], stage),
        } for ln in lines],
    }
    tax = int(settings.get('tax_system_code') or 0)
    if tax:
        receipt['tax_system_code'] = tax
    return receipt


def create_payment(settings, amount, description, return_url, metadata, receipt=None):
    payload = {
        'amount': {'value': f'{amount:.2f}', 'currency': 'RUB'},
        'capture': True,
        'confirmation': {'type': 'redirect', 'return_url': return_url},
        'description': description[:128],
        'metadata': metadata,
    }
    if receipt:
        payload['receipt'] = receipt
    return _request(settings, 'POST', '/payments', payload, str(uuid.uuid4()))


def get_receipts(settings, payment_id):
    '''Чеки, которые ЮKassa зарегистрировала по платежу'''
    return _request(settings, 'GET', f'/receipts?payment_id={payment_id}')


def get_payment(settings, payment_id):
    return _request(settings, 'GET', f'/payments/{payment_id}')
