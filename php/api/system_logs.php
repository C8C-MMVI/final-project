<?php
/**
 * api/system_logs.php
 * Admin only — reads system logs from PostgreSQL.
 * POST: any authenticated user can write a log entry.
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';
require_once __DIR__ . '/../includes/log.php';

$userId = (int) $_SESSION['user_id'];
$role   = $_SESSION['role'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ── FIX #4: Resolve real client IP (handles Docker gateway / reverse proxy) ──
$ip = null;
if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    // X-Forwarded-For can be a comma-separated list; take the first (original client)
    $ip = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
    $ip = $_SERVER['REMOTE_ADDR'];
}

// ── GET: admin fetches logs ────────────────────────────────────────────────
if ($method === 'GET') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    try {
        // ── Optional filters via query string ─────────────────────────────
        $conditions = [];
        $bindings   = [];

        if (!empty($_GET['log_type'])) {
            $allowed = ['info', 'warn', 'danger'];
            if (in_array($_GET['log_type'], $allowed, true)) {
                $conditions[] = 'sl.log_type = ?';
                $bindings[]   = $_GET['log_type'];
            }
        }

        if (!empty($_GET['search'])) {
            $conditions[] = '(sl.action ILIKE ? OR u.username ILIKE ?)';
            $term         = '%' . $_GET['search'] . '%';
            $bindings[]   = $term;
            $bindings[]   = $term;
        }

        $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $stmt = $pdo->prepare("
            SELECT
                sl.log_id,
                sl.user_id,
                u.username,
                sl.action,
                sl.log_type,
                sl.ip_address,
                sl.created_at
            FROM system_logs sl
            LEFT JOIN users u ON u.user_id = sl.user_id
            {$where}
            ORDER BY sl.created_at DESC
            LIMIT 100
        ");
        $stmt->execute($bindings);

        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'logs' => $logs]);

    } catch (PDOException $e) {
        error_log('system_logs GET error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch logs.']);
    }
    exit;
}

// ── POST: write a log entry ────────────────────────────────────────────────
if ($method === 'POST') {
    $body    = json_decode(file_get_contents('php://input'), true) ?? [];
    $action  = trim($body['action']   ?? '');
    $logType = trim($body['log_type'] ?? 'info');

    if (!$action) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'action is required.']);
        exit;
    }

    // ── FIX #2: Validate log_type on POST before writing ──────────────────
    $allowed = ['info', 'warn', 'danger'];
    if (!in_array($logType, $allowed, true)) {
        $logType = 'info'; // safe fallback instead of rejecting
    }

    // ── FIX #3: Wrap write_log in try/catch so errors return proper JSON ──
    try {
        write_log($pdo, $userId, $action, $logType, $ip);
        echo json_encode(['success' => true, 'message' => 'Log entry written.']);
    } catch (PDOException $e) {
        error_log('system_logs POST error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to write log.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);