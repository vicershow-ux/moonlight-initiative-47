CREATE TABLE IF NOT EXISTS object_plans (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    scheme JSONB NOT NULL DEFAULT '{}'::jsonb,
    default_height NUMERIC(6,2) NOT NULL DEFAULT 2.7,
    total_floor_area NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_wall_area NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_perimeter NUMERIC(12,2) NOT NULL DEFAULT 0,
    file_id INTEGER,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_object_plans_object ON object_plans(object_id);
CREATE INDEX IF NOT EXISTS idx_object_plans_company ON object_plans(company_id);
