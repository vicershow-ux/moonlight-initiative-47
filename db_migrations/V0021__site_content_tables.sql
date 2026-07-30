CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL UNIQUE REFERENCES companies(id),

    brand_name VARCHAR(255) NOT NULL DEFAULT 'FixKey',
    logo_url TEXT NOT NULL DEFAULT '',
    favicon_url TEXT NOT NULL DEFAULT '',

    meta_title VARCHAR(255) NOT NULL DEFAULT 'FixKey — Ремонт квартир под ключ',
    meta_description TEXT NOT NULL DEFAULT 'FixKey — ремонт квартир и домов под ключ с гарантией результата.',

    phone VARCHAR(50) NOT NULL DEFAULT '+7 (495) 123-45-67',
    email VARCHAR(255) NOT NULL DEFAULT 'hello@fixkey.ru',
    telegram_url TEXT NOT NULL DEFAULT '',
    vk_url TEXT NOT NULL DEFAULT '',

    hero_eyebrow VARCHAR(255) NOT NULL DEFAULT 'Ремонт под ключ',
    hero_title_line1 VARCHAR(255) NOT NULL DEFAULT 'Ремонт, которому',
    hero_title_line2 VARCHAR(255) NOT NULL DEFAULT 'можно доверять',
    hero_bg_image TEXT NOT NULL DEFAULT '/images/hously-background.png',
    hero_fg_image TEXT NOT NULL DEFAULT '/images/hously-foreground.png',

    about_eyebrow VARCHAR(255) NOT NULL DEFAULT 'О компании',
    about_title_line1 VARCHAR(255) NOT NULL DEFAULT 'Ремонт с',
    about_title_highlight VARCHAR(255) NOT NULL DEFAULT 'гарантией',
    about_description TEXT NOT NULL DEFAULT 'FixKey — команда, которая берёт на себя весь ремонт под ключ: от демонтажа до сдачи объекта. Мы отвечаем за результат договором и гарантией.',
    about_image TEXT NOT NULL DEFAULT '/images/exterior.png',

    projects_eyebrow VARCHAR(255) NOT NULL DEFAULT 'Портфолио',
    projects_title VARCHAR(255) NOT NULL DEFAULT 'Наши объекты',

    services_eyebrow VARCHAR(255) NOT NULL DEFAULT 'Наши услуги',
    services_title_highlight VARCHAR(255) NOT NULL DEFAULT 'Опыт',
    services_title_rest VARCHAR(255) NOT NULL DEFAULT ', проверенный сотнями объектов',
    services_description TEXT NOT NULL DEFAULT 'Каждый проект курирует прораб с профильным образованием и опытом от 5 лет — от первого замера до сдачи ключей.',

    faq_eyebrow VARCHAR(255) NOT NULL DEFAULT 'Вопросы',
    faq_title VARCHAR(255) NOT NULL DEFAULT 'Частые вопросы',

    cta_eyebrow VARCHAR(255) NOT NULL DEFAULT 'Начать ремонт',
    cta_title_line1 VARCHAR(255) NOT NULL DEFAULT 'Готовы сделать',
    cta_title_highlight VARCHAR(255) NOT NULL DEFAULT 'без забот',
    cta_description TEXT NOT NULL DEFAULT 'Оставьте заявку на бесплатный замер — рассчитаем смету и сроки в течение 24 часов.',

    footer_description TEXT NOT NULL DEFAULT 'Ремонт квартир и домов под ключ с гарантией результата. Прозрачная смета и контроль на каждом этапе.',
    copyright_text VARCHAR(255) NOT NULL DEFAULT '© 2025 FixKey. Все права защищены.',

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_philosophy_items (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_projects (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL DEFAULT '',
    category VARCHAR(255) NOT NULL DEFAULT '',
    location VARCHAR(255) NOT NULL DEFAULT '',
    year VARCHAR(10) NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_expertise_items (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    icon VARCHAR(50) NOT NULL DEFAULT 'Home',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_faq_items (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    sort_order INTEGER NOT NULL DEFAULT 0,
    question TEXT NOT NULL DEFAULT '',
    answer TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
