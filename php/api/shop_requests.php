<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';
require_once __DIR__ . '/../includes/notify.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body      = json_decode(file_get_contents('php://input'), true);
    $requestId = (int) ($body['shop_id'] ?? 0);
    $action    = $body['action'] ?? '';

    if (!$requestId || !in_array($action, ['approve', 'reject'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid request.']);
        exit;
    }

    $newStatus = $action === 'approve' ? 'approved' : 'rejected';

    $stmt = $pdo->prepare("
        UPDATE shop_requests
        SET status = ?, reviewed_at = NOW(), reviewed_by = ?
        WHERE request_id = ?
    ");
    $stmt->execute([$newStatus, $_SESSION['user_id'], $requestId]);

    // Fetch the owner's user_id and shop name to notify them
    $infoStmt = $pdo->prepare("
        SELECT sr.shop_name, sr.user_id
        FROM shop_requests sr
        WHERE sr.request_id = ?
    ");
    $infoStmt->execute([$requestId]);
    $info = $infoStmt->fetch(PDO::FETCH_ASSOC);

    if ($info) {
        if ($action === 'approve') {
            notify($pdo, $info['user_id'],
                "Congratulations! Your shop \"{$info['shop_name']}\" has been approved. You can now start accepting repair requests."
            );
        } else {
            notify($pdo, $info['user_id'],
                "Your shop registration request for \"{$info['shop_name']}\" was not approved. Please contact support for more information."
            );
        }
    }

    // Audit log
    try {
        $shopName = $info['shop_name'] ?? "ID $requestId";
        $logType  = $action === 'approve' ? 'info' : 'warn';
        $logStmt  = $pdo->prepare("
            INSERT INTO system_logs (user_id, action, log_type, ip_address, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $logStmt->execute([
            $_SESSION['user_id'],
            "Admin {$action}d shop request: \"{$shopName}\"",
            $logType,
            $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
    } catch (PDOException $e) {
        error_log('Audit log failed: ' . $e->getMessage());
    }

    echo json_encode(['success' => true, 'status' => $newStatus]);
    exit;
}

// GET — all shop requests with requester info
try {
    $requests = $pdo->query("
        SELECT
            sr.request_id       AS shop_id,
            sr.shop_name,
            sr.address,
            sr.contact_number,
            LOWER(sr.status)    AS status,
            sr.requested_at     AS created_at,
            sr.rejection_reason,
            sr.reviewed_at,
            u.username          AS owner_name,
            u.email
        FROM shop_requests sr
        JOIN users u ON u.user_id = sr.user_id
        ORDER BY sr.requested_at DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'requests' => $requests]);
} catch (PDOException $e) {
    error_log('shop_requests GET failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}