<?php
/**
 * api/update_user.php
 * Admin only — updates user role or status.
 * Receives JSON: { user_id, action, value }
 * action: 'role' | 'status'
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

$userId = (int) ($data['user_id'] ?? 0);
$action = $data['action'] ?? '';
$value  = $data['value']  ?? '';

if (!$userId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user ID.']);
    exit;
}

if ($userId === (int) $_SESSION['user_id']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You cannot modify your own account.']);
    exit;
}

if ($action === 'role') {
    $allowedRoles = ['owner', 'technician', 'customer'];
    if (!in_array($value, $allowedRoles)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid role.']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE users SET role = ? WHERE user_id = ?');
    $stmt->execute([$value, $userId]);
    echo json_encode(['success' => true, 'message' => 'Role updated successfully.']);
    exit;
}

if ($action === 'status') {
    $allowedStatuses = ['active', 'inactive'];
    if (!in_array($value, $allowedStatuses)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid status.']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE users SET status = ? WHERE user_id = ?');
    $stmt->execute([$value, $userId]);
    echo json_encode(['success' => true, 'message' => 'Status updated successfully.']);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Invalid action.']);