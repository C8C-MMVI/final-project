<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$method = $_SERVER['REQUEST_METHOD'];
$role   = $_SESSION['role'];
$userId = (int) $_SESSION['user_id'];

if ($method === 'GET') {
    if ($role === 'technician') {
        $stmt = $pdo->prepare("
            SELECT rr.request_id, rr.device_type, rr.issue_description,
                   rr.status, rr.technician_notes, rr.created_at,
                   u.username AS customer_name, s.shop_name
            FROM repair_requests rr
            JOIN users u ON u.user_id = rr.customer_id
            JOIN shops s ON s.shop_id = rr.shop_id
            WHERE rr.technician_id = ?
            ORDER BY CASE rr.status
                WHEN 'In Progress' THEN 1
                WHEN 'Pending'     THEN 2
                WHEN 'Completed'   THEN 3
            END, rr.created_at DESC
        ");
        $stmt->execute([$userId]);

    } elseif ($role === 'owner') {
        $stmt = $pdo->prepare("
            SELECT rr.request_id, rr.device_type, rr.issue_description,
                   rr.status, rr.technician_notes, rr.created_at,
                   u.username AS customer_name, s.shop_name
            FROM repair_requests rr
            JOIN users u ON u.user_id = rr.customer_id
            JOIN shops s ON s.shop_id = rr.shop_id
            WHERE s.owner_id = ?
            ORDER BY rr.created_at DESC
        ");
        $stmt->execute([$userId]);

    } elseif ($role === 'customer') {
        $stmt = $pdo->prepare("
            SELECT rr.request_id, rr.device_type, rr.issue_description,
                   rr.status, rr.technician_notes, rr.created_at,
                   s.shop_name
            FROM repair_requests rr
            JOIN shops s ON s.shop_id = rr.shop_id
            WHERE rr.customer_id = ?
            ORDER BY rr.created_at DESC
        ");
        $stmt->execute([$userId]);

    } else {
        $stmt = $pdo->query("
            SELECT rr.request_id, rr.device_type, rr.issue_description,
                   rr.status, rr.technician_notes, rr.created_at,
                   u.username AS customer_name, s.shop_name
            FROM repair_requests rr
            JOIN users u ON u.user_id = rr.customer_id
            JOIN shops s ON s.shop_id = rr.shop_id
            ORDER BY rr.created_at DESC
        ");
    }

    $repairs = $stmt->fetchAll();
    echo json_encode(['success' => true, 'repairs' => $repairs]);
    exit;
}

if ($method === 'POST') {
    if (!in_array($role, ['owner', 'admin', 'customer'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
        exit;
    }

    $shopId     = (int)  ($data['shop_id']          ?? 0);
    $deviceType = trim($data['device_type']          ?? '');
    $issueDesc  = trim($data['issue_description']    ?? '');
    $customerId = $role === 'customer' ? $userId : (int) ($data['customer_id'] ?? 0);

    if (!$shopId || !$deviceType || !$issueDesc || !$customerId) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'shop_id, device_type, and issue_description are required.']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO repair_requests (customer_id, shop_id, device_type, issue_description, status, created_at)
        VALUES (?, ?, ?, ?, 'Pending', NOW())
    ");
    $stmt->execute([$customerId, $shopId, $deviceType, $issueDesc]);

    echo json_encode([
        'success'    => true,
        'message'    => 'Repair request submitted.',
        'request_id' => $pdo->lastInsertId(),
    ]);
    exit;
}

if ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || empty($data['request_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'request_id is required.']);
        exit;
    }

    $requestId       = (int) $data['request_id'];
    $allowedStatuses = ['Pending', 'In Progress', 'Completed'];
    $fields = [];
    $params = [];

    if (isset($data['status'])) {
        if (!in_array($data['status'], $allowedStatuses)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Invalid status.']);
            exit;
        }
        $fields[] = 'status = ?';
        $params[] = $data['status'];
    }

    if (isset($data['technician_notes'])) {
        $fields[] = 'technician_notes = ?';
        $params[] = trim($data['technician_notes']);
    }

    if (empty($fields)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Nothing to update.']);
        exit;
    }

    $params[] = $requestId;
    $stmt = $pdo->prepare('UPDATE repair_requests SET ' . implode(', ', $fields) . ' WHERE request_id = ?');
    $stmt->execute($params);
    echo json_encode(['success' => true, 'message' => 'Repair updated.']);
    exit;
}

if ($method === 'DELETE') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    $data      = json_decode(file_get_contents('php://input'), true);
    $requestId = (int) ($data['request_id'] ?? 0);

    if (!$requestId) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'request_id is required.']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM repair_requests WHERE request_id = ?');
    $stmt->execute([$requestId]);
    echo json_encode(['success' => true, 'message' => 'Repair deleted.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);