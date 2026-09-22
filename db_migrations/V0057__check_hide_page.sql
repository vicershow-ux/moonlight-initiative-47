-- Временная проверка механизма скрытия страницы от поиска
UPDATE site_page_seo SET is_indexed = false, updated_at = now()
WHERE company_id = 2 AND page_path = '/uslugi/zemlyanye-raboty';
