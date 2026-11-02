CREATE TABLE t_p98567891_moonlight_initiative.company_dadata_settings (
  company_id integer PRIMARY KEY REFERENCES t_p98567891_moonlight_initiative.companies(id),
  api_key varchar(200) NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  requests_count integer NOT NULL DEFAULT 0,
  last_used_at timestamp NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);