CREATE TABLE IF NOT EXISTS object_materials (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    material_id INTEGER REFERENCES materials(id),
    name VARCHAR(255) NOT NULL DEFAULT '',
    unit VARCHAR(50) NOT NULL DEFAULT 'шт',
    qty NUMERIC(12,2) NOT NULL DEFAULT 0,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    shop_name VARCHAR(255) NOT NULL DEFAULT '',
    note VARCHAR(500) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_obj_materials_company ON object_materials(company_id);
CREATE INDEX IF NOT EXISTS idx_obj_materials_object ON object_materials(object_id);
