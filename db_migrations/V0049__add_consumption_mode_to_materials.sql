ALTER TABLE t_p98567891_moonlight_initiative.materials
ADD COLUMN IF NOT EXISTS consumption_mode character varying(20) NOT NULL DEFAULT 'coverage';

COMMENT ON COLUMN t_p98567891_moonlight_initiative.materials.consumption_mode IS
'coverage — 1 единица материала покрывает N площади; per_unit — N единиц материала на 1 единицу площади';