ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS calc_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS calc_eyebrow VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS calc_title VARCHAR(255) DEFAULT '',
  ADD COLUMN IF NOT EXISTS calc_description TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS calc_note TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS calc_price_cosmetic INTEGER DEFAULT 4500,
  ADD COLUMN IF NOT EXISTS calc_price_standard INTEGER DEFAULT 7500,
  ADD COLUMN IF NOT EXISTS calc_price_premium INTEGER DEFAULT 12000,
  ADD COLUMN IF NOT EXISTS calc_k_apartment NUMERIC(4,2) DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS calc_k_newbuild NUMERIC(4,2) DEFAULT 0.95,
  ADD COLUMN IF NOT EXISTS calc_k_house NUMERIC(4,2) DEFAULT 1.15,
  ADD COLUMN IF NOT EXISTS calc_k_bathroom NUMERIC(4,2) DEFAULT 1.60,
  ADD COLUMN IF NOT EXISTS calc_k_commercial NUMERIC(4,2) DEFAULT 1.10;

UPDATE site_settings
SET calc_eyebrow = 'Расчёт стоимости'
WHERE COALESCE(calc_eyebrow, '') = '';

UPDATE site_settings
SET calc_title = 'Сколько будет стоить ваш ремонт'
WHERE COALESCE(calc_title, '') = '';

UPDATE site_settings
SET calc_description = 'Укажите площадь, тип помещения и уровень отделки — покажем ориентировочную стоимость работ и отправим расчёт на согласование.'
WHERE COALESCE(calc_description, '') = '';

UPDATE site_settings
SET calc_note = 'Расчёт предварительный и не является публичной офертой. Точная смета составляется после бесплатного замера на объекте.'
WHERE COALESCE(calc_note, '') = '';