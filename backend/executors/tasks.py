import json
from datetime import date

from common import response, clean_photos, display_name

TASK_KEYS = ['id', 'executor_id', 'object_id', 'title', 'description', 'due_date', 'status', 'executor_comment',
             'photos', 'done_at', 'created_at', 'updated_at', 'object_code', 'address', 'executor_name']

TASK_SELECT = (
    "SELECT t.id, t.executor_id, t.object_id, t.title, t.description, t.due_date, t.status, t.executor_comment, "
    "t.photos, t.done_at, t.created_at, t.updated_at, o.object_code, o.address, "
    "CASE WHEN e.kind = 'legal' THEN COALESCE(NULLIF(e.org_name, ''), e.full_name) ELSE e.full_name END "
    "FROM executor_tasks t JOIN objects o ON o.id = t.object_id JOIN executors e ON e.id = t.executor_id "
)

ORDER = " ORDER BY CASE t.status WHEN 'open' THEN 0 WHEN 'done' THEN 1 ELSE 2 END, t.due_date NULLS LAST, t.id DESC"


def rows(cur):
    return [dict(zip(TASK_KEYS, r)) for r in cur.fetchall()]


def clean_due(v):
    v = str(v or '')[:10]
    if not v:
        return None
    try:
        date.fromisoformat(v)
        return v
    except ValueError:
        return False


def handle_tasks(method, cur, conn, user, params, body):
    '''Задания исполнителям по объекту: постановка, правка, приёмка или возврат на доработку'''
    cid = user['company_id']
    if method == 'GET':
        where, args = "t.company_id = %s", [cid]
        for k in ('object_id', 'executor_id'):
            if params.get(k):
                where += f" AND t.{k} = %s"
                args.append(params[k])
        cur.execute(TASK_SELECT + f"WHERE {where}" + ORDER + " LIMIT 300", args)
        return response(200, {'tasks': rows(cur)})

    tid = params.get('id')
    if method == 'DELETE':
        cur.execute("DELETE FROM executor_tasks WHERE id = %s AND company_id = %s RETURNING id", (tid, cid))
        if not cur.fetchone():
            return response(404, {'error': 'Задание не найдено'})
        conn.commit()
        return response(200, {'deleted': True})

    if method == 'PUT' and body.get('status') in ('accepted', 'open') and 'title' not in body:
        cur.execute("UPDATE executor_tasks SET status = %s, updated_at = NOW(), "
                    "done_at = CASE WHEN %s = 'open' THEN NULL ELSE done_at END "
                    "WHERE id = %s AND company_id = %s RETURNING id",
                    (body['status'], body['status'], tid, cid))
        if not cur.fetchone():
            return response(404, {'error': 'Задание не найдено'})
        conn.commit()
        return response(200, {'ok': True})

    title = str(body.get('title') or '').strip()[:255]
    if len(title) < 3:
        return response(400, {'error': 'Опишите задание коротко в заголовке'})
    desc = str(body.get('description') or '').strip()[:4000]
    due = clean_due(body.get('due_date'))
    if due is False:
        return response(400, {'error': 'Неверный срок'})

    if method == 'PUT':
        cur.execute("UPDATE executor_tasks SET title = %s, description = %s, due_date = %s, updated_at = NOW() "
                    "WHERE id = %s AND company_id = %s RETURNING id", (title, desc, due, tid, cid))
        if not cur.fetchone():
            return response(404, {'error': 'Задание не найдено'})
        conn.commit()
        return response(200, {'id': int(tid)})

    eid, oid = body.get('executor_id'), body.get('object_id')
    cur.execute("SELECT 1 FROM executors WHERE id = %s AND company_id = %s AND is_archived = FALSE", (eid, cid))
    if not cur.fetchone():
        return response(400, {'error': 'Выберите исполнителя'})
    cur.execute("SELECT 1 FROM objects WHERE id = %s AND company_id = %s", (oid, cid))
    if not cur.fetchone():
        return response(400, {'error': 'Объект не найден'})
    cur.execute("INSERT INTO executor_objects (executor_id, object_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (eid, oid))
    cur.execute(
        "INSERT INTO executor_tasks (company_id, executor_id, object_id, title, description, due_date, created_by) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (cid, eid, oid, title, desc, due, user['user_id'])
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    return response(200, {'id': new_id})


def portal_tasks(cur, ex):
    cur.execute(TASK_SELECT + "WHERE t.executor_id = %s" + ORDER + " LIMIT 200", (ex['id'],))
    return rows(cur)


def portal_complete(cur, conn, ex, params, body):
    '''Исполнитель отмечает задание выполненным (с комментарием и фото) или снимает отметку'''
    tid = params.get('id')
    done = bool(body.get('done', True))
    if done:
        photos = json.dumps(clean_photos(ex['company_id'], body.get('photos')))
        comment = str(body.get('comment') or '').strip()[:2000]
        cur.execute("UPDATE executor_tasks SET status = 'done', done_at = NOW(), executor_comment = %s, photos = %s, "
                    "updated_at = NOW() WHERE id = %s AND executor_id = %s AND status = 'open' RETURNING title, object_id",
                    (comment, photos, tid, ex['id']))
    else:
        cur.execute("UPDATE executor_tasks SET status = 'open', done_at = NULL, updated_at = NOW() "
                    "WHERE id = %s AND executor_id = %s AND status = 'done' RETURNING title, object_id", (tid, ex['id']))
    r = cur.fetchone()
    if not r:
        return response(400, {'error': 'Задание уже принято или недоступно'})
    if done:
        cur.execute(
            "INSERT INTO notifications (company_id, type, title, message, payload) VALUES (%s, %s, %s, %s, %s)",
            (ex['company_id'], 'executor_task_done', 'Исполнитель выполнил задание',
             f"{display_name(ex)}: {r[0]}", json.dumps({'object_id': r[1], 'task_id': int(tid)}))
        )
    conn.commit()
    return response(200, {'ok': True})
