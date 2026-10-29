CREATE TABLE t_p98567891_moonlight_initiative.furniture_library (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES t_p98567891_moonlight_initiative.companies(id),
  name VARCHAR(120) NOT NULL,
  base_kind VARCHAR(40) NOT NULL DEFAULT 'custom',
  width NUMERIC(6,3) NOT NULL,
  depth NUMERIC(6,3) NOT NULL,
  height NUMERIC(6,3) NOT NULL,
  at_wall BOOLEAN NOT NULL DEFAULT TRUE,
  blocks_heating BOOLEAN NOT NULL DEFAULT TRUE,
  blocks_sockets BOOLEAN NOT NULL DEFAULT FALSE,
  color VARCHAR(16) NULL,
  created_by INTEGER NULL REFERENCES t_p98567891_moonlight_initiative.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX furniture_library_company_idx ON t_p98567891_moonlight_initiative.furniture_library(company_id);