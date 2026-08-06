CREATE TABLE IF NOT EXISTS material_estimates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    title VARCHAR(255) NOT NULL DEFAULT 'Смета на материал',
    room_names VARCHAR(500) NOT NULL DEFAULT '',
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    items_json TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mat_est_company ON material_estimates(company_id);
CREATE INDEX IF NOT EXISTS idx_mat_est_object ON material_estimates(object_id);
