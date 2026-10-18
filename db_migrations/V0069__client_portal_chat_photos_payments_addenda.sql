ALTER TABLE estimates ADD COLUMN IF NOT EXISTS client_approved_at TIMESTAMP NULL;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS client_approved_by INTEGER NULL REFERENCES users(id);

CREATE TABLE IF NOT EXISTS object_messages (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    body TEXT NOT NULL DEFAULT '',
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_object_messages_object ON object_messages(object_id, id);

CREATE TABLE IF NOT EXISTS object_message_reads (
    user_id INTEGER NOT NULL REFERENCES users(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    last_read_id INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, object_id)
);

CREATE TABLE IF NOT EXISTS object_photo_reports (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    stage VARCHAR(100) NOT NULL DEFAULT '',
    caption TEXT NOT NULL DEFAULT '',
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_object_photo_reports_object ON object_photo_reports(object_id, created_at);

CREATE TABLE IF NOT EXISTS object_payments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    due_date DATE NULL,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid_at DATE NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_object_payments_object ON object_payments(object_id, sort_order);

CREATE TABLE IF NOT EXISTS contract_addenda (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    contract_id INTEGER NOT NULL REFERENCES contracts(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    addendum_number VARCHAR(50) NOT NULL,
    addendum_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_html TEXT NOT NULL DEFAULT '',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_by INTEGER NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contract_addenda_contract ON contract_addenda(contract_id);