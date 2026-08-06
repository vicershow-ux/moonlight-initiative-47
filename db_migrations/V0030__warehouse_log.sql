CREATE TABLE IF NOT EXISTS warehouse_log (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL DEFAULT '',
    action VARCHAR(40) NOT NULL,
    item_name VARCHAR(255) NOT NULL DEFAULT '',
    kind VARCHAR(30) NOT NULL DEFAULT '',
    unit VARCHAR(50) NOT NULL DEFAULT '',
    qty NUMERIC(12,2) NOT NULL DEFAULT 0,
    warehouse_name VARCHAR(255) NOT NULL DEFAULT '',
    object_code VARCHAR(50) NOT NULL DEFAULT '',
    details VARCHAR(500) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wh_log_company ON warehouse_log(company_id, created_at DESC);
