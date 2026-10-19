CREATE TABLE IF NOT EXISTS company_bank_settings (
    company_id INTEGER PRIMARY KEY REFERENCES companies(id),
    provider VARCHAR(30) NOT NULL DEFAULT 'tbank',
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    token TEXT NOT NULL DEFAULT '',
    account_number VARCHAR(20) NOT NULL DEFAULT '',
    auto_mark BOOLEAN NOT NULL DEFAULT TRUE,
    match_by_amount BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at TIMESTAMP NULL,
    last_error TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by INTEGER NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bank_operations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    provider VARCHAR(30) NOT NULL DEFAULT 'tbank',
    operation_id VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) NOT NULL DEFAULT '',
    operation_date TIMESTAMP NULL,
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    purpose TEXT NOT NULL DEFAULT '',
    payer_name TEXT NOT NULL DEFAULT '',
    payer_inn VARCHAR(20) NOT NULL DEFAULT '',
    document_number VARCHAR(50) NOT NULL DEFAULT '',
    invoice_id INTEGER NULL REFERENCES invoices(id),
    match_status VARCHAR(20) NOT NULL DEFAULT 'unmatched',
    match_reason TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_operations_uniq ON bank_operations(company_id, provider, operation_id);
CREATE INDEX IF NOT EXISTS idx_bank_operations_status ON bank_operations(company_id, match_status);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_source VARCHAR(20) NOT NULL DEFAULT '';