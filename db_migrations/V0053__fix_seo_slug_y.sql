-- На сайте «й» переводится как y (blagoustroystvo), а не j — приводим к адресам сайта
UPDATE site_page_seo
SET page_path = '/uslugi/blagoustroystvo', updated_at = now()
WHERE company_id = 2 AND page_path = '/uslugi/blagoustrojstvo';

UPDATE site_page_seo
SET page_path = '/uslugi/ustroystvo-polov', updated_at = now()
WHERE company_id = 2 AND page_path = '/uslugi/ustrojstvo-polov';
