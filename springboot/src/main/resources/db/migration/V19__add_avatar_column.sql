-- V19__add_avatar_column.sql
-- Adds avatar column to users table.
-- 'phone' already exists (was called 'contact' in code — fixed in PHP).

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'users'
          AND column_name  = 'avatar'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar VARCHAR(500) DEFAULT NULL;
        RAISE NOTICE 'Added column: users.avatar';
    ELSE
        RAISE NOTICE 'Column already exists: users.avatar';
    END IF;
END $$;