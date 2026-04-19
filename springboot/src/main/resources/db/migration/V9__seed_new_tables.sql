BEGIN;

-- ── Shop Requests ──
-- Simulating pending/approved/rejected applications
INSERT INTO shop_requests (user_id, shop_name, address, contact_number, status, rejection_reason, requested_at, reviewed_at, reviewed_by) VALUES
(1,  'TechFix Mandaluyong',  '123 Shaw Blvd, Mandaluyong',       '09171234561', 'approved', NULL,                        NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days',  51),
(2,  'GadgetPro Makati',     '456 Ayala Ave, Makati',            '09281234562', 'approved', NULL,                        NOW() - INTERVAL '9 days',  NOW() - INTERVAL '8 days',  51),
(3,  'RepairHub Quezon',     '789 Commonwealth Ave, Quezon City','09391234563', 'approved', NULL,                        NOW() - INTERVAL '8 days',  NOW() - INTERVAL '7 days',  51),
(4,  'SmartFix Pasig',       '321 Ortigas Ave, Pasig',           '09501234564', 'rejected', 'Incomplete business info.', NOW() - INTERVAL '7 days',  NOW() - INTERVAL '6 days',  51),
(5,  'CellCare Taguig',      '654 BGC, Taguig',                  '09171234565', 'pending',  NULL,                        NOW() - INTERVAL '2 days',  NULL,                        NULL),
(6,  'MobileMend Parañaque', '987 Dr. A. Santos Ave, Parañaque', '09281234566', 'pending',  NULL,                        NOW() - INTERVAL '1 day',   NULL,                        NULL);

-- ── Shop Technicians ──
-- Assigning technicians to shops using seeded users
INSERT INTO shop_technicians (shop_id, technician_id, appointed_by, appointed_at) VALUES
(1,  2,  1,  NOW() - INTERVAL '8 days'),
(2,  3,  2,  NOW() - INTERVAL '7 days'),
(3,  4,  3,  NOW() - INTERVAL '6 days'),
(4,  5,  4,  NOW() - INTERVAL '5 days'),
(5,  6,  5,  NOW() - INTERVAL '4 days'),
(6,  7,  6,  NOW() - INTERVAL '3 days'),
(7,  8,  7,  NOW() - INTERVAL '2 days'),
(8,  9,  8,  NOW() - INTERVAL '1 day');

-- ── Notifications ──
INSERT INTO notifications (user_id, message, is_read, created_at) VALUES
-- Admin notifications
(51, 'New shop request from TechFix Mandaluyong.',       TRUE,  NOW() - INTERVAL '10 days'),
(51, 'New shop request from GadgetPro Makati.',          TRUE,  NOW() - INTERVAL '9 days'),
(51, 'New shop request from RepairHub Quezon.',          TRUE,  NOW() - INTERVAL '8 days'),
(51, 'New shop request from SmartFix Pasig.',            TRUE,  NOW() - INTERVAL '7 days'),
(51, 'New shop request from CellCare Taguig.',           FALSE, NOW() - INTERVAL '2 days'),
(51, 'New shop request from MobileMend Parañaque.',      FALSE, NOW() - INTERVAL '1 day'),

-- Owner notifications
(1,  'Your shop request has been approved.',             TRUE,  NOW() - INTERVAL '9 days'),
(2,  'Your shop request has been approved.',             TRUE,  NOW() - INTERVAL '8 days'),
(3,  'Your shop request has been approved.',             TRUE,  NOW() - INTERVAL '7 days'),
(4,  'Your shop request has been rejected.',             TRUE,  NOW() - INTERVAL '6 days'),

-- Technician notifications
(2,  'You have been appointed to TechFix Mandaluyong.',  TRUE,  NOW() - INTERVAL '8 days'),
(3,  'You have been appointed to GadgetPro Makati.',     TRUE,  NOW() - INTERVAL '7 days'),
(4,  'You have been appointed to RepairHub Quezon.',     TRUE,  NOW() - INTERVAL '6 days'),
(5,  'You have been appointed to SmartFix Pasig.',       TRUE,  NOW() - INTERVAL '5 days'),
(6,  'You have been appointed to CellCare Taguig.',      FALSE, NOW() - INTERVAL '4 days'),

-- Customer notifications
(3,  'Your repair ticket is now being handled.',         FALSE, NOW() - INTERVAL '3 days'),
(4,  'Your repair ticket has been completed.',           TRUE,  NOW() - INTERVAL '2 days'),
(5,  'Your repair ticket is now being handled.',         FALSE, NOW() - INTERVAL '1 day');

COMMIT;