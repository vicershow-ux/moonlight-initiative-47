"""
Создаёт и обновляет таблицы базы данных.

Применяет по порядку все файлы из папки db_migrations и запоминает,
что уже применено. Повторный запуск безопасен.
"""
import os
import sys
from pathlib import Path

import psycopg2

BASE_DIR = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = BASE_DIR / "db_migrations"


def main() -> int:
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        print("Не задан DATABASE_URL")
        return 1

    files = sorted(MIGRATIONS_DIR.glob("V*.sql"))
    if not files:
        print("Файлы миграций не найдены")
        return 1

    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()

    cur.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        "  name TEXT PRIMARY KEY,"
        "  applied_at TIMESTAMP NOT NULL DEFAULT NOW())"
    )
    conn.commit()

    # Режим для перенесённой базы: таблицы уже есть, миграции применять не нужно
    if "--mark-applied" in sys.argv:
        for path in files:
            cur.execute(
                "INSERT INTO schema_migrations (name) VALUES (%s) "
                "ON CONFLICT (name) DO NOTHING",
                (path.name,),
            )
        conn.commit()
        cur.close()
        conn.close()
        print(f"База отмечена как актуальная ({len(files)} миграций)")
        return 0

    # Если таблицы уже есть, а отметок нет — база перенесена, но не отмечена
    cur.execute("SELECT to_regclass('users')")
    users_exists = cur.fetchone()[0] is not None
    cur.execute("SELECT COUNT(*) FROM schema_migrations")
    marks = cur.fetchone()[0]
    if users_exists and marks == 0:
        print(
            "Таблицы уже существуют, но миграции не отмечены.\n"
            "Похоже, база перенесена со старой платформы. Выполните:\n"
            "  docker compose exec -T api python3 migrate.py --mark-applied"
        )
        cur.close()
        conn.close()
        return 1

    cur.execute("SELECT name FROM schema_migrations")
    done = {row[0] for row in cur.fetchall()}

    applied = 0
    for path in files:
        if path.name in done:
            continue
        print(f"  применяю {path.name}")
        try:
            cur.execute(path.read_text(encoding="utf-8"))
            cur.execute(
                "INSERT INTO schema_migrations (name) VALUES (%s)", (path.name,)
            )
            conn.commit()
            applied += 1
        except Exception as exc:
            conn.rollback()
            print(f"\nОшибка в файле {path.name}:\n{exc}")
            cur.close()
            conn.close()
            return 1

    cur.close()
    conn.close()
    print(
        f"База готова: применено {applied}, всего файлов {len(files)}"
        if applied
        else f"База уже актуальна ({len(files)} миграций)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())