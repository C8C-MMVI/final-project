<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

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

    echo json_encode(['success' => true, 'status' => $newStatus]);
    exit;
}

// GET — all shop requests with requester info
$requests = $pdo->query("
    SELECT
        sr.request_id  AS shop_id,
        sr.shop_name,
        sr.address,
        sr.contact_number,
        sr.status,
        sr.requested_at AS created_at,
        sr.rejection_reason,
        u.username      AS owner_name,
        u.email
    FROM shop_requests sr
    JOIN users u ON u.user_id = sr.user_id
    ORDER BY sr.requested_at DESC
")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'requests' => $requests]);