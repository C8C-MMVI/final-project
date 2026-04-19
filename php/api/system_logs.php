<?php
// php/api/system_logs.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

// system_logs table doesn't exist yet in the schema — return empty gracefully.
// Once you create the table, this will automatically start returning real data.
//
// Suggested CREATE (add to a new migration):
//
//   CREATE TABLE IF NOT EXISTS system_logs (
//       log_id     BIGSERIAL   PRIMARY KEY,
//       user_id    BIGINT      REFERENCES users(user_id) ON DELETE SET NULL,
//       action     TEXT        NOT NULL,
//       log_type   VARCHAR(10) DEFAULT 'info' CHECK (log_type IN ('info', 'warn', 'danger')),
//       ip_address VARCHAR(45),
//       created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
//   );

try {
    $logs = $pdo->query("
        SELECT
            l.log_id,
            l.action,
            l.log_type,
            l.ip_address,
            l.created_at,
            u.username
        FROM system_logs l
        LEFT JOIN users u ON u.user_id = l.user_id
        ORDER BY l.created_at DESC
        LIMIT 50
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'logs' => $logs]);
} catch (PDOException $e) {
    // Table not yet created — return empty array so the UI shows "No logs yet."
    echo json_encode(['success' => true, 'logs' => []]);
}