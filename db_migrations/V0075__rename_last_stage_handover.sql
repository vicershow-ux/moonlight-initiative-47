UPDATE object_payments p SET title = 'Сдача объекта'
WHERE p.title ~* '^\s*Этап\s*\d+\s*$'
  AND p.id = (SELECT q.id FROM object_payments q WHERE q.object_id = p.object_id ORDER BY q.sort_order DESC, q.id DESC LIMIT 1)
  AND (SELECT count(*) FROM object_payments q WHERE q.object_id = p.object_id) > 1;

UPDATE contracts c
SET options = jsonb_set(
    c.options,
    ARRAY['custom_stages', (jsonb_array_length(c.options->'custom_stages') - 1)::text, 'label'],
    '"Сдача объекта"'::jsonb
)
WHERE jsonb_typeof(c.options->'custom_stages') = 'array'
  AND jsonb_array_length(c.options->'custom_stages') > 1
  AND (c.options->'custom_stages'->(jsonb_array_length(c.options->'custom_stages') - 1)->>'label') ~* '^\s*Этап\s*\d+\s*$';