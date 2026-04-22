<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

if ($_SESSION['role'] !== 'owner') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// Get the shop owned by this user
$shopStmt = $pdo->prepare("SELECT shop_id FROM shops WHERE owner_id = ? LIMIT 1");
$shopStmt->execute([$_SESSION['user_id']]);
$shop = $shopStmt->fetch();

if (!$shop) {
    echo json_encode(['success' => false, 'message' => 'No shop found for this owner.']);
    exit;
}

$shopId = $shop['shop_id'];

// Fetch customers who have repair requests in this shop
$stmt = $pdo->prepare("
    SELECT
        user_id,
        username,
        email,
        status,
        total_repairs,
        completed_repairs,
        active_repairs,
        last_visit
    FROM shop_customers
    WHERE shop_id = ?
    ORDER BY last_visit DESC
");
$stmt->execute([$shopId]);

echo json_encode([
    'success'   => true,
    'customers' => $stmt->fetchAll(PDO::FETCH_ASSOC),
]);