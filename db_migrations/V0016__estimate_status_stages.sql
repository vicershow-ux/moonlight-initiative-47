-- Расширяем статусы (стадии) сметы: заменяем черновик/готово на полноценный список стадий
UPDATE estimates SET status = 'ready' WHERE status = 'draft';
ALTER TABLE estimates ALTER COLUMN status SET DEFAULT 'ready';
