ALTER TABLE users ADD COLUMN IF NOT EXISTS position VARCHAR(30) NOT NULL DEFAULT 'manager';
UPDATE users SET position = 'super_admin' WHERE role IN ('owner', 'admin');
