CREATE TABLE IF NOT EXISTS system_logs (
    log_id     BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       REFERENCES users(user_id) ON DELETE SET NULL,
    action     TEXT         NOT NULL,
    log_type   VARCHAR(10)  DEFAULT 'info' CHECK (log_type IN ('info', 'warn', 'danger')),
    ip_address VARCHAR(45),
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);