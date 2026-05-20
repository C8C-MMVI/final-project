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
require_once __DIR__ . '/../includes/log.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

$targetId  = (int) ($data['user_id'] ?? 0);
$action    = $data['action'] ?? '';
$value     = $data['value']  ?? '';
$adminId   = (int) $_SESSION['user_id'];

if (!$targetId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid user ID.']);
    exit;
}

if ($targetId === $adminId) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'You cannot modify your own account.']);
    exit;
}

// ── Fetch target user for audit log ──────────────────────────────────────
$fetchUser = $pdo->prepare("SELECT username, role, status FROM users WHERE user_id = ?");
$fetchUser->execute([$targetId]);
$targetUser = $fetchUser->fetch(PDO::FETCH_ASSOC);

if (!$targetUser) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'User not found.']);
    exit;
}

// ── Role update ───────────────────────────────────────────────────────────
if ($action === 'role') {
    $allowedRoles = ['admin', 'owner', 'technician', 'customer'];
    if (!in_array($value, $allowedRoles, true)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid role.']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE users SET role = ? WHERE user_id = ?');
    $stmt->execute([$value, $targetId]);

    // ── Audit log ─────────────────────────────────────────────────────────
    write_log($pdo, $adminId, "Admin changed role of '{$targetUser['username']}' from '{$targetUser['role']}' to '{$value}'", 'info', $_SERVER['REMOTE_ADDR'] ?? null);

    echo json_encode(['success' => true, 'message' => 'Role updated successfully.']);
    exit;
}

// ── Status update ─────────────────────────────────────────────────────────
if ($action === 'status') {
    $allowedStatuses = ['active', 'inactive'];
    if (!in_array($value, $allowedStatuses, true)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid status.']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE users SET status = ? WHERE user_id = ?');
    $stmt->execute([$value, $targetId]);

    // ── Audit log ─────────────────────────────────────────────────────────
    write_log($pdo, $adminId, "Admin changed status of '{$targetUser['username']}' from '{$targetUser['status']}' to '{$value}'", 'info', $_SERVER['REMOTE_ADDR'] ?? null);

    echo json_encode(['success' => true, 'message' => 'Status updated successfully.']);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Invalid action.']);