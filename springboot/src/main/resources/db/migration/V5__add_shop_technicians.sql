CREATE TABLE IF NOT EXISTS shop_technicians (
    id             BIGSERIAL  PRIMARY KEY,
    shop_id        BIGINT     REFERENCES shops(shop_id),
    technician_id  BIGINT     UNIQUE REFERENCES users(user_id),
    appointed_by   BIGINT     REFERENCES users(user_id),
    appointed_at   TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);