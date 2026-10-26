CREATE TABLE IF NOT EXISTS executor_messages (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    executor_id INTEGER NOT NULL REFERENCES executors(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    author VARCHAR(20) NOT NULL DEFAULT 'executor',
    user_id INTEGER NULL REFERENCES users(id),
    body TEXT NOT NULL DEFAULT '',
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    read_by_company BOOLEAN NOT NULL DEFAULT false,
    read_by_executor BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_executor_messages_thread ON executor_messages (object_id, executor_id, id);