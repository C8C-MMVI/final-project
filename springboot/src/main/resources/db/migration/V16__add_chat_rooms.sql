-- V16: Chat rooms table
-- Messages are stored in MongoDB, only the room linking lives here

CREATE TABLE IF NOT EXISTS chat_rooms (
    room_id       BIGSERIAL   PRIMARY KEY,
    repair_id     INTEGER     NOT NULL UNIQUE REFERENCES repair_requests(request_id) ON DELETE CASCADE,
    customer_id   INTEGER     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    technician_id INTEGER     NULL     REFERENCES users(user_id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_repair       ON chat_rooms(repair_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_customer     ON chat_rooms(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_technician   ON chat_rooms(technician_id);