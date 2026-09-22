CREATE TABLE IF NOT EXISTS site_page_seo (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    page_path VARCHAR(255) NOT NULL,
    page_kind VARCHAR(32) NOT NULL DEFAULT 'service',
    page_label VARCHAR(255) NOT NULL DEFAULT '',
    meta_title VARCHAR(255) NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    meta_keywords TEXT NOT NULL DEFAULT '',
    h1_title VARCHAR(255) NOT NULL DEFAULT '',
    intro_text TEXT NOT NULL DEFAULT '',
    og_image TEXT NOT NULL DEFAULT '',
    is_indexed BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS site_page_seo_company_path_idx
    ON site_page_seo (company_id, page_path);
