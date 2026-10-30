CREATE TABLE t_p98567891_moonlight_initiative.material_library (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES t_p98567891_moonlight_initiative.companies(id),
  name VARCHAR(160) NOT NULL,
  category VARCHAR(30) NOT NULL DEFAULT 'other',
  image_url TEXT NOT NULL,
  width NUMERIC(7,3) NOT NULL DEFAULT 1,
  height NUMERIC(7,3) NOT NULL DEFAULT 1,
  mode VARCHAR(10) NOT NULL DEFAULT 'repeat',
  gloss BOOLEAN NOT NULL DEFAULT FALSE,
  unit VARCHAR(10) NOT NULL DEFAULT 'm2',
  note VARCHAR(200) NULL,
  created_by INTEGER NULL REFERENCES t_p98567891_moonlight_initiative.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX material_library_company_idx ON t_p98567891_moonlight_initiative.material_library(company_id);