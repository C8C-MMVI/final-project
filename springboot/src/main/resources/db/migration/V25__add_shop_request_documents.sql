-- V25__add_shop_request_documents.sql
-- Adds government document upload columns to shop_requests

ALTER TABLE shop_requests
    ADD COLUMN IF NOT EXISTS dti_permit       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS nc3_certificate  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS bir_permit       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS dit_permit       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS ntc_permit       VARCHAR(255);