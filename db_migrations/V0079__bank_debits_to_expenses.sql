ALTER TABLE bank_operations ADD COLUMN IF NOT EXISTS direction VARCHAR(10) NOT NULL DEFAULT 'credit';
ALTER TABLE bank_operations ADD COLUMN IF NOT EXISTS expense_id INTEGER NULL;
ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS bank_operation_id INTEGER NULL REFERENCES bank_operations(id);
ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS payee_inn VARCHAR(20) NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_expenses_bank_op ON company_expenses(bank_operation_id) WHERE bank_operation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_operations_inbox ON bank_operations(company_id, direction, match_status);