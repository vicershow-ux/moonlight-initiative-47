CREATE TABLE IF NOT EXISTS rental_counterparties (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    party_kind VARCHAR(20) NOT NULL DEFAULT 'individual',
    display_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    passport_series VARCHAR(20) NOT NULL DEFAULT '',
    passport_number VARCHAR(20) NOT NULL DEFAULT '',
    passport_issued_by VARCHAR(500) NOT NULL DEFAULT '',
    passport_issued_date DATE NULL,
    passport_department_code VARCHAR(20) NOT NULL DEFAULT '',
    birth_date DATE NULL,
    registration_address VARCHAR(500) NOT NULL DEFAULT '',
    org_name VARCHAR(255) NOT NULL DEFAULT '',
    inn VARCHAR(20) NOT NULL DEFAULT '',
    kpp VARCHAR(20) NOT NULL DEFAULT '',
    ogrn VARCHAR(20) NOT NULL DEFAULT '',
    legal_address VARCHAR(500) NOT NULL DEFAULT '',
    bank_name VARCHAR(255) NOT NULL DEFAULT '',
    bik VARCHAR(20) NOT NULL DEFAULT '',
    account_number VARCHAR(40) NOT NULL DEFAULT '',
    correspondent_account VARCHAR(40) NOT NULL DEFAULT '',
    director_position VARCHAR(255) NOT NULL DEFAULT '',
    director_name VARCHAR(255) NOT NULL DEFAULT '',
    acts_basis VARCHAR(255) NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rental_cp_company ON rental_counterparties(company_id);

CREATE TABLE IF NOT EXISTS rentals (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    direction VARCHAR(10) NOT NULL DEFAULT 'out',
    rental_number VARCHAR(50) NOT NULL DEFAULT '',
    counterparty_id INTEGER REFERENCES rental_counterparties(id),
    warehouse_item_id INTEGER REFERENCES warehouse_items(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    object_id INTEGER REFERENCES objects(id),
    item_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'шт',
    qty NUMERIC(12,2) NOT NULL DEFAULT 1,
    rate NUMERIC(12,2) NOT NULL DEFAULT 0,
    rate_period VARCHAR(20) NOT NULL DEFAULT 'day',
    deposit NUMERIC(12,2) NOT NULL DEFAULT 0,
    date_from DATE NOT NULL DEFAULT CURRENT_DATE,
    date_to DATE NULL,
    returned_at TIMESTAMP NULL,
    returned_qty NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    condition_note TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rentals_company ON rentals(company_id);
CREATE INDEX IF NOT EXISTS idx_rentals_cp ON rentals(counterparty_id);
CREATE INDEX IF NOT EXISTS idx_rentals_item ON rentals(warehouse_item_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(company_id, status);

CREATE TABLE IF NOT EXISTS rental_contracts (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    rental_id INTEGER NOT NULL REFERENCES rentals(id),
    contract_number VARCHAR(50) NOT NULL DEFAULT '',
    contract_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_html TEXT NOT NULL DEFAULT '',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rental_contracts_company ON rental_contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_rental ON rental_contracts(rental_id);
