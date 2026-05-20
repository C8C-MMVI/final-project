-- V18__add_terms_accepted.sql
-- Adds terms_accepted flag to users table

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terms_accepted     BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS terms_accepted_at  TIMESTAMPTZ NULL;

-- Back-fill existing users so the column is not null for old rows
UPDATE users SET terms_accepted = TRUE, terms_accepted_at = NOW()
WHERE terms_accepted = FALSE;

COMMENT ON COLUMN users.terms_accepted    IS 'Whether the user accepted the Terms & Conditions at registration.';
COMMENT ON COLUMN users.terms_accepted_at IS 'Timestamp when the user accepted the Terms & Conditions.';