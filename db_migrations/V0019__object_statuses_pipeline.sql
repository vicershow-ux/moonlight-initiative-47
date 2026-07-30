CREATE TABLE IF NOT EXISTS object_statuses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT 'gray',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active_stage BOOLEAN NOT NULL DEFAULT FALSE,
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS object_status_transitions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    from_status_id INTEGER NOT NULL REFERENCES object_statuses(id),
    to_status_id INTEGER NOT NULL REFERENCES object_statuses(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(from_status_id, to_status_id)
);

INSERT INTO object_statuses (company_id, name, color, sort_order, is_default, is_active_stage, is_final)
SELECT c.id, s.name, s.color, s.sort_order, s.is_default, s.is_active_stage, s.is_final
FROM companies c
CROSS JOIN (VALUES
    ('лид', 'purple', 10, TRUE, FALSE, FALSE),
    ('на замере', 'blue', 20, FALSE, FALSE, FALSE),
    ('КП отправлено', 'cyan', 30, FALSE, FALSE, FALSE),
    ('на подписании', 'yellow', 40, FALSE, TRUE, FALSE),
    ('ожидание предоплаты', 'orange', 50, FALSE, TRUE, FALSE),
    ('в работе', 'green', 60, FALSE, TRUE, FALSE),
    ('на паузе', 'gray', 70, FALSE, TRUE, FALSE),
    ('работы завершены', 'teal', 80, FALSE, TRUE, FALSE),
    ('ожидание финального платежа', 'emerald', 90, FALSE, TRUE, FALSE),
    ('закрыт', 'slate', 100, FALSE, FALSE, TRUE),
    ('отменён', 'red', 110, FALSE, FALSE, TRUE)
) AS s(name, color, sort_order, is_default, is_active_stage, is_final);
