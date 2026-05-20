<?php
require_once '../includes/auth.php';
require_once '../db_config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST') {
    $body        = json_decode(file_get_contents('php://input'), true);
    $service_key = trim($body['_service_key'] ?? '');

    $expected_key    = getenv('APP_SERVICE_KEY') ?: '';
    $is_service_call = $expected_key !== '' && hash_equals($expected_key, $service_key);

    if (!$is_service_call) {
        authRequireRole(['admin', 'owner', 'technician', 'customer']);
    }

    $target_user_id = (int)  ($body['target_user_id'] ?? 0);
    $message        = trim($body['message'] ?? '');
    $link           = isset($body['link']) ? trim($body['link']) : null;

    if (!$target_user_id || !$message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'target_user_id and message are required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, message, link, is_read, created_at)
            VALUES (:uid, :msg, :link, FALSE, NOW())
            RETURNING notification_id
        ");
        $stmt->execute([
            ':uid'  => $target_user_id,
            ':msg'  => $message,
            ':link' => $link,
        ]);
        $row = $stmt->fetch();

        echo json_encode([
            'success'         => true,
            'notification_id' => (int) $row['notification_id'],
        ]);
    } catch (PDOException $e) {
        error_log('Notifications POST error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error.']);
    }
    exit;
}

authRequireRole(['admin', 'owner', 'technician', 'customer']);

$user_id = (int) $_SESSION['user_id'];

try {

    if ($method === 'GET') {
        $stmt = $pdo->prepare("
            SELECT notification_id, message, link, is_read,
                   TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') AS created_at
            FROM   notifications
            WHERE  user_id = :uid
              AND  LOWER(message) NOT LIKE '%sent you a message%'
              AND  LOWER(message) NOT LIKE '%new message%'
              AND  LOWER(message) NOT LIKE '%chat%'
            ORDER  BY created_at DESC
            LIMIT  50
        ");
        $stmt->execute([':uid' => $user_id]);
        $notifications = $stmt->fetchAll();

        foreach ($notifications as &$n) {
            $n['notification_id'] = (int)   $n['notification_id'];
            $n['is_read']         = (bool)  $n['is_read'];
            $n['link']            = $n['link'] ?: null;
        }
        unset($n);

        $unread_count = count(array_filter($notifications, fn($n) => !$n['is_read']));

        echo json_encode([
            'success'       => true,
            'notifications' => $notifications,
            'unread_count'  => $unread_count,
        ]);
    }

    elseif ($method === 'PATCH' && $action === 'read') {
        $id = (int) ($_GET['id'] ?? 0);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing notification id']);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE notifications
            SET    is_read = TRUE
            WHERE  notification_id = :id AND user_id = :uid
        ");
        $stmt->execute([':id' => $id, ':uid' => $user_id]);

        echo json_encode(['success' => true]);
    }

    elseif ($method === 'PATCH' && $action === 'read_all') {
        $stmt = $pdo->prepare("
            UPDATE notifications
            SET    is_read = TRUE
            WHERE  user_id = :uid AND is_read = FALSE
        ");
        $stmt->execute([':uid' => $user_id]);

        echo json_encode(['success' => true]);
    }

    else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }

} catch (PDOException $e) {
    error_log('Notifications error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}