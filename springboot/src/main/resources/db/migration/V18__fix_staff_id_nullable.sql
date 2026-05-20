-- V18__fix_staff_id_nullable.sql
-- staff_id can be null when a repair is completed without an assigned technician

ALTER TABLE repair_sales
  ALTER COLUMN staff_id DROP NOT NULL;