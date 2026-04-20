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

// ── Admin ─────────────────────────────────────────────────────────────────
if ($role === 'admin') {
    $totalUsers  = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $activeShops = $pdo->query("SELECT COUNT(*) FROM shops")->fetchColumn();
    $openRepairs = $pdo->query("SELECT COUNT(*) FROM repair_requests WHERE status != 'Completed'")->fetchColumn();
    $totalRev    = $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM sales_transactions")->fetchColumn();

    $activity = $pdo->query("
        SELECT u.username, r.device_type, r.status, r.created_at, s.shop_name
        FROM repair_requests r
        JOIN users u ON u.user_id = r.customer_id
        JOIN shops s ON s.shop_id = r.shop_id
        ORDER BY r.created_at DESC
        LIMIT 10
    ")->fetchAll();

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

// ── Customer ──────────────────────────────────────────────────────────────
if ($role === 'customer') {
    $activeRepair = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests
        WHERE customer_id = ? AND status != 'Completed'
    ");
    $activeRepair->execute([$userId]);

    $completedRepair = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests
        WHERE customer_id = ? AND status = 'Completed'
    ");
    $completedRepair->execute([$userId]);

    $totalSpent = $pdo->prepare("
        SELECT COALESCE(SUM(total_amount), 0)
        FROM sales_transactions
        WHERE customer_id = ?
    ");
    $totalSpent->execute([$userId]);

    $repairs = $pdo->prepare("
        SELECT r.request_id, r.device_type, r.issue_description,
               r.status, r.created_at, s.shop_name
        FROM repair_requests r
        JOIN shops s ON s.shop_id = r.shop_id
        WHERE r.customer_id = ?
        ORDER BY r.created_at DESC
        LIMIT 5
    ");
    $repairs->execute([$userId]);

    $transactions = $pdo->prepare("
        SELECT st.transaction_id, st.total_amount, st.payment_method,
               st.transaction_date, s.shop_name
        FROM sales_transactions st
        JOIN shops s ON s.shop_id = st.shop_id
        WHERE st.customer_id = ?
        ORDER BY st.transaction_date DESC
        LIMIT 5
    ");
    $transactions->execute([$userId]);

    $latest = $pdo->prepare("
        SELECT request_id, device_type, issue_description,
               status, technician_notes, created_at
        FROM repair_requests
        WHERE customer_id = ? AND status != 'Completed'
        ORDER BY created_at DESC
        LIMIT 1
    ");
    $latest->execute([$userId]);

    echo json_encode([
        'success'       => true,
        'stats'         => [
            'active_repairs'    => (int)   $activeRepair->fetchColumn(),
            'completed_repairs' => (int)   $completedRepair->fetchColumn(),
            'total_spent'       => (float) $totalSpent->fetchColumn(),
        ],
        'repairs'       => $repairs->fetchAll(),
        'transactions'  => $transactions->fetchAll(),
        'latest_repair' => $latest->fetch() ?: null,
    ]);
    exit;
}

// ── Owner ─────────────────────────────────────────────────────────────────
if ($role === 'owner') {
    $activeRepairs = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests r
        JOIN shops s ON s.shop_id = r.shop_id
        WHERE s.owner_id = ? AND r.status != 'Completed'
    ");
    $activeRepairs->execute([$userId]);

    $completedToday = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests r
        JOIN shops s ON s.shop_id = r.shop_id
        WHERE s.owner_id = ? AND r.status = 'Completed'
        AND DATE(r.created_at) = CURRENT_DATE
    ");
    $completedToday->execute([$userId]);

    $totalCustomers = $pdo->prepare("
        SELECT COUNT(DISTINCT r.customer_id) FROM repair_requests r
        JOIN shops s ON s.shop_id = r.shop_id
        WHERE s.owner_id = ?
    ");
    $totalCustomers->execute([$userId]);

    $todayRevenue = $pdo->prepare("
        SELECT COALESCE(SUM(st.total_amount), 0)
        FROM sales_transactions st
        JOIN shops s ON s.shop_id = st.shop_id
        WHERE s.owner_id = ? AND DATE(st.transaction_date) = CURRENT_DATE
    ");
    $todayRevenue->execute([$userId]);

    echo json_encode([
        'success' => true,
        'stats'   => [
            'active_repairs'  => (int)   $activeRepairs->fetchColumn(),
            'completed_today' => (int)   $completedToday->fetchColumn(),
            'total_customers' => (int)   $totalCustomers->fetchColumn(),
            'today_revenue'   => (float) $todayRevenue->fetchColumn(),
        ],
    ]);
    exit;
}

http_response_code(403);
echo json_encode(['success' => false, 'message' => 'Forbidden.']);