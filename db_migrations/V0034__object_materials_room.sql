ALTER TABLE object_materials ADD COLUMN IF NOT EXISTS room_id INTEGER;
ALTER TABLE object_materials ADD COLUMN IF NOT EXISTS room_name VARCHAR(255) NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_obj_materials_room ON object_materials(room_id);
