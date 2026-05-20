ALTER TABLE shops ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
UPDATE shops SET status = 'approved';
