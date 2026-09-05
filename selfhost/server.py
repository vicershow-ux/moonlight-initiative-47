"""
Локальный сервер кабинета.

Запускает все функции из папки backend как обычное веб-приложение,
без облачной платформы. Каждая функция доступна по адресу /имя_функции.
"""
import base64
import importlib.util
import json
import os
import sys
import traceback
from pathlib import Path
from wsgiref.simple_server import make_server, WSGIRequestHandler

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": os.environ.get("CORS_ORIGIN", "*"),
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
        "Content-Type, X-Authorization, Authorization, X-User-Id, "
        "X-Auth-Token, X-Session-Id, X-Cookie",
    "Access-Control-Expose-Headers": "X-Set-Cookie",
    "Access-Control-Max-Age": "86400",
}


class Context:
    """Заменяет объект context облачной платформы."""

    def __init__(self, request_id: str):
        self.request_id = request_id
        self.function_name = "selfhost"
        self.function_version = "1"
        self.memory_limit_in_mb = 512

    def get_remaining_time_in_millis(self) -> int:
        return 300000


def load_handlers() -> dict:
    """Находит и загружает все функции из папки backend."""
    handlers = {}
    for entry in sorted(BACKEND_DIR.iterdir()):
        index = entry / "index.py"
        if not entry.is_dir() or not index.exists():
            continue

        if str(entry) not in sys.path:
            sys.path.insert(0, str(entry))

        spec = importlib.util.spec_from_file_location(f"fn_{entry.name}", index)
        module = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(module)
        except Exception:
            print(f"  [пропущена] {entry.name}: не удалось загрузить")
            traceback.print_exc()
            continue

        if hasattr(module, "handler"):
            handlers[entry.name] = module.handler
    return handlers


HANDLERS = load_handlers()


def build_event(environ) -> dict:
    """Собирает запрос в том виде, в каком его ждут функции."""
    headers = {}
    for key, value in environ.items():
        if key.startswith("HTTP_"):
            name = key[5:].replace("_", "-").title()
            headers[name] = value
    if environ.get("CONTENT_TYPE"):
        headers["Content-Type"] = environ["CONTENT_TYPE"]

    try:
        length = int(environ.get("CONTENT_LENGTH") or 0)
    except ValueError:
        length = 0
    raw = environ["wsgi.input"].read(length) if length else b""

    try:
        body = raw.decode("utf-8")
        is_base64 = False
    except UnicodeDecodeError:
        body = base64.b64encode(raw).decode("ascii")
        is_base64 = True

    params = {}
    for pair in (environ.get("QUERY_STRING") or "").split("&"):
        if not pair:
            continue
        key, _, value = pair.partition("=")
        from urllib.parse import unquote_plus
        params[unquote_plus(key)] = unquote_plus(value)

    return {
        "httpMethod": environ.get("REQUEST_METHOD", "GET"),
        "headers": headers,
        "queryStringParameters": params,
        "body": body,
        "isBase64Encoded": is_base64,
        "requestContext": {
            "identity": {
                "sourceIp": headers.get("X-Forwarded-For", "").split(",")[0].strip()
                or environ.get("REMOTE_ADDR", ""),
                "userAgent": headers.get("User-Agent", ""),
            },
            "requestId": headers.get("X-Request-Id", "local"),
        },
    }


def application(environ, start_response):
    path = environ.get("PATH_INFO", "/").strip("/")
    method = environ.get("REQUEST_METHOD", "GET")
    name = path.split("/")[0] if path else ""

    if method == "OPTIONS":
        start_response("200 OK", list(CORS_HEADERS.items()))
        return [b""]

    if name == "health":
        body = json.dumps(
            {"status": "ok", "functions": sorted(HANDLERS)}, ensure_ascii=False
        ).encode()
        headers = {"Content-Type": "application/json", **CORS_HEADERS}
        start_response("200 OK", list(headers.items()))
        return [body]

    handler = HANDLERS.get(name)
    if handler is None:
        body = json.dumps(
            {"error": f"Функция «{name}» не найдена", "available": sorted(HANDLERS)},
            ensure_ascii=False,
        ).encode()
        headers = {"Content-Type": "application/json", **CORS_HEADERS}
        start_response("404 Not Found", list(headers.items()))
        return [body]

    try:
        result = handler(build_event(environ), Context(os.urandom(8).hex())) or {}
    except Exception:
        traceback.print_exc()
        body = json.dumps({"error": "Внутренняя ошибка сервера"}, ensure_ascii=False).encode()
        headers = {"Content-Type": "application/json", **CORS_HEADERS}
        start_response("500 Internal Server Error", list(headers.items()))
        return [body]

    status = int(result.get("statusCode", 200))
    headers = dict(CORS_HEADERS)
    headers.setdefault("Content-Type", "application/json")
    for key, value in (result.get("headers") or {}).items():
        headers["Set-Cookie" if key.lower() == "x-set-cookie" else key] = value

    payload = result.get("body", "")
    if not isinstance(payload, str):
        payload = json.dumps(payload, ensure_ascii=False)
    data = (
        base64.b64decode(payload)
        if result.get("isBase64Encoded")
        else payload.encode("utf-8")
    )

    reasons = {200: "OK", 201: "Created", 400: "Bad Request", 401: "Unauthorized",
               403: "Forbidden", 404: "Not Found", 500: "Internal Server Error"}
    start_response(f"{status} {reasons.get(status, 'OK')}", list(headers.items()))
    return [data]


class QuietHandler(WSGIRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))


if __name__ == "__main__":
    if not os.environ.get("DATABASE_URL"):
        print("Не задан DATABASE_URL — укажите адрес базы данных в файле .env")
        sys.exit(1)

    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))

    print(f"Загружено функций: {len(HANDLERS)}")
    print(f"Сервер кабинета: http://{host}:{port}")
    print(f"Проверка: http://{host}:{port}/health\n")

    make_server(host, port, application, handler_class=QuietHandler).serve_forever()
