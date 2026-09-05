"""
Задаёт пароль пользователю напрямую в базе.

Нужен, если старый ключ шифрования паролей потерян и войти не получается.
Запуск:  python3 set-password.py почта@адрес.ru НовыйПароль
"""
import hashlib
import os
import sys

import psycopg2


def main() -> int:
    if len(sys.argv) != 3:
        print("Как пользоваться:")
        print("  python3 set-password.py почта@адрес.ru НовыйПароль")
        return 1

    email, password = sys.argv[1], sys.argv[2]

    if len(password) < 6:
        print("Пароль должен быть не короче 6 символов")
        return 1

    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        print("Не задан DATABASE_URL — проверьте файл .env")
        return 1

    salt = os.environ.get(
        "PASSWORD_SALT",
        os.environ.get("AWS_SECRET_ACCESS_KEY", "fixkey_salt"),
    )[:16]

    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), 100000
    ).hex()

    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    cur.execute("SELECT id, full_name, role FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    if not row:
        print(f"Пользователь с почтой {email} не найден.\n")
        cur.execute("SELECT email, full_name, role FROM users ORDER BY id")
        print("Есть такие учётные записи:")
        for mail, name, role in cur.fetchall():
            print(f"  {mail:35} {name} ({role})")
        cur.close()
        conn.close()
        return 1

    cur.execute(
        "UPDATE users SET password_hash = %s, is_active = TRUE WHERE email = %s",
        (pwd_hash, email),
    )
    cur.execute("DELETE FROM sessions WHERE user_id = %s", (row[0],))
    conn.commit()
    cur.close()
    conn.close()

    print(f"Пароль обновлён: {row[1]} ({row[2]})")
    print(f"Входите на сайте: почта {email}, новый пароль — тот, что вы указали")
    return 0


if __name__ == "__main__":
    sys.exit(main())
