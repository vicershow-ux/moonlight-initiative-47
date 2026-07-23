CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'м²',
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS objects (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    object_code VARCHAR(50) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    object_type VARCHAR(100) NOT NULL DEFAULT 'вторичка',
    area NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'лид',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS estimates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    object_id INTEGER REFERENCES objects(id),
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    object_id INTEGER REFERENCES objects(id),
    name VARCHAR(255) NOT NULL,
    file_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_invites (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_objects_company ON objects(company_id);
CREATE INDEX IF NOT EXISTS idx_estimates_company ON estimates(company_id);
