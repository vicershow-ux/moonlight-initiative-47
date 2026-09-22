-- В translate() каждая буква меняется ровно на один символ, поэтому ж/ч/ш/я и т.п.
-- портили адрес. Сначала заменяем многобуквенные, затем остальные.
UPDATE site_page_seo p
SET page_path = '/uslugi/' || s.slug,
    updated_at = now()
FROM (
    SELECT
        category,
        trim(both '-' from regexp_replace(
            translate(
                replace(replace(replace(replace(replace(replace(replace(replace(replace(
                    lower(category),
                    'ж', 'zh'), 'ч', 'ch'), 'ш', 'sh'), 'щ', 'sch'), 'ю', 'yu'),
                    'я', 'ya'), 'ё', 'e'), 'ъ', ''), 'ь', ''),
                'абвгдезийклмнопрстуфхцыэ',
                'abvgdezijklmnoprstufhcye'
            ),
            '[^a-z0-9]+', '-', 'g'
        )) AS slug
    FROM services
    WHERE company_id = 2 AND is_active = true AND category <> '' AND price > 0
    GROUP BY category
) s
WHERE p.company_id = 2
  AND p.page_kind = 'service'
  AND p.page_label = s.category
  AND p.page_path <> '/uslugi/' || s.slug;
