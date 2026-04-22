<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$role   = $_SESSION['role'];
$userId = (int) $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// ── GET — list technicians ────────────────────────────────────────────────────
if ($method === 'GET') {

    if ($role === 'owner') {
        $stmt = $pdo->prepare("
            SELECT
                u.user_id,
                u.username,
                u.email,
                u.phone,
                u.status,
                st.shop_id,
                s.shop_name,
                st.appointed_at,
                COUNT(rr.request_id)                                        AS jobs_done,
                SUM(CASE WHEN rr.status = 'In Progress' THEN 1 ELSE 0 END) AS active_jobs
            FROM shop_technicians st
            JOIN users u  ON u.user_id = st.technician_id
            JOIN shops s  ON s.shop_id = st.shop_id
            LEFT JOIN repair_requests rr ON rr.technician_id = u.user_id
            WHERE s.owner_id = ?
            GROUP BY u.user_id, u.username, u.email, u.phone, u.status,
                     st.shop_id, s.shop_name, st.appointed_at
            ORDER BY u.username ASC
        ");
        $stmt->execute([$userId]);

    } elseif ($role === 'admin') {
        $stmt = $pdo->query("
            SELECT
                u.user_id,
                u.username,
                u.email,
                u.phone,
                u.status,
                st.shop_id,
                s.shop_name,
                st.appointed_at,
                COUNT(rr.request_id)                                        AS jobs_done,
                SUM(CASE WHEN rr.status = 'In Progress' THEN 1 ELSE 0 END) AS active_jobs
            FROM shop_technicians st
            JOIN users u  ON u.user_id = st.technician_id
            JOIN shops s  ON s.shop_id = st.shop_id
            LEFT JOIN repair_requests rr ON rr.technician_id = u.user_id
            GROUP BY u.user_id, u.username, u.email, u.phone, u.status,
                     st.shop_id, s.shop_name, st.appointed_at
            ORDER BY s.shop_name ASC, u.username ASC
        ");

    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    echo json_encode(['success' => true, 'technicians' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── POST — add a technician to the owner's shop ───────────────────────────────
if ($method === 'POST') {
    if ($role !== 'owner') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    // Get owner's shop
    $shopStmt = $pdo->prepare("SELECT shop_id FROM shops WHERE owner_id = ? LIMIT 1");
    $shopStmt->execute([$userId]);
    $shop = $shopStmt->fetch();
    if (!$shop) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'No shop found for your account.']);
        exit;
    }
    $shopId = $shop['shop_id'];

    $data     = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $email    = trim($data['email']    ?? '');
    $password = trim($data['password'] ?? '');

    if (!$username || !$password || !$email) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Username, email, and password are required.']);
        exit;
    }
    if (strlen($username) < 3 || strlen($username) > 50) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Username must be 3–50 characters.']);
        exit;
    }
    if (strlen($password) < 8) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
        exit;
    }

    // Check for duplicate username
    $check = $pdo->prepare("SELECT user_id FROM users WHERE username = ?");
    $check->execute([$username]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Username already exists.']);
        exit;
    }

    // Check for duplicate email
    $checkEmail = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
    $checkEmail->execute([$email]);
    if ($checkEmail->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already exists.']);
        exit;
    }

    // Create the technician user account
    $hash   = password_hash($password, PASSWORD_BCRYPT);
    $insert = $pdo->prepare("
        INSERT INTO users (username, email, password, role, status, created_at)
        VALUES (?, ?, ?, 'technician', 'active', NOW())
    ");
    $insert->execute([$username, $email, $hash]);
    $newUserId = $pdo->lastInsertId();

    // Assign technician to the owner's shop
    $assign = $pdo->prepare("
        INSERT INTO shop_technicians (shop_id, technician_id, appointed_by, appointed_at)
        VALUES (?, ?, ?, NOW())
    ");
    $assign->execute([$shopId, $newUserId, $userId]);

    echo json_encode([
        'success' => true,
        'message' => 'Technician added successfully.',
        'user_id' => $newUserId,
    ]);
    exit;
}

// ── DELETE — remove technician from shop (user account is kept intact) ────────
if ($method === 'DELETE') {
    if ($role !== 'owner') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    // Get owner's shop
    $shopStmt = $pdo->prepare("SELECT shop_id FROM shops WHERE owner_id = ? LIMIT 1");
    $shopStmt->execute([$userId]);
    $shop = $shopStmt->fetch();
    if (!$shop) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'No shop found for your account.']);
        exit;
    }
    $shopId = $shop['shop_id'];

    $data     = json_decode(file_get_contents('php://input'), true);
    $targetId = (int) ($data['user_id'] ?? 0);

    if (!$targetId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'user_id is required.']);
        exit;
    }

    // Verify the technician actually belongs to this owner's shop
    $verify = $pdo->prepare("
        SELECT 1 FROM shop_technicians
        WHERE shop_id = ? AND technician_id = ?
    ");
    $verify->execute([$shopId, $targetId]);
    if (!$verify->fetch()) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Technician does not belong to your shop.']);
        exit;
    }

    // Remove from shop only — user account stays intact
    $del = $pdo->prepare("
        DELETE FROM shop_technicians
        WHERE shop_id = ? AND technician_id = ?
    ");
    $del->execute([$shopId, $targetId]);

    echo json_encode(['success' => true, 'message' => 'Technician removed from shop.']);
    exit;
}

// ── 405 Method Not Allowed ────────────────────────────────────────────────────
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);