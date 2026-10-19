import base64
import json
import os
import urllib.error
import urllib.request
import uuid

API = 'https://api.yookassa.ru/v3'


def configured():
    return bool(os.environ.get('YOOKASSA_SHOP_ID', '').strip() and os.environ.get('YOOKASSA_SECRET_KEY', '').strip())


def _request(method, path, payload=None, idempotence_key=None):
    shop = os.environ.get('YOOKASSA_SHOP_ID', '').strip()
    key = os.environ.get('YOOKASSA_SECRET_KEY', '').strip()
    auth = base64.b64encode(f'{shop}:{key}'.encode()).decode()
    headers = {'Authorization': f'Basic {auth}', 'Content-Type': 'application/json'}
    if idempotence_key:
        headers['Idempotence-Key'] = idempotence_key
    data = json.dumps(payload).encode() if payload is not None else None
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


def create_payment(amount, description, return_url, metadata, customer_email=''):
    '''Создаёт платёж с переходом на страницу оплаты ЮKassa'''
    payload = {
        'amount': {'value': f'{amount:.2f}', 'currency': 'RUB'},
        'capture': True,
        'confirmation': {'type': 'redirect', 'return_url': return_url},
        'description': description[:128],
        'metadata': metadata,
    }
    if os.environ.get('YOOKASSA_SEND_RECEIPT', '').strip() == '1' and customer_email:
        payload['receipt'] = {
            'customer': {'email': customer_email},
            'items': [{
                'description': description[:128],
                'quantity': '1.00',
                'amount': {'value': f'{amount:.2f}', 'currency': 'RUB'},
                'vat_code': int(os.environ.get('YOOKASSA_VAT_CODE', '1') or 1),
                'payment_subject': 'service',
                'payment_mode': 'full_payment',
            }],
        }
    return _request('POST', '/payments', payload, str(uuid.uuid4()))


def get_payment(payment_id):
    return _request('GET', f'/payments/{payment_id}')
