-- Migration: Add link column to notifications table
-- This allows notifications to navigate to a specific page when clicked.

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS link VARCHAR(255) DEFAULT NULL;

COMMENT ON COLUMN notifications.link IS
  'Optional frontend route to navigate to when notification is clicked (e.g. /repairs/42)';