CREATE TABLE IF NOT EXISTS material_offers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    material_id INTEGER NOT NULL REFERENCES materials(id),
    shop_name VARCHAR(255) NOT NULL DEFAULT '',
    shop_address VARCHAR(500) NOT NULL DEFAULT '',
    shop_phone VARCHAR(50) NOT NULL DEFAULT '',
    shop_url VARCHAR(500) NOT NULL DEFAULT '',
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_known BOOLEAN NOT NULL DEFAULT FALSE,
    note VARCHAR(500) NOT NULL DEFAULT '',
    checked_at TIMESTAMP NOT NULL DEFAULT now(),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_offers_material ON material_offers(material_id);
CREATE INDEX IF NOT EXISTS idx_material_offers_company ON material_offers(company_id);

INSERT INTO material_offers (company_id, material_id, shop_name, shop_address, shop_phone, shop_url, price, note)
SELECT m.company_id, m.id, m.shop_name, m.shop_address, m.shop_phone, m.shop_url, m.price, ''
FROM materials m
WHERE (coalesce(m.shop_name,'') <> '' OR m.price > 0)
  AND NOT EXISTS (SELECT 1 FROM material_offers o WHERE o.material_id = m.id);
