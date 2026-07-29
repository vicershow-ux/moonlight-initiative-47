ALTER TABLE objects ALTER COLUMN has_elevator TYPE VARCHAR(20) USING (CASE WHEN has_elevator THEN 'есть' ELSE '' END);
ALTER TABLE objects ALTER COLUMN has_elevator SET DEFAULT '';

ALTER TABLE objects ALTER COLUMN material_unloading TYPE VARCHAR(20) USING (CASE WHEN material_unloading THEN 'есть' ELSE '' END);
ALTER TABLE objects ALTER COLUMN material_unloading SET DEFAULT '';

ALTER TABLE objects ALTER COLUMN rough_material SET DEFAULT '';
ALTER TABLE objects ALTER COLUMN finish_material SET DEFAULT '';
ALTER TABLE objects ALTER COLUMN kitchen_furniture SET DEFAULT '';

ALTER TABLE objects ADD COLUMN IF NOT EXISTS measurer_comment TEXT NOT NULL DEFAULT '';
ALTER TABLE objects ADD COLUMN IF NOT EXISTS design_project TEXT NOT NULL DEFAULT '';
