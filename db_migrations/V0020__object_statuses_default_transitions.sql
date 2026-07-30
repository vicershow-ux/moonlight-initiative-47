INSERT INTO object_status_transitions (company_id, from_status_id, to_status_id)
SELECT f.company_id, f.id, t.id
FROM object_statuses f
JOIN object_statuses t ON t.company_id = f.company_id
WHERE (f.name, t.name) IN (
    ('лид', 'на замере'),
    ('лид', 'отменён'),
    ('на замере', 'КП отправлено'),
    ('на замере', 'отменён'),
    ('КП отправлено', 'на подписании'),
    ('КП отправлено', 'отменён'),
    ('на подписании', 'ожидание предоплаты'),
    ('ожидание предоплаты', 'в работе'),
    ('в работе', 'на паузе'),
    ('в работе', 'работы завершены'),
    ('на паузе', 'в работе'),
    ('работы завершены', 'ожидание финального платежа'),
    ('ожидание финального платежа', 'закрыт')
)
ON CONFLICT (from_status_id, to_status_id) DO NOTHING;
