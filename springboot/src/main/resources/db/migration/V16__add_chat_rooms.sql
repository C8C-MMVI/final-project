CREATE TABLE IF NOT EXISTS chat_rooms (
    room_id       BIGSERIAL   PRIMARY KEY,
    repair_id     BIGINT      NOT NULL UNIQUE,
    customer_id   BIGINT      NOT NULL,
    technician_id BIGINT      NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_repair     ON chat_rooms(repair_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_customer   ON chat_rooms(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_technician ON chat_rooms(technician_id);