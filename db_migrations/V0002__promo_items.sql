CREATE TABLE IF NOT EXISTS site_promo_items (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'flyer',
    title TEXT NOT NULL DEFAULT '',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_site_promo_items_company ON site_promo_items (company_id, updated_at DESC);