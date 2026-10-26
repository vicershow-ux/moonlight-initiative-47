CREATE TABLE IF NOT EXISTS executors (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    kind VARCHAR(30) NOT NULL DEFAULT 'self_employed',
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    org_name VARCHAR(255) NOT NULL DEFAULT '',
    director_position VARCHAR(255) NOT NULL DEFAULT '',
    director_name VARCHAR(255) NOT NULL DEFAULT '',
    gender VARCHAR(1) NOT NULL DEFAULT 'm',
    inn VARCHAR(20) NOT NULL DEFAULT '',
    ogrnip VARCHAR(20) NOT NULL DEFAULT '',
    passport TEXT NOT NULL DEFAULT '',
    country VARCHAR(100) NOT NULL DEFAULT '',
    phone VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    account VARCHAR(40) NOT NULL DEFAULT '',
    bank_name VARCHAR(255) NOT NULL DEFAULT '',
    bik VARCHAR(20) NOT NULL DEFAULT '',
    corr_account VARCHAR(40) NOT NULL DEFAULT '',
    specialty VARCHAR(255) NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    user_id INTEGER NULL REFERENCES users(id),
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_executors_company ON executors (company_id);

CREATE TABLE IF NOT EXISTS executor_objects (
    executor_id INTEGER NOT NULL REFERENCES executors(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (executor_id, object_id)
);

CREATE TABLE IF NOT EXISTS executor_reports (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    executor_id INTEGER NOT NULL REFERENCES executors(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    contract_id INTEGER NULL REFERENCES contracts(id),
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    work_text TEXT NOT NULL DEFAULT '',
    progress_pct INTEGER NOT NULL DEFAULT 0,
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    reply TEXT NOT NULL DEFAULT '',
    created_by INTEGER NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS idx_executor_reports_company ON executor_reports (company_id, created_at);

ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS contract_id INTEGER NULL REFERENCES contracts(id);
ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS executor_id INTEGER NULL REFERENCES executors(id);
ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS source VARCHAR(30) NOT NULL DEFAULT '';
ALTER TABLE company_expenses ADD COLUMN IF NOT EXISTS source_id INTEGER NULL;
CREATE INDEX IF NOT EXISTS idx_company_expenses_source ON company_expenses (source, source_id);

INSERT INTO company_expenses (company_id, object_id, category, amount, expense_date, description, payee, created_by, attachments, source, source_id)
SELECT f.company_id, f.object_id, 'purchases', f.amount, f.created_at::date,
       'Чек по списку на закупку', f.shop_name, f.user_id,
       jsonb_build_array(jsonb_build_object('name', f.file_name, 'url', f.file_url, 'type', CASE WHEN f.file_type = 'photo' THEN 'photo' ELSE 'pdf' END, 'size', f.file_size)),
       'receipt', f.id
FROM object_files f
WHERE f.category = 'receipt' AND f.amount > 0
  AND NOT EXISTS (SELECT 1 FROM company_expenses e WHERE e.source = 'receipt' AND e.source_id = f.id);