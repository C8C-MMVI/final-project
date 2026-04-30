<?php
/**
 * api/notifications.php  —  MongoDB version
 *
 * WHAT CHANGED FROM THE ORIGINAL:
 *   - Notifications now stored in MongoDB collection "notifications".
 *   - All GET / PATCH / POST logic preserved exactly — same response shape.
 *   - PostgreSQL is no longer needed in this file.
 *
 * MongoDB document shape:
 * {
 *   _id             : ObjectId,
 *   user_id         : int,
 *   message         : string,
 *   is_read         : bool,
 *   created_at      : UTCDateTime
 * }
 */

require_once '../includes/auth.php';
require_once '../mongo_config.php';     // replaces db_config.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

authRequireRole(['admin', 'owner', 'technician', 'customer']);

$user_id = (int) $_SESSION['user_id'];
$method  = $_SERVER['REQUEST_METHOD'];
$action  = $_GET['action'] ?? '';

$mongo      = getMongoDb();
$collection = $mongo->notifications;

try {

    // ── GET — fetch notifications for logged-in user ───────────────────────
    if ($method === 'GET') {
        $cursor = $collection->find(
            ['user_id' => $user_id],
            ['sort' => ['created_at' => -1], 'limit' => 50]
        );

        $notifications = [];
        foreach ($cursor as $doc) {
            $notifications[] = [
                'notification_id' => (string) $doc['_id'],
                'message'         => $doc['message']    ?? '',
                'is_read'         => (bool)  ($doc['is_read'] ?? false),
                'created_at'      => isset($doc['created_at'])
                    ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                    : null,
            ];
        }

        $unread_count = count(array_filter($notifications, fn($n) => !$n['is_read']));

        echo json_encode([
            'success'       => true,
            'notifications' => $notifications,
            'unread_count'  => $unread_count,
        ]);
    }

    // ── PATCH ?action=read&id=X — mark one as read ────────────────────────
    elseif ($method === 'PATCH' && $action === 'read') {
        $raw_id = $_GET['id'] ?? '';
        if (!$raw_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing notification id']);
            exit;
        }

        try {
            $oid = new \MongoDB\BSON\ObjectId($raw_id);
        } catch (\Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid notification id']);
            exit;
        }

        $collection->updateOne(
            ['_id' => $oid, 'user_id' => $user_id],
            ['$set' => ['is_read' => true]]
        );

        echo json_encode(['success' => true]);
    }

    // ── PATCH ?action=read_all — mark all as read ─────────────────────────
    elseif ($method === 'PATCH' && $action === 'read_all') {
        $collection->updateMany(
            ['user_id' => $user_id, 'is_read' => false],
            ['$set'    => ['is_read' => true]]
        );

        echo json_encode(['success' => true]);
    }

    // ── POST — create a notification ──────────────────────────────────────
    elseif ($method === 'POST') {
        $body           = json_decode(file_get_contents('php://input'), true);
        $target_user_id = (int)   ($body['target_user_id'] ?? 0);
        $message        = trim($body['message'] ?? '');

        if (!$target_user_id || !$message) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'target_user_id and message are required']);
            exit;
        }

        $result = $collection->insertOne([
            'user_id'    => $target_user_id,
            'message'    => $message,
            'is_read'    => false,
            'created_at' => new \MongoDB\BSON\UTCDateTime(),
        ]);

        echo json_encode([
            'success'         => true,
            'notification_id' => (string) $result->getInsertedId(),
        ]);
    }

    else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }

} catch (\Exception $e) {
    error_log('MongoDB notifications error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}