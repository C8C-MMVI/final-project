<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';
require_once __DIR__ . '/../includes/notify.php';

$method = $_SERVER['REQUEST_METHOD'];
$role   = $_SESSION['role'];
$userId = (int) $_SESSION['user_id'];

if ($method === 'GET') {
    if ($role === 'customer') {
        $stmt = $pdo->prepare("
            SELECT st.transaction_id, st.total_amount, st.payment_method,
                   st.transaction_date, s.shop_name,
                   u.username AS staff_name
            FROM sales_transactions st
            JOIN shops s ON s.shop_id = st.shop_id
            JOIN users u ON u.user_id = st.staff_id
            WHERE st.customer_id = ?
            ORDER BY st.transaction_date DESC
        ");
        $stmt->execute([$userId]);

    } elseif ($role === 'owner') {
        $stmt = $pdo->prepare("
            SELECT st.transaction_id, st.total_amount, st.payment_method,
                   st.transaction_date, s.shop_name,
                   u.username AS customer_name,
                   sf.username AS staff_name
            FROM sales_transactions st
            JOIN shops s  ON s.shop_id   = st.shop_id
            JOIN users u  ON u.user_id   = st.customer_id
            JOIN users sf ON sf.user_id  = st.staff_id
            WHERE s.owner_id = ?
            ORDER BY st.transaction_date DESC
        ");
        $stmt->execute([$userId]);

    } elseif ($role === 'admin') {
        $stmt = $pdo->query("
            SELECT st.transaction_id, st.total_amount, st.payment_method,
                   st.transaction_date, s.shop_name,
                   u.username AS customer_name,
                   sf.username AS staff_name
            FROM sales_transactions st
            JOIN shops s  ON s.shop_id   = st.shop_id
            JOIN users u  ON u.user_id   = st.customer_id
            JOIN users sf ON sf.user_id  = st.staff_id
            ORDER BY st.transaction_date DESC
        ");

    } else {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    echo json_encode(['success' => true, 'transactions' => $stmt->fetchAll()]);
    exit;
}

if ($method === 'POST') {
    if (!in_array($role, ['owner', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    $data          = json_decode(file_get_contents('php://input'), true);
    $shopId        = (int)   ($data['shop_id']       ?? 0);
    $customerId    = (int)   ($data['customer_id']   ?? 0);
    $totalAmount   = (float) ($data['total_amount']  ?? 0);
    $paymentMethod = trim($data['payment_method']    ?? 'cash');

    if (!$shopId || !$customerId || $totalAmount <= 0) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'shop_id, customer_id, and total_amount are required.']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO sales_transactions (shop_id, customer_id, staff_id, total_amount, payment_method, transaction_date)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$shopId, $customerId, $userId, $totalAmount, $paymentMethod]);
    $transactionId = (int) $pdo->lastInsertId();

    // ── Fetch shop name for the notification message ──────────────────────
    $shopStmt = $pdo->prepare("SELECT shop_name FROM shops WHERE shop_id = ?");
    $shopStmt->execute([$shopId]);
    $shopName = $shopStmt->fetchColumn() ?: 'the shop';

    $formattedAmount = number_format($totalAmount, 2);

    // ── Notify customer their payment was recorded ────────────────────────
    notify($pdo, $customerId,
        "Payment of ₱$formattedAmount via $paymentMethod has been recorded at $shopName. Transaction #$transactionId."
    );

    echo json_encode([
        'success'        => true,
        'message'        => 'Transaction recorded.',
        'transaction_id' => $transactionId,
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);