import json

from common import response, upload_photo, display_name

MSG_KEYS = ['id', 'executor_id', 'object_id', 'author', 'author_name', 'body', 'photos', 'created_at']

MSG_SELECT = (
    "SELECT m.id, m.executor_id, m.object_id, m.author, "
    "CASE WHEN m.author = 'executor' THEN "
    "  (CASE WHEN e.kind = 'legal' THEN COALESCE(NULLIF(e.org_name, ''), e.full_name) ELSE e.full_name END) "
    "ELSE COALESCE(u.full_name, '') END, m.body, m.photos, m.created_at "
    "FROM executor_messages m JOIN executors e ON e.id = m.executor_id LEFT JOIN users u ON u.id = m.user_id "
)

MAX_PHOTOS = 6


def _upload_all(company_id, photos):
    '''Фото приходят как base64 — сжимаются в браузере, здесь только сохраняем'''
    urls = []
    for p in (photos or [])[:MAX_PHOTOS]:
        if not isinstance(p, dict):
            continue
        url, err = upload_photo(company_id, str(p.get('file_name') or 'photo.jpg'), str(p.get('data') or ''))
        if err:
            return None, err
        urls.append(url)
    return urls, None


def _thread(cur, object_id, executor_id, after):
    cur.execute(MSG_SELECT + "WHERE m.object_id = %s AND m.executor_id = %s AND m.id > %s ORDER BY m.id LIMIT 300",
                (object_id, executor_id, int(after or 0)))
    return [dict(zip(MSG_KEYS, r)) for r in cur.fetchall()]


def _clean_body(body):
    return str(body.get('body') or '').strip()[:4000]


def handle_chat(method, cur, conn, user, params, body):
    '''Чат компании с исполнителем по объекту: список собеседников, переписка, отправка'''
    cid = user['company_id']
    object_id = params.get('object_id')
    cur.execute("SELECT 1 FROM objects WHERE id = %s AND company_id = %s", (object_id, cid))
    if not cur.fetchone():
        return response(404, {'error': 'Объект не найден'})

    if method == 'GET' and not params.get('executor_id'):
        cur.execute(
            "SELECT e.id, CASE WHEN e.kind = 'legal' THEN COALESCE(NULLIF(e.org_name, ''), e.full_name) ELSE e.full_name END, "
            "e.specialty, e.access_enabled, "
            "(SELECT COUNT(*) FROM executor_messages m WHERE m.object_id = %s AND m.executor_id = e.id "
            "  AND m.author = 'executor' AND m.read_by_company = FALSE), "
            "(SELECT MAX(created_at) FROM executor_messages m WHERE m.object_id = %s AND m.executor_id = e.id) "
            "FROM executors e WHERE e.company_id = %s AND e.is_archived = FALSE AND e.id IN ("
            "  SELECT executor_id FROM executor_objects WHERE object_id = %s "
            "  UNION SELECT (options->>'executor_id')::int FROM contracts WHERE object_id = %s "
            "    AND options->>'executor_id' ~ '^[0-9]+$' "
            "  UNION SELECT executor_id FROM executor_messages WHERE object_id = %s) "
            "ORDER BY 6 DESC NULLS LAST, 2",
            (object_id, object_id, cid, object_id, object_id, object_id)
        )
        threads = [{'executor_id': a, 'name': b, 'specialty': c or '', 'access_enabled': d, 'unread': n, 'last_at': t}
                   for a, b, c, d, n, t in cur.fetchall()]
        return response(200, {'threads': threads})

    executor_id = params.get('executor_id')
    cur.execute("SELECT 1 FROM executors WHERE id = %s AND company_id = %s", (executor_id, cid))
    if not cur.fetchone():
        return response(404, {'error': 'Исполнитель не найден'})

    if method == 'GET':
        msgs = _thread(cur, object_id, executor_id, params.get('after'))
        cur.execute("UPDATE executor_messages SET read_by_company = TRUE WHERE object_id = %s AND executor_id = %s "
                    "AND author = 'executor' AND read_by_company = FALSE", (object_id, executor_id))
        conn.commit()
        return response(200, {'messages': msgs})

    text = _clean_body(body)
    urls, err = _upload_all(cid, body.get('photos'))
    if err:
        return response(400, {'error': err})
    if not text and not urls:
        return response(400, {'error': 'Напишите сообщение или приложите фото'})
    cur.execute(
        "INSERT INTO executor_messages (company_id, executor_id, object_id, author, user_id, body, photos, read_by_company) "
        "VALUES (%s, %s, %s, 'company', %s, %s, %s, TRUE) RETURNING id",
        (cid, executor_id, object_id, user['user_id'], text, json.dumps(urls))
    )
    new_id = cur.fetchone()[0]
    cur.execute("INSERT INTO executor_objects (executor_id, object_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (executor_id, object_id))
    conn.commit()
    return response(200, {'id': new_id})


def portal_chat(method, cur, conn, ex, params, body, can_access_object):
    '''Чат исполнителя с заказчиком работ по его объекту'''
    object_id = params.get('object_id')
    if method == 'GET' and not object_id:
        cur.execute(
            "SELECT object_id, COUNT(*) FROM executor_messages WHERE executor_id = %s AND author = 'company' "
            "AND read_by_executor = FALSE GROUP BY 1", (ex['id'],))
        return response(200, {'unread': {str(a): b for a, b in cur.fetchall()}})
    if not object_id or not can_access_object(cur, ex, object_id):
        return response(403, {'error': 'Нет доступа к объекту'})

    if method == 'GET':
        msgs = _thread(cur, object_id, ex['id'], params.get('after'))
        cur.execute("UPDATE executor_messages SET read_by_executor = TRUE WHERE object_id = %s AND executor_id = %s "
                    "AND author = 'company' AND read_by_executor = FALSE", (object_id, ex['id']))
        conn.commit()
        return response(200, {'messages': msgs})

    text = _clean_body(body)
    urls, err = _upload_all(ex['company_id'], body.get('photos'))
    if err:
        return response(400, {'error': err})
    if not text and not urls:
        return response(400, {'error': 'Напишите сообщение или приложите фото'})
    cur.execute(
        "INSERT INTO executor_messages (company_id, executor_id, object_id, author, body, photos, read_by_executor) "
        "VALUES (%s, %s, %s, 'executor', %s, %s, TRUE) RETURNING id",
        (ex['company_id'], ex['id'], object_id, text, json.dumps(urls))
    )
    new_id = cur.fetchone()[0]
    cur.execute("SELECT object_code FROM objects WHERE id = %s", (object_id,))
    code = (cur.fetchone() or [''])[0]
    preview = text[:120] if text else 'Фото'
    cur.execute(
        "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
        (ex['company_id'], 'executor_message', f'Сообщение от исполнителя · {code}',
         f"{display_name(ex)}: {preview}", json.dumps({'object_id': int(object_id), 'executor_id': ex['id']}))
    )
    conn.commit()
    return response(200, {'id': new_id})
