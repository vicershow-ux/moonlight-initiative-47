import json
import os
import ssl
import re
import urllib.error
import urllib.parse
import urllib.request
import time
import uuid
from datetime import datetime, timedelta, timezone

API = 'https://business.tbank.ru/openapi'

_CA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'russian_trusted_ca.pem')


def _ssl_context():
    '''Т-Банк использует сертификат Минцифры — добавляем его к стандартным доверенным'''
    ctx = ssl.create_default_context()
    if os.path.exists(_CA):
        ctx.load_verify_locations(_CA)
    return ctx


SSL_CTX = _ssl_context()
SETTINGS_COLS = ['enabled', 'token', 'account_number', 'auto_mark', 'match_by_amount', 'last_synced_at', 'last_error', 'updated_at']


def load_settings(cur, company_id):
    cur.execute(f"SELECT {', '.join(SETTINGS_COLS)} FROM company_bank_settings WHERE company_id = %s", (company_id,))
    r = cur.fetchone()
    if r:
        return dict(zip(SETTINGS_COLS, r))
    return {'enabled': False, 'token': '', 'account_number': '', 'auto_mark': True, 'match_by_amount': True,
            'last_synced_at': None, 'last_error': '', 'updated_at': None}


def configured(s):
    return bool(s.get('enabled') and s.get('token') and s.get('account_number'))


def mask(token):
    token = token or ''
    return (token[:4] + '•' * 8 + token[-4:]) if len(token) > 12 else '•' * len(token)


def _get(token, path, params=None):
    url = API + path + ('?' + urllib.parse.urlencode(params, doseq=True) if params else '')
    req = urllib.request.Request(url, headers={
        'Authorization': f'Bearer {token}', 'X-Request-Id': str(uuid.uuid4()), 'Accept': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=3.5, context=SSL_CTX) as r:
            return json.loads(r.read().decode() or '{}'), None
    except urllib.error.HTTPError as e:
        raw = e.read().decode(errors='ignore')
        try:
            err = json.loads(raw)
            msg = err.get('errorMessage') or err.get('message') or err.get('errorCode')
        except ValueError:
            msg = ''
        if e.code == 401:
            msg = 'Токен не принят банком — проверьте, что он скопирован целиком и не отозван'
        elif e.code == 403:
            msg = msg or 'У токена нет нужных прав — включите доступ к счетам и выпискам'
        return None, msg or f'HTTP {e.code}'
    except Exception as e:
        return None, str(e)


def list_accounts(token):
    data, err = _get(token, '/api/v4/bank-accounts')
    if err:
        return None, err
    items = data if isinstance(data, list) else (data or {}).get('accounts') or []
    out = []
    for a in items:
        num = str(a.get('accountNumber') or '')
        if not re.match(r'^\d{20}$', num) or str(a.get('currency') or '643') != '643':
            continue
        if a.get('status') and a.get('status') not in ('NORM', 'Active', 'ACTIVE'):
            continue
        out.append({'account_number': num, 'name': a.get('name') or 'Расчётный счёт',
                    'main': a.get('mainFlag') == 'Y',
                    'balance': ((a.get('balance') or {}).get('balance') if isinstance(a.get('balance'), dict) else None)})
    return out, None


def fetch_credits(token, account, since):
    '''Подтверждённые операции по счёту начиная с даты since: поступления (credit) и списания (debit)'''
    params = {
        'accountNumber': account,
        'from': since.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'operationStatus': 'Transaction',
        'limit': 1000,
    }
    result, pages, started = [], 0, time.time()
    while pages < 3 and time.time() - started < 2.5:
        data, err = _get(token, '/api/v1/statement', params)
        if err:
            return None, err
        for op in (data or {}).get('operations') or []:
            kind = op.get('typeOfOperation')
            if kind not in ('Credit', 'Debit'):
                continue
            if kind == 'Credit':
                payer = op.get('payer') or op.get('counterParty') or {}
            else:
                payer = op.get('receiver') or op.get('counterParty') or {}
            result.append({
                'direction': 'credit' if kind == 'Credit' else 'debit',
                'category': str(op.get('category') or '')[:100],
                'operation_id': str(op.get('operationId') or '')[:100],
                'date': op.get('operationDate') or op.get('trxnPostDate') or op.get('chargeDate'),
                'amount': abs(float(op.get('accountAmount') or op.get('operationAmount') or op.get('rubleAmount') or 0)),
                'purpose': str(op.get('payPurpose') or op.get('description') or '')[:2000],
                'payer_name': str(payer.get('name') or '')[:500],
                'payer_inn': str(payer.get('inn') or '')[:20],
                'document_number': str(op.get('documentNumber') or '')[:50],
            })
        cursor = (data or {}).get('nextCursor')
        if not cursor:
            break
        params['cursor'] = cursor
        pages += 1
    return [r for r in result if r['operation_id']], None


def default_since(last_synced_at):
    now = datetime.now(timezone.utc)
    if last_synced_at:
        ls = last_synced_at if last_synced_at.tzinfo else last_synced_at.replace(tzinfo=timezone.utc)
        return max(ls - timedelta(days=3), now - timedelta(days=60))
    return now - timedelta(days=30)


NUM_RE = r'(?:сч(?:[её]т(?:у|а)?|\.)?|счет[ау]?|inv(?:oice)?)\s*(?:на\s+оплату\s*)?(?:№|N|#|No\.?)?\s*([A-Za-zА-Яа-я0-9\-/]{1,40})'


def invoice_numbers_in(purpose):
    '''Номера счетов из назначения платежа: «Оплата по счёту № 15 от ...», «сч. 15», «счет N15»'''
    found = []
    for m in re.finditer(NUM_RE, purpose or '', re.I):
        n = m.group(1).strip('-/').lower()
        if n and n not in ('от', 'на', 'по') and n not in found:
            found.append(n)
    return found


def match_invoice(op, invoices, by_amount):
    '''Подбор счёта: номер в назначении + сумма; запасной вариант — уникальная сумма и ИНН/имя плательщика'''
    amount = round(op['amount'], 2)
    nums = invoice_numbers_in(op['purpose'])
    same_amount = [i for i in invoices if abs(i['due'] - amount) < 0.01]
    if nums:
        by_num = [i for i in invoices if str(i['number']).lower() in nums]
        exact = [i for i in by_num if abs(i['due'] - amount) < 0.01]
        if len(exact) == 1:
            return exact[0], 'Номер счёта и сумма совпали'
        if len(by_num) == 1:
            return None, f'Счёт № {by_num[0]["number"]} найден, но сумма не совпадает ({by_num[0]["due"]:.2f} ₽)'
    if not by_amount:
        return None, 'Номер счёта в назначении платежа не найден'
    if len(same_amount) == 1:
        inv = same_amount[0]
        inn_ok = op['payer_inn'] and inv.get('client_inn') and op['payer_inn'] == inv['client_inn']
        surname = (inv.get('client_name') or '').split(' ')[0].lower()
        name_ok = len(surname) > 2 and surname in (op['payer_name'] or '').lower()
        if inn_ok or name_ok:
            return inv, 'Сумма и плательщик совпали'
        return inv, f'Похоже на счёт № {inv["number"]} (сумма совпала), нужна проверка'
    if len(same_amount) > 1:
        return None, 'Несколько счетов на такую сумму — выберите вручную'
    return None, 'Подходящий счёт не найден'
