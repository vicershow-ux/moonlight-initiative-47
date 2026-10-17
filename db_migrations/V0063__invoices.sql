CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  object_id INTEGER NOT NULL REFERENCES objects(id),
  contract_id INTEGER NULL REFERENCES contracts(id),
  act_id INTEGER NULL REFERENCES acts(id),
  invoice_number TEXT NOT NULL DEFAULT '',
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NULL,
  purpose TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  vat_mode TEXT NOT NULL DEFAULT 'none',
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  apply_signature BOOLEAN NOT NULL DEFAULT FALSE,
  apply_stamp BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'issued',
  created_by INTEGER NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_object ON invoices(object_id);