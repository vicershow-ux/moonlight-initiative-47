CREATE TABLE IF NOT EXISTS invoice_payments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    user_id INTEGER NULL REFERENCES users(id),
    provider VARCHAR(30) NOT NULL DEFAULT 'yookassa',
    provider_payment_id VARCHAR(100) NOT NULL,
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    confirmation_url TEXT NOT NULL DEFAULT '',
    applied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMP NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoice_payments_provider ON invoice_payments(provider, provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_online BOOLEAN NOT NULL DEFAULT FALSE;