UPDATE services SET category = 'Кондиционирование'
WHERE company_id = 2 AND category = 'Вентиляция и кондиционирование' AND name ILIKE '%кондиционер%';

UPDATE services SET category = 'Вентиляция'
WHERE company_id = 2 AND category = 'Вентиляция и кондиционирование';

INSERT INTO services (company_id, name, unit, price, category, subcategory, description, is_active)
SELECT 2, 'Монтаж и настройка системы «Умный дом»', 'компл.', 25000, 'Умный дом', 'Основные работы',
       'Подбор оборудования, монтаж контроллера и датчиков, настройка сценариев и управления со смартфона.', true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE company_id = 2 AND category = 'Умный дом');

INSERT INTO services (company_id, name, unit, price, category, subcategory, description, is_active)
SELECT 2, 'Прокладка слаботочного кабеля (интернет, ТВ, видеонаблюдение)', 'м.п.', 120, 'Слаботочные работы', 'Основные работы',
       'Прокладка витой пары, телевизионного и сигнального кабеля в гофре или кабель-канале.', true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE company_id = 2 AND category = 'Слаботочные работы');

INSERT INTO site_philosophy_items (company_id, sort_order, title, description)
SELECT 2, 50, 'Личный кабинет заказчика',
       'После заключения договора вы получаете личный кабинет: чат с командой, все сметы, договоры и акты в одном месте, онлайн-оплата и фотоотчёты по этапам. Контролировать ремонт и давать обратную связь удобно из любой точки.'
WHERE NOT EXISTS (SELECT 1 FROM site_philosophy_items WHERE company_id = 2 AND title = 'Личный кабинет заказчика');