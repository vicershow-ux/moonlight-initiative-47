INSERT INTO site_page_seo (
    company_id, page_path, page_kind, page_label,
    meta_title, meta_description, meta_keywords, h1_title, intro_text, sort_order
)
SELECT
    2,
    '/uslugi/' || s.slug,
    'service',
    s.category,
    s.category || ' в Хабаровске — цены на услуги | FixKey',
    s.category || ' в Хабаровске: прайс по каждой позиции от ' || trim(to_char(s.min_price, 'FM999999')) ||
        ' ₽, фиксированная смета до начала работ, бесплатный замер, гарантия 3 года.',
    lower(s.category) || ' хабаровск, ' || lower(s.category) || ' цена, ' ||
        lower(s.category) || ' под ключ, заказать ' || lower(s.category),
    s.category || ' в Хабаровске',
    'Выполняем ' || lower(s.category) || ' в Хабаровске и районе. Работаем по фиксированной смете, ' ||
        'соблюдаем технологию и сдаём результат с гарантией.',
    row_number() OVER (ORDER BY s.category) + 10
FROM (
    SELECT
        category,
        MIN(price) AS min_price,
        trim(both '-' from regexp_replace(
            lower(translate(
                category,
                'абвгдеёзийклмнопрстуфхыэАБВГДЕЁЗИЙКЛМНОПРСТУФХЫЭъьЪЬ',
                'abvgdeezijklmnoprstufhyeabvgdeezijklmnoprstufhye'
            )),
            '[^a-z0-9]+', '-', 'g'
        )) AS slug
    FROM services
    WHERE company_id = 2 AND is_active = true AND category <> '' AND price > 0
    GROUP BY category
) s
ON CONFLICT (company_id, page_path) DO NOTHING;
