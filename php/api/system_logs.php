<?php
/**
 * api/system_logs.php  —  MongoDB version
 *
 * WHAT CHANGED FROM THE ORIGINAL:
 *   - Logs are now stored in MongoDB collection "system_logs" instead of PostgreSQL.
 *   - PostgreSQL $pdo is still required only for the user lookup (JOIN users).
 *   - GET  /api/system_logs          — admin: fetch last 50 logs
 *   - POST /api/system_logs          — any authenticated user: write a log entry
 *
 * MongoDB document shape:
 * {
 *   _id        : ObjectId,
 *   user_id    : int,
 *   username   : string,          // denormalised from PostgreSQL users table
 *   action     : string,
 *   log_type   : "info"|"warn"|"danger",
 *   ip_address : string,
 *   created_at : UTCDateTime
 * }
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';       // PostgreSQL $pdo
require_once __DIR__ . '/../mongo_config.php';     // MongoDB getMongoDb()

$userId = (int) $_SESSION['user_id'];
$role   = $_SESSION['role'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$mongo      = getMongoDb();
$collection = $mongo->system_logs;

// ── GET: admin fetches logs ────────────────────────────────────────────────
if ($method === 'GET') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    try {
        $cursor = $collection->find(
            [],
            [
                'sort'  => ['created_at' => -1],
                'limit' => 50,
            ]
        );

        $logs = [];
        foreach ($cursor as $doc) {
            $logs[] = [
                'log_id'     => (string) $doc['_id'],
                'user_id'    => $doc['user_id']    ?? null,
                'username'   => $doc['username']   ?? null,
                'action'     => $doc['action']     ?? '',
                'log_type'   => $doc['log_type']   ?? 'info',
                'ip_address' => $doc['ip_address'] ?? null,
                'created_at' => isset($doc['created_at'])
                    ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                    : null,
            ];
        }

        echo json_encode(['success' => true, 'logs' => $logs]);
    } catch (\Exception $e) {
        error_log('MongoDB system_logs GET error: ' . $e->getMessage());
        echo json_encode(['success' => true, 'logs' => []]);
    }
    exit;
}

// ── POST: write a log entry ────────────────────────────────────────────────
if ($method === 'POST') {
    $body     = json_decode(file_get_contents('php://input'), true) ?? [];
    $action   = trim($body['action']   ?? '');
    $logType  = trim($body['log_type'] ?? 'info');

    if (!$action) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'action is required.']);
        exit;
    }

    $allowedTypes = ['info', 'warn', 'danger'];
    if (!in_array($logType, $allowedTypes, true)) {
        $logType = 'info';
    }

    // Fetch username from PostgreSQL (denormalise into Mongo document)
    $username = null;
    try {
        $stmt = $pdo->prepare("SELECT username FROM users WHERE user_id = ?");
        $stmt->execute([$userId]);
        $username = $stmt->fetchColumn() ?: null;
    } catch (\PDOException $e) {
        // non-fatal — log without username
    }

    try {
        $result = $collection->insertOne([
            'user_id'    => $userId,
            'username'   => $username,
            'action'     => $action,
            'log_type'   => $logType,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'created_at' => new \MongoDB\BSON\UTCDateTime(),
        ]);

        echo json_encode([
            'success' => true,
            'log_id'  => (string) $result->getInsertedId(),
        ]);
    } catch (\Exception $e) {
        error_log('MongoDB system_logs POST error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to write log.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);