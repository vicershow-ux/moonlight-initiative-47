import json
import os
import re
import html as html_lib
import psycopg2
import addenda
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


CONTRACT_KEYS = [
    'id', 'object_id', 'estimate_id', 'contract_number', 'contract_date',
    'status', 'template_key', 'options', 'content_html', 'total_amount',
    'created_by', 'created_at', 'updated_at', 'signed_at',
]


def sign_mark(stamp):
    return ('<span class="client-esign" style="display:inline-block;margin:6px 0;border:2px solid #2e7d32;color:#2e7d32;'
            'border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;line-height:1.35">ПОДПИСАНО ЭЛЕКТРОННО<br/>'
            f'<span style="font-weight:600">{html_lib.escape(stamp)}</span></span>')


def apply_client_signature(content, stamp):
    '''Ставит отметку электронной подписи в блок заказчика (последнее поле подписи в документе)'''
    mark = sign_mark(stamp)
    idx = content.rfind('ЗАКАЗЧИК')
    if idx != -1:
        m = re.compile(r'Подпись:\s*_+').search(content, idx)
        if m:
            return content[:m.start()] + mark + content[m.end():]
    return content + f'<p style="margin-top:16px"><strong>Заказчик:</strong></p>{mark}'


UNITS_M = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
UNITS_F = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
TEENS = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"]
TENS = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"]
HUNDREDS = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"]
SCALES = [
    (10 ** 9, False, ("миллиард", "миллиарда", "миллиардов")),
    (10 ** 6, False, ("миллион", "миллиона", "миллионов")),
    (10 ** 3, True, ("тысяча", "тысячи", "тысяч")),
]


def three_digit_words(n, feminine=False):
    words = []
    h = n // 100
    rem = n % 100
    if h:
        words.append(HUNDREDS[h])
    if 10 <= rem < 20:
        words.append(TEENS[rem - 10])
    else:
        t = rem // 10
        u = rem % 10
        if t:
            words.append(TENS[t])
        if u:
            words.append((UNITS_F if feminine else UNITS_M)[u])
    return words


def pluralize(n, forms):
    n100 = n % 100
    if 11 <= n100 <= 19:
        return forms[2]
    n10 = n % 10
    if n10 == 1:
        return forms[0]
    if 2 <= n10 <= 4:
        return forms[1]
    return forms[2]


def number_to_words_ru(n: int) -> str:
    if n == 0:
        return 'ноль'
    remaining = n
    parts = []
    for scale_val, feminine, forms in SCALES:
        if remaining >= scale_val:
            count = remaining // scale_val
            remaining %= scale_val
            parts += three_digit_words(count, feminine)
            parts.append(pluralize(count, forms))
    if remaining:
        parts += three_digit_words(remaining, False)
    return ' '.join(parts)


def money_words(amount) -> str:
    try:
        n = int(round(float(amount)))
    except (TypeError, ValueError):
        n = 0
    words = number_to_words_ru(n)
    ruble_word = pluralize(n, ('рубль', 'рубля', 'рублей'))
    formatted = f"{n:,}".replace(',', ' ')
    return f"{formatted} ({words} {ruble_word})"


def months_words(n) -> str:
    try:
        n_int = int(n)
    except (TypeError, ValueError):
        n_int = 0
    words = number_to_words_ru(n_int)
    return f"{n_int} ({words}) {pluralize(n_int, ('месяц', 'месяца', 'месяцев'))}"


def esc(v) -> str:
    return '' if v is None else str(v)


