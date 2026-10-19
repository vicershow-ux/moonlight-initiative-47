CREATE TABLE IF NOT EXISTS company_payment_settings (
    company_id INTEGER PRIMARY KEY REFERENCES companies(id),
    provider VARCHAR(30) NOT NULL DEFAULT 'yookassa',
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    shop_id VARCHAR(50) NOT NULL DEFAULT '',
    secret_key TEXT NOT NULL DEFAULT '',
    receipts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    tax_system_code INTEGER NOT NULL DEFAULT 0,
    default_vat_code INTEGER NOT NULL DEFAULT 1,
    use_invoice_vat BOOLEAN NOT NULL DEFAULT TRUE,
    payment_subject VARCHAR(30) NOT NULL DEFAULT 'service',
    payment_mode VARCHAR(30) NOT NULL DEFAULT 'full_payment',
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by INTEGER NULL REFERENCES users(id)
);
ALTER TABLE invoice_payments ADD COLUMN IF NOT EXISTS receipt_email VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE invoice_payments ADD COLUMN IF NOT EXISTS receipt_sent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE invoice_payments ADD COLUMN IF NOT EXISTS error TEXT NOT NULL DEFAULT '';