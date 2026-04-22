-- ============================================================
-- V12: Add reviews table for technician ratings
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    review_id   BIGSERIAL  PRIMARY KEY,
    request_id  BIGINT     REFERENCES repair_requests(request_id) ON DELETE CASCADE,
    customer_id BIGINT     REFERENCES users(user_id) ON DELETE SET NULL,
    rating      SMALLINT   NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_request_id
    ON reviews(request_id);

CREATE INDEX IF NOT EXISTS idx_reviews_customer_id
    ON reviews(customer_id);