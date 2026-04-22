-- ============================================================
-- V14: Add password_resets table
-- ============================================================

CREATE TABLE IF NOT EXISTS password_resets (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       REFERENCES users(user_id) ON DELETE CASCADE,
    token      VARCHAR(64)  NOT NULL UNIQUE,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token
    ON password_resets(token);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id
    ON password_resets(user_id);