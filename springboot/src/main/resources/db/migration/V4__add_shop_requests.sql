CREATE TABLE IF NOT EXISTS shop_requests (
    request_id       BIGSERIAL    PRIMARY KEY,
    user_id          BIGINT       REFERENCES users(user_id),
    shop_name        VARCHAR(100) NOT NULL,
    address          VARCHAR(255),
    contact_number   VARCHAR(11),
    status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    requested_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    reviewed_at      TIMESTAMP,
    reviewed_by      BIGINT       REFERENCES users(user_id)
);