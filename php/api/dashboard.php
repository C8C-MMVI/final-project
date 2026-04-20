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

// ── Admin ─────────────────────────────────────────────────────────────────────
if ($role === 'admin') {
    $totalUsers  = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $activeShops = $pdo->query("SELECT COUNT(*) FROM shops")->fetchColumn();
    $openRepairs = $pdo->query("SELECT COUNT(*) FROM repair_requests WHERE status != 'Completed'")->fetchColumn();
    $totalRev    = $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM sales_transactions")->fetchColumn();

    $activity = $pdo->query("
        SELECT
            cu.username AS customer,
            rr.device_type,
            rr.status,
            rr.created_at,
            s.shop_name
        FROM repair_requests rr
        JOIN users cu ON cu.user_id = rr.customer_id
        JOIN shops s  ON s.shop_id  = rr.shop_id
        ORDER BY rr.created_at DESC
        LIMIT 10
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success'  => true,
        'stats'    => [
            'total_users'   => (int)   $totalUsers,
            'active_shops'  => (int)   $activeShops,
            'open_repairs'  => (int)   $openRepairs,
            'total_revenue' => (float) $totalRev,
        ],
        'activity' => $activity,
    ]);
    exit;
}

// ── Customer ──────────────────────────────────────────────────────────────────
if ($role === 'customer') {
    $activeStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests
        WHERE customer_id = ? AND status != 'Completed'
    ");
    $activeStmt->execute([$userId]);

    $completedStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests
        WHERE customer_id = ? AND status = 'Completed'
    ");
    $completedStmt->execute([$userId]);

    // Total spent via sales_transactions linked through repair shop
    $spentStmt = $pdo->prepare("
        SELECT COALESCE(SUM(st.total_amount), 0)
        FROM sales_transactions st
        WHERE st.customer_id = ?
    ");
    $spentStmt->execute([$userId]);

    $repairsStmt = $pdo->prepare("
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
        LIMIT 5
    ");
    $repairsStmt->execute([$userId]);

    // Transactions linked to customer
    $txnStmt = $pdo->prepare("
        SELECT
            st.transaction_id,
            st.total_amount,
            st.payment_method,
            st.transaction_date,
            s.shop_name
        FROM sales_transactions st
        JOIN shops s ON s.shop_id = st.shop_id
        WHERE st.customer_id = ?
        ORDER BY st.transaction_date DESC
        LIMIT 5
    ");
    $txnStmt->execute([$userId]);

    $latestStmt = $pdo->prepare("
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
        WHERE rr.customer_id = ? AND rr.status != 'Completed'
        ORDER BY rr.created_at DESC
        LIMIT 1
    ");
    $latestStmt->execute([$userId]);

    echo json_encode([
        'success'       => true,
        'stats'         => [
            'active_repairs'    => (int)   $activeStmt->fetchColumn(),
            'completed_repairs' => (int)   $completedStmt->fetchColumn(),
            'total_spent'       => (float) $spentStmt->fetchColumn(),
        ],
        'repairs'       => $repairsStmt->fetchAll(PDO::FETCH_ASSOC),
        'transactions'  => $txnStmt->fetchAll(PDO::FETCH_ASSOC),
        'latest_repair' => $latestStmt->fetch(PDO::FETCH_ASSOC) ?: null,
    ]);
    exit;
}

// ── Owner ─────────────────────────────────────────────────────────────────────
if ($role === 'owner') {
    $activeStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests rr
        JOIN shops s ON s.shop_id = rr.shop_id
        WHERE s.owner_id = ? AND rr.status != 'Completed'
    ");
    $activeStmt->execute([$userId]);

    $completedTodayStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests rr
        JOIN shops s ON s.shop_id = rr.shop_id
        WHERE s.owner_id = ?
          AND rr.status = 'Completed'
          AND DATE(rr.created_at) = CURRENT_DATE
    ");
    $completedTodayStmt->execute([$userId]);

    $customersStmt = $pdo->prepare("
        SELECT COUNT(DISTINCT rr.customer_id)
        FROM repair_requests rr
        JOIN shops s ON s.shop_id = rr.shop_id
        WHERE s.owner_id = ?
    ");
    $customersStmt->execute([$userId]);

    $revenueStmt = $pdo->prepare("
        SELECT COALESCE(SUM(st.total_amount), 0)
        FROM sales_transactions st
        JOIN shops s ON s.shop_id = st.shop_id
        WHERE s.owner_id = ?
          AND DATE(st.transaction_date) = CURRENT_DATE
    ");
    $revenueStmt->execute([$userId]);

    $txnStmt = $pdo->prepare("
        SELECT
            st.transaction_id,
            st.total_amount,
            st.payment_method,
            st.transaction_date,
            cu.username AS customer_name
        FROM sales_transactions st
        JOIN shops s  ON s.shop_id  = st.shop_id
        JOIN users cu ON cu.user_id = st.customer_id
        WHERE s.owner_id = ?
        ORDER BY st.transaction_date DESC
        LIMIT 10
    ");
    $txnStmt->execute([$userId]);

    echo json_encode([
        'success'      => true,
        'stats'        => [
            'active_repairs'  => (int)   $activeStmt->fetchColumn(),
            'completed_today' => (int)   $completedTodayStmt->fetchColumn(),
            'total_customers' => (int)   $customersStmt->fetchColumn(),
            'today_revenue'   => (float) $revenueStmt->fetchColumn(),
        ],
        'transactions' => $txnStmt->fetchAll(PDO::FETCH_ASSOC),
    ]);
    exit;
}

http_response_code(403);
echo json_encode(['success' => false, 'message' => 'Forbidden.']);