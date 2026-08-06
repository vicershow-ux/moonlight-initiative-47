CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(150) NOT NULL DEFAULT '',
    unit VARCHAR(50) NOT NULL DEFAULT 'шт',
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    shop_name VARCHAR(255) NOT NULL DEFAULT '',
    shop_address VARCHAR(500) NOT NULL DEFAULT '',
    shop_phone VARCHAR(50) NOT NULL DEFAULT '',
    shop_url VARCHAR(500) NOT NULL DEFAULT '',
    note VARCHAR(500) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_materials_company ON materials(company_id);
