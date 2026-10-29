CREATE TABLE IF NOT EXISTS site_promo_assets (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    kind VARCHAR(16) NOT NULL DEFAULT 'photo',
    name VARCHAR(200) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_site_promo_assets_company ON site_promo_assets (company_id, created_at DESC);