<?php
/**
 * api/notifications.php
 */

require_once '../includes/auth.php';
require_once '../db_config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Allow all 4 roles
authRequireRole(['admin', 'owner', 'technician', 'customer']);

$user_id = (int) $_SESSION['user_id'];
$method  = $_SERVER['REQUEST_METHOD'];
$action  = $_GET['action'] ?? '';

try {

    // ── GET — fetch notifications for logged-in user ───────────────────────
    if ($method === 'GET') {
        $stmt = $pdo->prepare("
            SELECT notification_id, message, is_read, created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute([$user_id]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Cast is_read to boolean so JS gets true/false not "t"/"f"
        foreach ($notifications as &$n) {
            $n['is_read'] = (bool) $n['is_read'];
        }
        unset($n);

        $unread_count = count(array_filter($notifications, fn($n) => !$n['is_read']));

        echo json_encode([
            'success'       => true,
            'notifications' => $notifications,
            'unread_count'  => $unread_count,
        ]);
    }

    // ── PATCH ?action=read&id=X — mark one as read ────────────────────────
    elseif ($method === 'PATCH' && $action === 'read') {
        $notification_id = (int) ($_GET['id'] ?? 0);

        if (!$notification_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing notification id']);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = ? AND user_id = ?
        ");
        $stmt->execute([$notification_id, $user_id]);

        echo json_encode(['success' => true]);
    }

    // ── PATCH ?action=read_all — mark all as read ─────────────────────────
    elseif ($method === 'PATCH' && $action === 'read_all') {
        $stmt = $pdo->prepare("
            UPDATE notifications
            SET is_read = TRUE
            WHERE user_id = ? AND is_read = FALSE
        ");
        $stmt->execute([$user_id]);

        echo json_encode(['success' => true]);
    }

    // ── POST — create a notification (internal use) ───────────────────────
    elseif ($method === 'POST') {
        $body           = json_decode(file_get_contents('php://input'), true);
        $target_user_id = (int) ($body['target_user_id'] ?? 0);
        $message        = trim($body['message'] ?? '');

        if (!$target_user_id || !$message) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'target_user_id and message are required']);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, message)
            VALUES (?, ?)
        ");
        $stmt->execute([$target_user_id, $message]);

        echo json_encode([
            'success'         => true,
            'notification_id' => (int) $pdo->lastInsertId(),
        ]);
    }

    else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}