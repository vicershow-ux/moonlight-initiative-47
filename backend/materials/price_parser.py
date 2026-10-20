import json
import re
import gzip
import zlib
import urllib.request
import urllib.error
import html as html_lib

FETCH_TIMEOUT = 3.5

UA_DESKTOP = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
              '(KHTML, like Gecko) Chrome/126.0 Safari/537.36')
UA_MOBILE = ('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 '
             '(KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1')

STRATEGIES = {
    'desktop': {'label': 'Обычный браузер', 'ua': UA_DESKTOP},
    'mobile': {'label': 'Мобильный браузер', 'ua': UA_MOBILE},
    'yandexbot': {'label': 'Поисковый робот Яндекса',
                  'ua': 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'},
    'googlebot': {'label': 'Поисковый робот Google',
                  'ua': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'},
    'reader': {'label': 'Через сервис чтения страниц', 'ua': UA_DESKTOP, 'proxy': 'https://r.jina.ai/'},
}

STRATEGY_ORDER = ['desktop', 'mobile', 'yandexbot', 'googlebot', 'reader']


def is_product_url(url):
    if not url or not url.startswith('http'):
        return False
    path = re.sub(r'^https?://[^/]+', '', url).strip('/')
    return len(path) > 3


def fetch(url, strategy):
    cfg = STRATEGIES.get(strategy) or STRATEGIES['desktop']
    target = (cfg.get('proxy') or '') + url
    req = urllib.request.Request(target, headers={
        'User-Agent': cfg['ua'],
        'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
    })
    try:
        with urllib.request.urlopen(req, timeout=FETCH_TIMEOUT) as r:
            raw = r.read(3_000_000)
            enc = (r.headers.get('Content-Encoding') or '').lower()
            status = r.status
    except urllib.error.HTTPError as e:
        return e.code, ''
    except Exception as e:
        return 0, str(e)[:200]
    if enc == 'gzip':
        raw = gzip.decompress(raw)
    elif enc == 'deflate':
        raw = zlib.decompress(raw)
    return status, raw.decode('utf-8', errors='ignore')


def to_float(v):
    if v is None:
        return None
    s = str(v).replace('\u00a0', '').replace(' ', '').replace(',', '.')
    m = re.search(r'\d+(?:\.\d+)?', s)
    return float(m.group(0)) if m else None


def walk_ld(node, out):
    if isinstance(node, list):
        for n in node:
            walk_ld(n, out)
    elif isinstance(node, dict):
        t = node.get('@type')
        types = t if isinstance(t, list) else [t]
        if 'Product' in types or 'Offer' in types or 'AggregateOffer' in types:
            out.append(node)
        for v in node.values():
            if isinstance(v, (dict, list)):
                walk_ld(v, out)


def parse_product(text):
    """Достаёт цену и наличие со страницы товара. Возвращает dict или None."""
    price = None
    available = None
    stock = None
    source = ''

    for block in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', text, re.S | re.I):
        try:
            data = json.loads(html_lib.unescape(block.strip()))
        except Exception:
            continue
        found = []
        walk_ld(data, found)
        for node in found:
            offers = node.get('offers', node)
            offers = offers[0] if isinstance(offers, list) and offers else offers
            if not isinstance(offers, dict):
                continue
            p = to_float(offers.get('price') or offers.get('lowPrice'))
            if p and p > 0:
                price = p
                av = str(offers.get('availability') or '')
                if av:
                    available = 'InStock' in av or 'LimitedAvailability' in av
                inv = offers.get('inventoryLevel')
                if isinstance(inv, dict):
                    inv = inv.get('value')
                q = to_float(inv)
                if q is not None:
                    stock = q
                source = 'разметка товара'
                break
        if price:
            break

    if not price:
        for pat in [
            r'itemprop=["\']price["\'][^>]*content=["\']([\d\s.,]+)',
            r'content=["\']([\d\s.,]+)["\'][^>]*itemprop=["\']price["\']',
            r'property=["\'](?:product|og):price:amount["\'][^>]*content=["\']([\d\s.,]+)',
            r'"price"\s*:\s*"?([\d]+(?:[.,]\d+)?)',
        ]:
            m = re.search(pat, text, re.I)
            if m:
                p = to_float(m.group(1))
                if p and p > 0:
                    price = p
                    source = 'цена на странице'
                    break

    if not price:
        m = re.search(r'(\d[\d\s\u00a0]{0,9}(?:[.,]\d{1,2})?)\s*(?:₽|руб)', text)
        if m:
            p = to_float(m.group(1))
            if p and p > 0:
                price = p
                source = 'текст страницы'

    plain = re.sub(r'<(?:script|style)[^>]*>.*?</(?:script|style)>', ' ', text, flags=re.S | re.I)
    plain = re.sub(r'<(?:ins|b|strong|span|em|i)\b[^>]*>|</(?:ins|b|strong|span|em|i)>', '', plain, flags=re.I)
    plain = re.sub(r'<[^>]+>', ' | ', plain)
    plain = html_lib.unescape(plain).replace('\u00a0', ' ')
    plain = re.sub(r'\s+', ' ', plain)
    num_re = r'(\d{1,3}(?: \d{3})*|\d+)'
    unit_re = r'(?:шт|уп|меш|рул|кг|л|м²|м2|м|пог)\b'
    stop_re = r'(?! ?(?:₽|руб|р\b|магазин|пункт|час|дн|мин|%))'

    if stock is None:
        for pat in [
            r'[Вв] наличии:? (?:более |больше |свыше |от )?' + num_re + stop_re,
            r'[Оо]стат(?:ок|ки)(?: на складе)?:? ' + num_re + stop_re,
            r'[Дд]оступно(?: к заказу)?:? ' + num_re + stop_re,
            num_re + ' ?' + unit_re + r'\.? (?:в наличии|на складе)',
        ]:
            m = re.search(pat, plain)
            if m:
                stock = to_float(m.group(1))
                break

    if stock is None:
        for pat in [
            r'"(?:stock|availableQuantity|quantity|stockQuantity|stock_qty)"\s*:\s*"?(\d+(?:\.\d+)?)',
            r'[Вв]\s*наличии[^<\d]{0,30}?(\d[\d\s]{0,6})\s*(?:шт|уп|кг|л)\b',
        ]:
            m = re.search(pat, text)
            if m:
                stock = to_float(m.group(1))
                break

    if available is None:
        low = text.lower()
        if 'нет в наличии' in low or 'outofstock' in low or 'под заказ' in low:
            available = False
        elif 'в наличии' in low or 'instock' in low:
            available = True

    if not price:
        return None
    return {'price': round(price, 2), 'available': available, 'stock': stock, 'source': source}


def try_url(url, strategy):
    """Загружает страницу и разбирает её. Возвращает (ok, result_or_message)."""
    status, body = fetch(url, strategy)
    if status == 0:
        return False, f'Магазин не ответил: {body or "таймаут"}'
    if status in (401, 403, 429, 451):
        return False, f'Магазин заблокировал запрос (код {status}) — включена защита от роботов'
    if status >= 400:
        return False, f'Страница недоступна (код {status})'
    if len(body) < 500 and 'qrator' in body.lower():
        return False, 'Магазин показал проверку «я не робот»'
    data = parse_product(body)
    if not data:
        return False, 'Страница открылась, но цену на ней найти не удалось'
    return True, data
