CREATE TABLE IF NOT EXISTS estimate_items (
    id SERIAL PRIMARY KEY,
    estimate_id INTEGER REFERENCES estimates(id),
    service_id INTEGER REFERENCES services(id),
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'м²',
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate ON estimate_items(estimate_id);
