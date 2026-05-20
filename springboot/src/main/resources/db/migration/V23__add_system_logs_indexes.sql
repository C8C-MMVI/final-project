-- V18__add_system_logs_indexes.sql
-- FIX #5: Add indexes to system_logs for faster queries.
-- ORDER BY created_at DESC and filtering by user_id were unindexed.

CREATE INDEX IF NOT EXISTS idx_system_logs_created_at
    ON system_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_logs_user_id
    ON system_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_system_logs_log_type
    ON system_logs (log_type);