def build_contract_html(object_row, company_row, opts, contract_number, contract_date, total_amount):
    (obj_client_name, obj_address, obj_legal_status) = object_row
    (
        company_name, company_inn, company_legal_address, company_bank_name,
        company_bik, company_account_number, company_bank_inn, company_bank_kpp,
        company_correspondent_account, contact_full_name,
    ) = company_row

    customer_type = opts.get('customer_type', 'individual')
    contractor_type = opts.get('contractor_type', 'individual')
    design_project = opts.get('design_project', 'none')
    work_order = opts.get('work_order', 'staged')
    subcontractors = opts.get('subcontractors', 'allowed')
    work_start = opts.get('work_start', 'advance_and_handover')
    cost_type = opts.get('cost_type', 'fixed')
    payment_order = opts.get('payment_order', 'advance_staged')
    payment_schedule = opts.get('payment_schedule', 'advance_4_stages')
    duration_months = opts.get('duration_months', '6')

    customer_role_label = {
        'individual': 'физическое лицо',
        'legal': 'юридическое лицо',
        'entrepreneur': 'индивидуальный предприниматель',
    }.get(customer_type, 'физическое лицо')

    contractor_role_label = {
        'individual': 'физическое лицо',
        'self_employed': 'самозанятый (НПД)',
        'foreign_citizen': 'иностранный гражданин',
        'entrepreneur': 'индивидуальный предприниматель',
        'legal': 'юридическое лицо',
    }.get(contractor_type, 'физическое лицо')

    design_html = ''
    if design_project == 'with_project':
        design_html = '<p>1.2.1. Работы выполняются в соответствии с согласованным Сторонами дизайн-проектом, являющимся Приложением №2 к настоящему Договору.</p>'

    staged_detail_html = """
<p>1.4.1. Этап 1 — Подготовительные и черновые работы: демонтаж (проёмы, частичный разбор), возведение перегородок, грунтовка поверхностей, штукатурка стен, стяжка пола, частичное выполнение инженерных и электромонтажных работ.</p>
<p>1.4.2. Этап 2 — Санузел и ванная: гидроизоляция (пол и стены), укладка плитки (пол и стены), монтаж сантехнических коммуникаций (инсталляции, выходы, трапы и т.д.), установка сантехнического оборудования, электромонтажные работы в санузле, монтаж вентиляции.</p>
<p>1.4.3. Этап 3 — Подготовка и инженерия: шпатлёвка стен, армирование, выравнивание, шлифовка стен, повторная грунтовка, подготовка стен под обои/покраску, завершение электромонтажных работ (разводка, точки), завершение сантехнических работ (разводка, подключения), подготовка полов под финишное покрытие.</p>
<p>1.4.4. Этап 4 — Финишные работы: укладка напольных покрытий (плитка, ламинат), затирка швов плитки, поклейка обоев / покраска, монтаж натяжных потолков, установка дверей, установка чистовой сантехники (раковины, унитазы, ванна и т.д.), установка розеток, выключателей, светильников, монтаж плинтусов и декоративных элементов.</p>
""".strip()

    work_order_html = {
        'staged': f'<p>1.4. Работы выполняются поэтапно в соответствии со следующим графиком:</p>\n{staged_detail_html}',
        'single': '<p>1.4. Работы выполняются единым комплексом без разбивки на отдельные этапы.</p>',
        'custom': '<p>1.4. Состав и порядок этапов работ определяется индивидуальным графиком, согласованным Сторонами дополнительно.</p>',
    }.get(work_order, '')

    subcontractors_html = {
        'allowed': '<p>1.5. Подрядчик вправе привлекать субподрядчиков для выполнения отдельных видов Работ, оставаясь ответственным перед Заказчиком за результат их деятельности.</p>',
        'personal_only': '<p>1.5. Подрядчик обязуется выполнить все Работы лично, без привлечения третьих лиц, если иное не согласовано Сторонами дополнительно в письменной форме.</p>',
    }.get(subcontractors, '')

    work_start_html = {
        'advance_and_handover': 'с момента выполнения Заказчиком двух условий: внесения аванса, предусмотренного п. 3.2.1 настоящего Договора, и передачи Подрядчику ключей от Объекта с подписанием Сторонами Акта приёма-передачи Объекта в ремонт',
        'advance_only': 'с момента внесения Заказчиком аванса, предусмотренного п. 3.2.1 настоящего Договора',
        'signing': 'с момента подписания настоящего Договора обеими Сторонами',
    }.get(work_start, '')

    cost_type_html = {
        'fixed': f'<p>3.1. Общая стоимость Работ по настоящему Договору составляет {money_words(total_amount)} и является твёрдой и окончательной.</p>',
        'by_estimate': '<p>3.1. Стоимость Работ определяется в соответствии со Сметой (Приложение №1), являющейся неотъемлемой частью настоящего Договора, и может уточняться по соглашению Сторон при изменении объёмов Работ.</p>',
    }.get(cost_type, '')

    payment_order_html = {
        'advance_staged': '<p>3.2. Оплата производится Заказчиком поэтапно, в соответствии с Актами сдачи-приёмки выполненных Работ.</p>',
        'full_prepayment': '<p>3.2. Оплата производится Заказчиком в размере 100% стоимости Работ до начала их выполнения.</p>',
        'on_completion': '<p>3.2. Оплата производится Заказчиком по факту выполнения и приёмки Работ в полном объёме.</p>',
    }.get(payment_order, '')

    schedule_map = {
        'advance_4_stages': [
            ('Аванс', 25, 'до начала выполнения Работ'),
            ('Этап 1', 25, 'по завершении чернового этапа'),
            ('Этап 2', 25, 'по завершении инженерного этапа'),
            ('Сдача объекта', 25, 'по завершении финишных работ и подписания Акта сдачи-приёмки'),
        ],
        'advance_3_stages': [
            ('Аванс', 30, 'до начала выполнения Работ'),
            ('Этап 1', 40, 'по завершении чернового и инженерного этапов'),
            ('Сдача объекта', 30, 'по завершении финишных работ и подписания Акта сдачи-приёмки'),
        ],
        'advance_2_stages': [
            ('Аванс', 50, 'до начала выполнения Работ'),
            ('Сдача объекта', 50, 'по завершении Работ и подписания Акта сдачи-приёмки'),
        ],
        'custom_schedule': [],
    }
    schedule = schedule_map.get(payment_schedule, schedule_map['advance_4_stages'])
    if schedule:
        rows = ''.join(
            f'<p>3.2.{i + 1}. {label} — {money_words(float(total_amount) * pct / 100)} ({pct}%). Оплачивается Заказчиком {when}.</p>'
            for i, (label, pct, when) in enumerate(schedule)
        )
    else:
        rows = '<p>3.2.1. График платежей определяется индивидуальным соглашением Сторон (Приложение №4).</p>'

    html = f"""
<div class="contract-doc">
<h2 style="text-align:center">Договор подряда на ремонт квартиры № {esc(contract_number)}</h2>
<p style="text-align:right">г. Хабаровск, {esc(contract_date)}</p>

<p>{esc(company_name) or esc(contact_full_name)}, действующий как {contractor_role_label} (далее — «Подрядчик»), с одной стороны, и {esc(obj_client_name)}, действующий как {customer_role_label} (далее — «Заказчик»), с другой стороны, вместе именуемые «Стороны», а индивидуально — «Сторона», заключили настоящий договор подряда на ремонт квартиры (далее — «Договор») о нижеследующем:</p>

<h3>1. Предмет договора</h3>
<p>1.1. Подрядчик обязуется по заданию Заказчика выполнить ремонтно-отделочные работы (далее — «Работы») в квартире по адресу: {esc(obj_address)} (далее — «Объект»), а Заказчик обязуется принять результат Работ и оплатить его.</p>
<p>1.2. Перечень, объёмы и стоимость Работ, а также график их выполнения определяются в Смете, являющейся неотъемлемой частью настоящего Договора (Приложение №1 — Смета/Техническое задание).</p>
{design_html}
<p>1.3. Качество производимых работ должно соответствовать действующим строительным нормам и правилам (СНиП), сводам правил (СП), государственным стандартам (ГОСТ), а также техническим регламентам, действующим на территории выполнения работ. При отсутствии конкретных требований качество определяется общепринятой практикой выполнения строительных и отделочных работ.</p>
{work_order_html}
{subcontractors_html}

<h3>2. Сроки выполнения работ</h3>
<p>2.1. Общий срок выполнения Работ составляет {months_words(duration_months)}. Течение срока начинается {work_start_html}.</p>
<p>2.2. В случае нарушения Заказчиком своих обязательств по Договору, препятствующих выполнению Подрядчиком Работ (включая, но не ограничиваясь: задержку в предоставлении материалов и оборудования, непредоставление доступа на Объект, несвоевременное согласование скрытых работ, задержку оплаты этапов), Подрядчик имеет право приостановить выполнение Работ.</p>
<p>2.3. При приостановке Работ по причинам, указанным в п. 2.2, сроки выполнения Работ соразмерно отодвигаются на всё время просрочки со стороны Заказчика. Подрядчик не несёт ответственности за нарушение общих сроков Договора в данном случае.</p>

<h3>3. Стоимость работ и порядок оплаты</h3>
{cost_type_html}
{payment_order_html}
<p><strong>3.2. График платежей:</strong></p>
{rows}

<h3>4. Права и обязанности сторон</h3>
<p>4.1. Подрядчик обязуется выполнить Работы качественно, в установленные сроки и передать результат Заказчику по Акту сдачи-приёмки.</p>
<p>4.2. Заказчик обязуется обеспечить доступ Подрядчика на Объект, своевременно принимать выполненные этапы Работ и производить оплату в соответствии с условиями настоящего Договора.</p>
<p>4.3. Подрядчик вправе отказаться от выполнения Работ и потребовать возмещения убытков в случае существенного нарушения Заказчиком условий настоящего Договора.</p>

<h3>5. Ответственность сторон</h3>
<p>5.1. За нарушение сроков выполнения Работ по вине Подрядчика Заказчик вправе потребовать уплаты неустойки в размере 0,1% от стоимости не выполненного в срок этапа Работ за каждый день просрочки.</p>
<p>5.2. За нарушение сроков оплаты по вине Заказчика Подрядчик вправе потребовать уплаты неустойки в размере 0,1% от неоплаченной суммы за каждый день просрочки.</p>
<p>5.3. Направление Актов сдачи-приёмки, отчётов, уведомлений о дополнительных работах и иных документов осуществляется Сторонами путём личного вручения либо с использованием мессенджеров (WhatsApp, Telegram) по номерам телефонов Сторон, указанным в разделе с реквизитами настоящего Договора. Документ считается полученным в день его отправки в мессенджере.</p>

<h3>6. Гарантии</h3>
<p>6.1. Подрядчик предоставляет гарантию на выполненные Работы сроком на 12 месяцев с момента подписания Акта сдачи-приёмки, за исключением случаев, предусмотренных п. 6.2.</p>
<p>6.2. Гарантия не распространяется на дефекты, возникшие вследствие нормального износа, нарушения Заказчиком правил эксплуатации, а также вмешательства третьих лиц в результаты Работ.</p>

<h3>7. Порядок приёмки работ</h3>
<p>7.1. По завершении каждого этапа/всех Работ Подрядчик уведомляет Заказчика о готовности к сдаче. Заказчик обязан в течение 3 (трёх) рабочих дней принять Работы либо предоставить мотивированный отказ с перечнем недостатков.</p>
<p>7.2. Приёмка Работ оформляется двусторонним Актом сдачи-приёмки выполненных Работ.</p>
<p>7.3. При обнаружении недостатков Подрядчик обязуется устранить их в согласованный Сторонами срок за свой счёт, если недостатки возникли по его вине.</p>

<h3>8. Форс-мажор и разрешение споров</h3>
<p>8.1. Стороны не несут ответственности за неисполнение обязательств, если оно вызвано обстоятельствами непреодолимой силы (форс-мажор), включая, помимо прочего, стихийные бедствия, действия органов власти, аварии в системах жизнеобеспечения.</p>
<p>8.2. Все споры и разногласия, возникающие из настоящего Договора, Стороны разрешают путём переговоров, а при недостижении согласия — в судебном порядке по месту нахождения Объекта.</p>

<h3>9. Заключительные положения</h3>
<p>9.1. Настоящий Договор вступает в силу с момента подписания обеими Сторонами и действует до полного исполнения Сторонами своих обязательств.</p>
<p>9.2. Все изменения и дополнения к настоящему Договору действительны при условии их совершения в письменной форме и подписания уполномоченными представителями Сторон.</p>
<p>9.3. Настоящий Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, по одному для каждой из Сторон.</p>

<h3>Реквизиты и подписи сторон</h3>
<table style="width:100%;margin-top:16px">
<tr>
<td style="width:50%;vertical-align:top;padding-right:16px">
<p><strong>ПОДРЯДЧИК</strong></p>
<p>{esc(company_name) or esc(contact_full_name)}</p>
<p>ИНН: {esc(company_inn)}</p>
<p>Юр. адрес: {esc(company_legal_address)}</p>
<p>Банк: {esc(company_bank_name)}</p>
<p>БИК: {esc(company_bik)}</p>
<p>Р/с: {esc(company_account_number)}</p>
<p>К/с: {esc(company_correspondent_account)}</p>
<p style="margin-top:24px">Подпись: _______________</p>
</td>
<td style="width:50%;vertical-align:top;padding-left:16px">
<p><strong>ЗАКАЗЧИК</strong></p>
<p>{esc(obj_client_name)}</p>
<p>Объект: {esc(obj_address)}</p>
<p style="margin-top:24px">Подпись: _______________</p>
</td>
</tr>
</table>
</div>
""".strip()
    return html


