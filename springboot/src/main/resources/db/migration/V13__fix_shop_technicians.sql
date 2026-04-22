-- ============================================================
-- V13: Fix shop_technicians unique constraint + add index
-- ============================================================

-- Drop the overly strict UNIQUE on technician_id alone.
-- A technician should be unique per SHOP, not across all shops.
ALTER TABLE shop_technicians
    DROP CONSTRAINT IF EXISTS shop_technicians_technician_id_key;

-- Add a composite unique constraint instead:
-- one technician can only appear once per shop
ALTER TABLE shop_technicians
    ADD CONSTRAINT uq_shop_technician
    UNIQUE (shop_id, technician_id);

-- Index for fast lookups by technician
CREATE INDEX IF NOT EXISTS idx_shop_technicians_technician_id
    ON shop_technicians(technician_id);