-- ============================================================
-- V11: Add system_logs table + customers view for shop owners
-- ============================================================

-- ── System Logs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_logs (
    log_id     BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       REFERENCES users(user_id) ON DELETE SET NULL,
    action     TEXT         NOT NULL,
    log_type   VARCHAR(10)  NOT NULL DEFAULT 'info'
                            CHECK (log_type IN ('info', 'warn', 'danger')),
    ip_address VARCHAR(45),
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Index for fast log lookups ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at
    ON system_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_user_id
    ON system_logs(user_id);

-- ── Shop Customers View ───────────────────────────────────────
-- Used by /api/customers.php to return customers per shop owner
CREATE OR REPLACE VIEW shop_customers AS
SELECT
    r.shop_id,
    u.user_id,
    u.username,
    u.email,
    u.status,
    COUNT(r.request_id)                                     AS total_repairs,
    SUM(CASE WHEN r.status = 'Completed'   THEN 1 ELSE 0 END) AS completed_repairs,
    SUM(CASE WHEN r.status IN ('Pending', 'In Progress') THEN 1 ELSE 0 END) AS active_repairs,
    MAX(r.created_at)                                       AS last_visit
FROM users u
INNER JOIN repair_requests r ON r.customer_id = u.user_id
WHERE u.role = 'customer'
GROUP BY r.shop_id, u.user_id, u.username, u.email, u.status;

-- ── Indexes to speed up the customers query ───────────────────
CREATE INDEX IF NOT EXISTS idx_repair_requests_shop_id
    ON repair_requests(shop_id);

CREATE INDEX IF NOT EXISTS idx_repair_requests_customer_id
    ON repair_requests(customer_id);

CREATE INDEX IF NOT EXISTS idx_shops_owner_id
    ON shops(owner_id);