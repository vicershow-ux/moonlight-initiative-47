CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL DEFAULT '',
    responsible VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warehouses_company ON warehouses(company_id);

CREATE TABLE IF NOT EXISTS warehouse_items (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    name VARCHAR(255) NOT NULL,
    kind VARCHAR(20) NOT NULL DEFAULT 'материал',
    unit VARCHAR(50) NOT NULL DEFAULT 'шт',
    qty NUMERIC(12,2) NOT NULL DEFAULT 0,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    object_id INTEGER REFERENCES objects(id),
    issued_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
    issued_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wh_items_company ON warehouse_items(company_id);
CREATE INDEX IF NOT EXISTS idx_wh_items_object ON warehouse_items(object_id);
