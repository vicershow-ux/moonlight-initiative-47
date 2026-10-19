CREATE TABLE IF NOT EXISTS company_expenses (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NULL REFERENCES objects(id),
    category VARCHAR(30) NOT NULL DEFAULT 'other',
    amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL DEFAULT '',
    payee VARCHAR(255) NOT NULL DEFAULT '',
    created_by INTEGER NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_company_expenses_company_date ON company_expenses(company_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_company_expenses_object ON company_expenses(object_id);