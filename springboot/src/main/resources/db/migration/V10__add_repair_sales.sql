-- V10__add_repair_sales.sql
-- Spring Boot owns these two tables.
-- repair_requests remains owned by PHP — referenced by request_id only.

CREATE TABLE IF NOT EXISTS repair_sales (
    sale_id        BIGSERIAL       PRIMARY KEY,
    request_id     BIGINT          NOT NULL UNIQUE,   -- one sale per repair only
    shop_id        BIGINT          NOT NULL,
    customer_id    BIGINT          NOT NULL,
    staff_id       BIGINT          NOT NULL,
    amount         NUMERIC(10, 2)  NOT NULL DEFAULT 0.00,  -- auto-calculated from items
    payment_method VARCHAR(50)     NOT NULL,
    sold_at        DATE            NOT NULL
);

CREATE TABLE IF NOT EXISTS repair_sale_items (
    item_id     BIGSERIAL       PRIMARY KEY,
    sale_id     BIGINT          NOT NULL,
    description VARCHAR(255)    NOT NULL,
    quantity    INT             NOT NULL,
    unit_price  NUMERIC(10, 2)  NOT NULL,
    subtotal    NUMERIC(10, 2)  NOT NULL,   -- quantity × unit_price

    CONSTRAINT fk_sale_item_sale
        FOREIGN KEY (sale_id) REFERENCES repair_sales (sale_id)
        ON DELETE CASCADE
);