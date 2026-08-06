CREATE TABLE IF NOT EXISTS object_files (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL DEFAULT 'other',
    file_size INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_object_files_object ON object_files(object_id);
CREATE INDEX IF NOT EXISTS idx_object_files_company ON object_files(company_id);
