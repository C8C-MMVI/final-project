INSERT INTO users (username, email, phone, password, role, status, created_at)
VALUES (
    'sysadmin',
    'admin@technologs.com',
    '09000000000',
    '$2y$10$ThrGtouYKKg0yBWUOvGDq.pVnVTWcY8Ub4iyngogqB5.7diWYjaOC',
    'admin',
    'active',
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO UPDATE SET
    password = '$2y$10$ThrGtouYKKg0yBWUOvGDq.pVnVTWcY8Ub4iyngogqB5.7diWYjaOC',
    role = 'admin',
    status = 'active';
