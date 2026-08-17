ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS max_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS legal_company_name VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS legal_updated_at VARCHAR(100) DEFAULT '',
  ADD COLUMN IF NOT EXISTS privacy_intro TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS privacy_body TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS terms_intro TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS terms_body TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cookies_intro TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cookies_body TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS lead_notify_email VARCHAR(255) DEFAULT '';

UPDATE site_settings SET max_url = '' WHERE max_url IS NULL;
UPDATE site_settings SET legal_updated_at = '17 августа 2026 года' WHERE COALESCE(legal_updated_at, '') = '';
UPDATE site_settings SET legal_company_name = brand_name WHERE COALESCE(legal_company_name, '') = '';