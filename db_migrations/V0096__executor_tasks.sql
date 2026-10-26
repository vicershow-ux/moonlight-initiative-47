CREATE TABLE IF NOT EXISTS executor_tasks (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    executor_id INTEGER NOT NULL REFERENCES executors(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    due_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    executor_comment TEXT NOT NULL DEFAULT '',
    photos JSONB NOT NULL DEFAULT '[]'::jsonb,
    done_at TIMESTAMP NULL,
    created_by INTEGER NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_executor_tasks_exec ON executor_tasks (executor_id, status);
CREATE INDEX IF NOT EXISTS idx_executor_tasks_object ON executor_tasks (object_id);