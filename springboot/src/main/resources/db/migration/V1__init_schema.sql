-- ============================================================
-- TechnoLogs Database Schema
-- Runs automatically on first PostgreSQL container startup
-- ============================================================

-- ── Users ──
CREATE TABLE IF NOT EXISTS users (
    user_id    BIGSERIAL    PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(100) UNIQUE,
    phone      VARCHAR(15),
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'customer'
                            CHECK (role IN ('admin', 'owner', 'technician', 'customer')),
    status     VARCHAR(10)  NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Shops ──
CREATE TABLE IF NOT EXISTS shops (
    shop_id        BIGSERIAL    PRIMARY KEY,
    shop_name      VARCHAR(100) NOT NULL,
    address        VARCHAR(255),
    contact_number VARCHAR(20),
    owner_id       BIGINT       REFERENCES users(user_id),
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── User Profiles ──
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id     BIGSERIAL    PRIMARY KEY,
    user_id        BIGINT       UNIQUE REFERENCES users(user_id),
    full_name      VARCHAR(100),
    contact_number VARCHAR(15),
    address        VARCHAR(255)
);

-- ── Repair Requests ──
CREATE TABLE IF NOT EXISTS repair_requests (
    request_id        BIGSERIAL    PRIMARY KEY,
    shop_id           BIGINT       REFERENCES shops(shop_id),
    customer_id       BIGINT       REFERENCES users(user_id),
    technician_id     BIGINT       REFERENCES users(user_id),
    device_type       VARCHAR(50),
    issue_description TEXT,
    media_file        VARCHAR(255),
    status            VARCHAR(20)  DEFAULT 'Pending'
                                   CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    technician_notes  TEXT,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Inventory Items ──
CREATE TABLE IF NOT EXISTS inventory_items (
    item_id   BIGSERIAL    PRIMARY KEY,
    shop_id   BIGINT       REFERENCES shops(shop_id),
    item_name VARCHAR(100) NOT NULL,
    category  VARCHAR(50),
    quantity  INT          DEFAULT 0,
    price     DECIMAL(10,2) DEFAULT 0.00
);

-- ── Sales Transactions ──
CREATE TABLE IF NOT EXISTS sales_transactions (
    transaction_id   BIGSERIAL    PRIMARY KEY,
    shop_id          BIGINT       REFERENCES shops(shop_id),
    customer_id      BIGINT       REFERENCES users(user_id),
    staff_id         BIGINT       REFERENCES users(user_id),
    total_amount     DECIMAL(10,2) DEFAULT 0.00,
    payment_method   VARCHAR(30),
    transaction_date TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── Sales Items ──
CREATE TABLE IF NOT EXISTS sales_items (
    sales_item_id  BIGSERIAL    PRIMARY KEY,
    transaction_id BIGINT       REFERENCES sales_transactions(transaction_id),
    item_id        BIGINT       REFERENCES inventory_items(item_id),
    quantity       INT          DEFAULT 1,
    price          DECIMAL(10,2) DEFAULT 0.00
);