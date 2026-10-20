CREATE TABLE IF NOT EXISTS material_parser_state (
    company_id INTEGER PRIMARY KEY REFERENCES companies(id),
    strategy VARCHAR(30) NOT NULL DEFAULT 'desktop',
    last_check_at TIMESTAMP NULL,
    last_ok BOOLEAN NOT NULL DEFAULT false,
    last_message TEXT NOT NULL DEFAULT '',
    last_run_at TIMESTAMP NULL
);
ALTER TABLE materials ADD COLUMN IF NOT EXISTS parsed_at TIMESTAMP NULL;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS parse_status VARCHAR(30) NOT NULL DEFAULT '';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS parse_message TEXT NOT NULL DEFAULT '';