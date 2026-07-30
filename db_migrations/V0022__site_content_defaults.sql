INSERT INTO site_settings (company_id)
SELECT id FROM companies WHERE id NOT IN (SELECT company_id FROM site_settings);

INSERT INTO site_philosophy_items (company_id, sort_order, title, description)
SELECT c.id, s.sort_order, s.title, s.description
FROM companies c
CROSS JOIN (VALUES
    (10, 'Прозрачная смета', 'Фиксируем каждую позицию до начала работ. Никаких скрытых доплат — вы всегда знаете, за что платите.'),
    (20, 'Контроль на каждом этапе', 'Прораб и менеджер сопровождают проект от демонтажа до финальной уборки, с фотоотчётами на каждом шаге.'),
    (30, 'Проверенные бригады', 'Работаем только со штатными мастерами с опытом от 5 лет. Гарантия на все виды работ — в договоре.'),
    (40, 'Соблюдение сроков', 'Строим реалистичный график и держим его. Если задерживаем — компенсируем неустойкой по договору.')
) AS s(sort_order, title, description)
WHERE c.id NOT IN (SELECT DISTINCT company_id FROM site_philosophy_items);

INSERT INTO site_projects (company_id, sort_order, title, category, location, year, image_url)
SELECT c.id, s.sort_order, s.title, s.category, s.location, s.year, s.image_url
FROM companies c
CROSS JOIN (VALUES
    (10, 'Квартира на Тверской', 'Ремонт под ключ', 'Москва, 68 м²', '2024', '/images/hously-1.png'),
    (20, 'Студия у парка', 'Дизайнерский ремонт', 'Санкт-Петербург, 34 м²', '2023', '/images/hously-2.png'),
    (30, 'Дом у моря', 'Капитальный ремонт', 'Сочи, 140 м²', '2023', '/images/hously-3.png'),
    (40, 'Пентхаус на Казанской', 'Ремонт под ключ', 'Казань, 95 м²', '2024', '/images/hously-4.png')
) AS s(sort_order, title, category, location, year, image_url)
WHERE c.id NOT IN (SELECT DISTINCT company_id FROM site_projects);

INSERT INTO site_expertise_items (company_id, sort_order, title, description, icon)
SELECT c.id, s.sort_order, s.title, s.description, s.icon
FROM companies c
CROSS JOIN (VALUES
    (10, 'Ремонт квартир под ключ', 'Берём на себя весь цикл: демонтаж, черновые работы, чистовая отделка, сдача объекта с фотоотчётом.', 'Home'),
    (20, 'Ремонт коммерческих помещений', 'Офисы, магазины, шоу-румы — работаем в сжатые сроки, не останавливая бизнес заказчика дольше необходимого.', 'Building'),
    (30, 'Дизайн-проект интерьера', 'Разрабатываем визуализацию и рабочую документацию, чтобы результат совпал с ожиданиями до начала работ.', 'Armchair'),
    (40, 'Комплексное снабжение', 'Закупаем материалы и технику по вашему бюджету напрямую у поставщиков — без переплат и простоев на объекте.', 'Trees')
) AS s(sort_order, title, description, icon)
WHERE c.id NOT IN (SELECT DISTINCT company_id FROM site_expertise_items);

INSERT INTO site_faq_items (company_id, sort_order, question, answer)
SELECT c.id, s.sort_order, s.question, s.answer
FROM companies c
CROSS JOIN (VALUES
    (10, 'В каких регионах вы работаете?', 'Компания базируется в Москве, но мы реализуем проекты по всей России. Собираем бригаду и логистику под конкретный город и объект.'),
    (20, 'Сколько времени занимает ремонт?', 'Сроки зависят от площади и объёма работ. Типичная квартира 50-70 м² под ключ занимает от 6 до 10 недель. Точный график фиксируем в договоре до начала работ.'),
    (30, 'Из чего складывается смета?', 'Смета формируется из работ и материалов по факту замера объекта, без скрытых статей. Вы видите цену каждой позиции и подтверждаете её до старта.'),
    (40, 'Какие услуги вы предоставляете?', 'Полный цикл ремонта: демонтаж, черновые работы, инженерные системы, чистовая отделка, а также дизайн-проект и закупку материалов при необходимости.'),
    (50, 'Даёте ли вы гарантию на работы?', 'Да, гарантия на все виды работ фиксируется в договоре — от 1 до 3 лет в зависимости от типа работ. При выявлении дефектов устраняем их за свой счёт.'),
    (60, 'Как начать сотрудничество?', 'Начните с бесплатного замера объекта, где мы обсудим объём работ, бюджет и сроки. После этого подготовим детальную смету и договор с фиксированными условиями.')
) AS s(sort_order, question, answer)
WHERE c.id NOT IN (SELECT DISTINCT company_id FROM site_faq_items);
