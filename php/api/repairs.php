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

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {

    if ($role === 'technician') {
        $stmt = $pdo->prepare("
            SELECT
                rr.request_id,
                rr.device_type,
                rr.issue_description,
                rr.status,
                rr.technician_notes,
                rr.created_at,
                cu.username  AS customer_name,
                cu.phone     AS customer_phone,
                s.shop_name
            FROM repair_requests rr
            JOIN users cu ON cu.user_id = rr.customer_id
            JOIN shops s  ON s.shop_id  = rr.shop_id
            WHERE rr.technician_id = ?
            ORDER BY
                CASE rr.status
                    WHEN 'In Progress' THEN 1
                    WHEN 'Pending'     THEN 2
                    WHEN 'Completed'   THEN 3
                END,
                rr.created_at DESC
        ");
        $stmt->execute([$userId]);

    } elseif ($role === 'owner') {
        $stmt = $pdo->prepare("
            SELECT
                rr.request_id,
                rr.device_type,
                rr.issue_description,
                rr.status,
                rr.technician_notes,
                rr.created_at,
                rr.technician_id,
                cu.username  AS customer_name,
                cu.phone     AS customer_phone,
                tu.username  AS technician_name,
                s.shop_name,
                s.shop_id
            FROM repair_requests rr
            JOIN users cu  ON cu.user_id = rr.customer_id
            JOIN shops s   ON s.shop_id  = rr.shop_id
            LEFT JOIN users tu ON tu.user_id = rr.technician_id
            WHERE s.owner_id = ?
            ORDER BY rr.created_at DESC
        ");
        $stmt->execute([$userId]);

    } elseif ($role === 'customer') {
        $stmt = $pdo->prepare("
            SELECT
                rr.request_id,
                rr.device_type,
                rr.issue_description,
                rr.status,
                rr.technician_notes,
                rr.created_at,
                s.shop_name
            FROM repair_requests rr
            JOIN shops s ON s.shop_id = rr.shop_id
            WHERE rr.customer_id = ?
            ORDER BY rr.created_at DESC
        ");
        $stmt->execute([$userId]);

    } else {
        // admin
        $stmt = $pdo->query("
            SELECT
                rr.request_id,
                rr.device_type,
                rr.issue_description,
                rr.status,
                rr.technician_notes,
                rr.created_at,
                rr.technician_id,
                cu.username  AS customer_name,
                tu.username  AS technician_name,
                s.shop_name
            FROM repair_requests rr
            JOIN users cu  ON cu.user_id = rr.customer_id
            JOIN shops s   ON s.shop_id  = rr.shop_id
            LEFT JOIN users tu ON tu.user_id = rr.technician_id
            ORDER BY rr.created_at DESC
        ");
    }

    echo json_encode(['success' => true, 'repairs' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── POST — submit new repair request ─────────────────────────────────────────
if ($method === 'POST') {
    if (!in_array($role, ['customer', 'owner', 'admin'])) {
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

    // Verify shop exists
    $shopCheck = $pdo->prepare("SELECT shop_id FROM shops WHERE shop_id = ?");
    $shopCheck->execute([$shopId]);
    if (!$shopCheck->fetch()) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Selected shop does not exist.']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO repair_requests (customer_id, shop_id, device_type, issue_description, status, created_at)
        VALUES (?, ?, ?, ?, 'Pending', NOW())
    ");
    $stmt->execute([$customerId, $shopId, $deviceType, $issueDesc]);

    echo json_encode([
        'success'    => true,
        'message'    => 'Repair request submitted successfully.',
        'request_id' => $pdo->lastInsertId(),
    ]);
    exit;
}

// ── PATCH — update status / notes / assign technician ────────────────────────
if ($method === 'PATCH') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || empty($data['request_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'request_id is required.']);
        exit;
    }

    $requestId = (int) $data['request_id'];
    $fields    = [];
    $params    = [];

    // Status update
    if (isset($data['status'])) {
        $allowed = ['Pending', 'In Progress', 'Completed'];
        if (!in_array($data['status'], $allowed)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Invalid status value.']);
            exit;
        }
        $fields[] = 'status = ?';
        $params[] = $data['status'];
    }

    // Technician notes
    if (isset($data['technician_notes'])) {
        $fields[] = 'technician_notes = ?';
        $params[] = trim($data['technician_notes']);
    }

    // Assign technician — owner or admin only
    if (array_key_exists('technician_id', $data)) {
        if (!in_array($role, ['owner', 'admin'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Only owners can assign technicians.']);
            exit;
        }

        $techId = $data['technician_id'] ? (int) $data['technician_id'] : null;

        // Verify technician belongs to owner's shop
        if ($role === 'owner' && $techId) {
            $check = $pdo->prepare("
                SELECT 1
                FROM shop_technicians st
                JOIN shops s ON s.shop_id = st.shop_id
                WHERE st.technician_id = ?
                  AND s.owner_id = ?
            ");
            $check->execute([$techId, $userId]);
            if (!$check->fetch()) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Technician does not belong to your shop.']);
                exit;
            }
        }

        $fields[] = 'technician_id = ?';
        $params[] = $techId;
    }

    if (empty($fields)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Nothing to update.']);
        exit;
    }

    $params[] = $requestId;
    $stmt = $pdo->prepare('UPDATE repair_requests SET ' . implode(', ', $fields) . ' WHERE request_id = ?');
    $stmt->execute($params);

    echo json_encode(['success' => true, 'message' => 'Repair updated successfully.']);
    exit;
}

// ── DELETE — admin only ───────────────────────────────────────────────────────
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