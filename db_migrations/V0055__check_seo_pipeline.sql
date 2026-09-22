-- Временная проверка: меняем заголовок, чтобы убедиться, что он доходит до сборки
UPDATE site_page_seo
SET meta_title = 'ПРОВЕРКА СВЯЗИ — плитка Хабаровск', updated_at = now()
WHERE company_id = 2 AND page_path = '/uslugi/plitochnye-raboty';
