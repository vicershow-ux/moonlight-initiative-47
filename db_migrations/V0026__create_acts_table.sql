CREATE TABLE IF NOT EXISTS acts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    contract_id INTEGER REFERENCES contracts(id),
    estimate_id INTEGER REFERENCES estimates(id),
    act_number VARCHAR(100) NOT NULL,
    act_date DATE NOT NULL DEFAULT CURRENT_DATE,
    act_type VARCHAR(100) NOT NULL DEFAULT 'acceptance',
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    content_html TEXT NOT NULL DEFAULT '',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acts_company ON acts(company_id);
CREATE INDEX IF NOT EXISTS idx_acts_object ON acts(object_id);
CREATE INDEX IF NOT EXISTS idx_acts_contract ON acts(contract_id);