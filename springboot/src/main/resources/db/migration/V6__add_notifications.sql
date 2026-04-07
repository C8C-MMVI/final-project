CREATE TABLE IF NOT EXISTS notifications (
    notification_id  BIGSERIAL  PRIMARY KEY,
    user_id          BIGINT     REFERENCES users(user_id),
    message          TEXT       NOT NULL,
    is_read          BOOLEAN    DEFAULT FALSE,
    created_at       TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);