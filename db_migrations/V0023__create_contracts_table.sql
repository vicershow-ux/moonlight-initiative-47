CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    estimate_id INTEGER REFERENCES estimates(id),
    contract_number VARCHAR(100) NOT NULL,
    contract_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    template_key VARCHAR(100) NOT NULL DEFAULT 'apartment_renovation',
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_html TEXT NOT NULL DEFAULT '',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_object_id ON contracts(object_id);
CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);