def handler(event: dict, context) -> dict:
    '''Конструктор договоров подряда: создание, редактирование и хранение договоров, сформированных на основе объекта, сметы и выбранных условий'''
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
        contract_id = params.get('id')
        object_id = params.get('object_id')
        action = params.get('action')

        if params.get('entity') == 'addendum':
            body = json.loads(event.get('body') or '{}') if method in ('POST', 'PUT') else {}
            ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')
            return addenda.handle(cur, conn, user, method, params, body, response, has_object_access, money_words, ip)

        if is_client and method == 'POST' and action == 'sign':
            cur.execute(
                "SELECT object_id, contract_number, signed_at, content_html FROM contracts WHERE id = %s AND company_id = %s",
                (contract_id, company_id)
            )
            row = cur.fetchone()
            if not row or not has_object_access(cur, user, row[0]):
                return response(404, {'error': 'Договор не найден'})
            obj_id, number, signed_at, content = row
            if signed_at:
                return response(200, {'success': True, 'status': 'signed'})
            cur.execute("SELECT NOW()")
            now = cur.fetchone()[0]
            stamp = f"{user['full_name']}, {now.strftime('%d.%m.%Y %H:%M')}"
            ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')
            cur.execute(
                "UPDATE contracts SET status = 'signed', signed_at = %s, signed_by = %s, signed_ip = %s, content_html = %s, updated_at = NOW() WHERE id = %s",
                (now, user['user_id'], (ip or '')[:64], apply_client_signature(content or '', stamp), contract_id)
            )
            cur.execute("SELECT object_code FROM objects WHERE id = %s", (obj_id,))
            code = (cur.fetchone() or [''])[0]
            cur.execute(
                "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
                (company_id, 'contract_signed', 'Заказчик подписал договор',
                 f"{user['full_name']} подписал договор № {number} по объекту {code}",
                 json.dumps({'object_id': obj_id, 'contract_id': int(contract_id)}))
            )
            conn.commit()
            return response(200, {'success': True, 'status': 'signed', 'signed_at': now})

        if is_client and method != 'GET':
            return response(403, {'error': 'Недостаточно прав'})

        if method == 'GET':
            if contract_id:
                cur.execute(
                    f"SELECT {', '.join(CONTRACT_KEYS)} FROM contracts WHERE id = %s AND company_id = %s",
                    (contract_id, company_id)
                )
                row = cur.fetchone()
                if not row:
                    return response(404, {'error': 'Договор не найден'})
                data = dict(zip(CONTRACT_KEYS, row))
                if not has_object_access(cur, user, data['object_id']):
                    return response(404, {'error': 'Договор не найден'})
                return response(200, data)

            base_cols = ', '.join(f'c.{k}' for k in CONTRACT_KEYS)
            if is_client:
                where = "c.company_id = %s AND c.object_id IN (SELECT object_id FROM object_access WHERE user_id = %s)"
                args = [company_id, user['user_id']]
                if object_id:
                    where += " AND c.object_id = %s"
                    args.append(object_id)
                cur.execute(
                    f"SELECT {base_cols}, o.object_code, o.client_name, o.address FROM contracts c "
                    f"JOIN objects o ON o.id = c.object_id WHERE {where} ORDER BY c.created_at DESC",
                    args
                )
            elif object_id:
                cur.execute(
                    f"SELECT {base_cols}, o.object_code, o.client_name, o.address FROM contracts c "
                    "JOIN objects o ON o.id = c.object_id WHERE c.object_id = %s AND c.company_id = %s ORDER BY c.created_at DESC",
                    (object_id, company_id)
                )
            else:
                cur.execute(
                    f"SELECT {base_cols}, o.object_code, o.client_name, o.address FROM contracts c "
                    "JOIN objects o ON o.id = c.object_id WHERE c.company_id = %s ORDER BY c.created_at DESC",
                    (company_id,)
                )
            rows = cur.fetchall()
            keys = CONTRACT_KEYS + ['object_code', 'client_name', 'address']
            return response(200, {'contracts': [dict(zip(keys, r)) for r in rows]})

        if method == 'POST' and action == 'send_email':
            body = json.loads(event.get('body') or '{}')
            to_email = (body.get('email') or '').strip()
            pdf_b64 = body.get('pdf_base64') or ''
            if not contract_id:
                return response(400, {'error': 'Не указан договор'})
            if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', to_email):
                return response(400, {'error': 'Укажите корректный email заказчика'})
            if not pdf_b64:
                return response(400, {'error': 'Нет файла договора'})
            if len(pdf_b64) > 9_000_000:
                return response(400, {'error': 'Файл договора слишком большой для отправки'})

            cur.execute(
                "SELECT c.contract_number, c.contract_date, o.client_name FROM contracts c "
                "JOIN objects o ON o.id = c.object_id WHERE c.id = %s AND c.company_id = %s",
                (contract_id, company_id)
            )
            row = cur.fetchone()
            if not row:
                return response(404, {'error': 'Договор не найден'})
            number, cdate, client_name = row
            cur.execute("SELECT name, phone, email FROM companies WHERE id = %s", (company_id,))
            comp = cur.fetchone() or ('', '', '')
            brand, comp_phone, comp_email = comp[0] or 'FixKey', comp[1] or '', comp[2] or ''

            title = (body.get('title') or 'Договор подряда').strip()[:120]
            note = (body.get('message') or '').strip()[:2000]
            e = html_lib.escape
            greet = f'Здравствуйте, {client_name}!' if client_name else 'Здравствуйте!'
            note_html = f'<p style="margin:0 0 14px;white-space:pre-line">{e(note)}</p>' if note else ''
            contacts = ' · '.join(x for x in [comp_phone, comp_email] if x)
            html_body = f'''<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#161616">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
<tr><td style="background:#5C3A11;padding:18px 24px;color:#fff;font-size:18px;font-weight:bold">{e(brand)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55">
<p style="margin:0 0 14px">{e(greet)}</p>
<p style="margin:0 0 14px">Направляем вам {e(title.lower() if title else 'договор')} № {e(str(number))}{f' от {cdate}' if cdate else ''}. Файл приложен к письму в формате PDF.</p>
{note_html}
<p style="margin:0 0 14px">Ознакомьтесь, пожалуйста, с условиями. Если появятся вопросы — просто ответьте на это письмо.</p>
<p style="margin:20px 0 0;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#777">С уважением, {e(brand)}{('<br/>' + e(contacts)) if contacts else ''}</p>
</td></tr></table></body></html>'''
            text_body = f"{greet}\n\nНаправляем вам {title} № {number}. Файл приложен к письму.\n\n{note}\n\nС уважением, {brand}\n{contacts}"
            ok, err = send_document_email(
                to_email, f'{title} № {number}', html_body, text_body, pdf_b64,
                f'Договор_{number}.pdf', brand, comp_email,
            )
            if not ok:
                return response(502, {'error': err})
            return response(200, {'success': True})

        if method == 'POST' and action == 'generate':
            body = json.loads(event.get('body') or '{}')
            obj_id = body.get('object_id')
            estimate_id = body.get('estimate_id')
            opts = body.get('options') or {}
            contract_number = (body.get('contract_number') or '').strip()
            contract_date = body.get('contract_date') or ''

            if not obj_id:
                return response(400, {'error': 'Не указан объект'})
            if not has_object_access(cur, user, obj_id):
                return response(403, {'error': 'Недостаточно прав'})

            cur.execute(
                "SELECT client_name, address, legal_status FROM objects WHERE id = %s AND company_id = %s",
                (obj_id, company_id)
            )
            obj_row = cur.fetchone()
            if not obj_row:
                return response(404, {'error': 'Объект не найден'})

            cur.execute(
                "SELECT name, inn, legal_address, bank_name, bik, account_number, bank_inn, bank_kpp, "
                "correspondent_account, contact_full_name FROM companies WHERE id = %s",
                (company_id,)
            )
            company_row = cur.fetchone() or ('', '', '', '', '', '', '', '', '', '')

            total_amount = 0
            if estimate_id:
                cur.execute(
                    "SELECT total_amount FROM estimates WHERE id = %s AND company_id = %s",
                    (estimate_id, company_id)
                )
                est_row = cur.fetchone()
                if est_row:
                    total_amount = est_row[0]

            if not contract_number:
                cur.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM contracts WHERE company_id = %s", (company_id,))
                contract_number = str(cur.fetchone()[0])

            html = build_contract_html(obj_row, company_row, opts, contract_number, contract_date, total_amount)

            return response(200, {'content_html': html, 'total_amount': total_amount, 'contract_number': contract_number})

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            obj_id = body.get('object_id')
            estimate_id = body.get('estimate_id')
            contract_number = (body.get('contract_number') or '').strip()
            contract_date = body.get('contract_date') or None
            template_key = body.get('template_key') or 'apartment_renovation'
            opts = body.get('options') or {}
            content_html = body.get('content_html') or ''
            total_amount = body.get('total_amount') or 0
            status = body.get('status') or 'draft'

            if not obj_id:
                return response(400, {'error': 'Не указан объект'})
            if not has_object_access(cur, user, obj_id):
                return response(403, {'error': 'Недостаточно прав'})
            if not contract_number:
                return response(400, {'error': 'Не указан номер договора'})

            cur.execute(
                "INSERT INTO contracts (company_id, object_id, estimate_id, contract_number, contract_date, "
                "status, template_key, options, content_html, total_amount, created_by) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    company_id, obj_id, estimate_id, contract_number, contract_date,
                    status, template_key, json.dumps(opts), content_html, total_amount, user['user_id'],
                )
            )
            new_id = cur.fetchone()[0]
            conn.commit()

            cur.execute(
                f"SELECT {', '.join(CONTRACT_KEYS)} FROM contracts WHERE id = %s",
                (new_id,)
            )
            row = cur.fetchone()
            return response(201, dict(zip(CONTRACT_KEYS, row)))

        if method == 'PUT':
            if not contract_id:
                return response(400, {'error': 'Не указан ID договора'})
            body = json.loads(event.get('body') or '{}')

            cur.execute("SELECT object_id, signed_at FROM contracts WHERE id = %s AND company_id = %s", (contract_id, company_id))
            existing = cur.fetchone()
            if not existing:
                return response(404, {'error': 'Договор не найден'})
            if existing[1] and any(k in body for k in ('content_html', 'total_amount', 'options', 'contract_number', 'contract_date')):
                return response(400, {'error': 'Заказчик уже подписал договор — менять его нельзя. Оформите изменения допсоглашением.'})
            if existing[1] and body.get('status') == 'draft':
                return response(400, {'error': 'Договор подписан заказчиком онлайн — вернуть в черновик нельзя'})

            fields = []
            values = []
            for key in ['contract_number', 'contract_date', 'status', 'template_key', 'content_html', 'total_amount', 'estimate_id']:
                if key in body:
                    fields.append(f"{key} = %s")
                    values.append(body[key])
            if 'options' in body:
                fields.append("options = %s")
                values.append(json.dumps(body['options']))

            if not fields:
                return response(400, {'error': 'Нет данных для обновления'})

            fields.append("updated_at = NOW()")
            values.append(contract_id)
            cur.execute(f"UPDATE contracts SET {', '.join(fields)} WHERE id = %s", values)
            conn.commit()

            cur.execute(f"SELECT {', '.join(CONTRACT_KEYS)} FROM contracts WHERE id = %s", (contract_id,))
            row = cur.fetchone()
            return response(200, dict(zip(CONTRACT_KEYS, row)))

        if method == 'DELETE':
            if not contract_id:
                return response(400, {'error': 'Не указан ID договора'})
            cur.execute("SELECT id FROM contracts WHERE id = %s AND company_id = %s", (contract_id, company_id))
            if not cur.fetchone():
                return response(404, {'error': 'Договор не найден'})
            cur.execute("DELETE FROM contract_addenda WHERE contract_id = %s", (contract_id,))
            cur.execute("UPDATE acts SET contract_id = NULL WHERE contract_id = %s", (contract_id,))
            cur.execute("UPDATE invoices SET contract_id = NULL WHERE contract_id = %s", (contract_id,))
            cur.execute("UPDATE company_expenses SET contract_id = NULL WHERE contract_id = %s AND company_id = %s", (contract_id, company_id))
            cur.execute("UPDATE executor_reports SET contract_id = NULL WHERE contract_id = %s AND company_id = %s", (contract_id, company_id))
            cur.execute("DELETE FROM contracts WHERE id = %s AND company_id = %s", (contract_id, company_id))
            conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Метод не поддерживается'})

    finally:
        cur.close()
        conn.close()