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

    // ── FIXED: use repair_sales instead of sales_transactions ──
    $totalRev = $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM repair_sales")->fetchColumn();

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

    $repairsStmt = $pdo->prepare("
        SELECT
            rr.request_id,
            rr.device_type,
            rr.issue_description,
            rr.status,
            rr.technician_notes,
            rr.created_at,
            tu.username  AS technician_name,
            s.shop_name
        FROM repair_requests rr
        JOIN shops s ON s.shop_id = rr.shop_id
        LEFT JOIN users tu ON tu.user_id = rr.technician_id
        WHERE rr.customer_id = ?
        ORDER BY rr.created_at DESC
        LIMIT 5
    ");
    $repairsStmt->execute([$userId]);

    $latestStmt = $pdo->prepare("
        SELECT
            rr.request_id,
            rr.device_type,
            rr.issue_description,
            rr.status,
            rr.technician_notes,
            rr.created_at,
            tu.username  AS technician_name,
            s.shop_name
        FROM repair_requests rr
        JOIN shops s ON s.shop_id = rr.shop_id
        LEFT JOIN users tu ON tu.user_id = rr.technician_id
        WHERE rr.customer_id = ? AND rr.status != 'Completed'
        ORDER BY rr.created_at DESC
        LIMIT 1
    ");
    $latestStmt->execute([$userId]);

    // ── FIXED: query repair_sales for customer's total spent ──
    $spentStmt = $pdo->prepare("
        SELECT COALESCE(SUM(rs.amount), 0)
        FROM repair_sales rs
        WHERE rs.customer_id = ?
    ");
    $spentStmt->execute([$userId]);

    echo json_encode([
        'success'       => true,
        'stats'         => [
            'customer_id'       => $userId,
            'active_repairs'    => (int)   $activeStmt->fetchColumn(),
            'completed_repairs' => (int)   $completedStmt->fetchColumn(),
            'total_spent'       => (float) $spentStmt->fetchColumn(),
        ],
        'repairs'       => $repairsStmt->fetchAll(PDO::FETCH_ASSOC),
        'transactions'  => [],
        'latest_repair' => $latestStmt->fetch(PDO::FETCH_ASSOC) ?: null,
    ]);
    exit;
}

// ── Owner ─────────────────────────────────────────────────────────────────────
if ($role === 'owner') {

    $shopStmt = $pdo->prepare("SELECT shop_id, shop_name, address, contact_number FROM shops WHERE owner_id = ? LIMIT 1");
    $shopStmt->execute([$userId]);
    $shop   = $shopStmt->fetch(PDO::FETCH_ASSOC);
    $shopId = (int) ($shop['shop_id'] ?? 0);

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

    // ── FIXED: was querying sales_transactions.total_amount (table doesn't exist)
    //           now queries repair_sales.amount + sold_at ──────────────────────
    $revenueStmt = $pdo->prepare("
        SELECT COALESCE(SUM(rs.amount), 0)
        FROM repair_sales rs
        WHERE rs.shop_id = ?
          AND DATE(rs.sold_at) = CURRENT_DATE
    ");
    $revenueStmt->execute([$shopId]);

    echo json_encode([
        'success' => true,
        'stats'   => [
            'shop_id'         => $shopId,
            'shop_name'       => $shop['shop_name']       ?? null,
            'shop_address'    => $shop['address']          ?? null,
            'shop_phone'      => $shop['contact_number']   ?? null,
            'active_repairs'  => (int)   $activeStmt->fetchColumn(),
            'completed_today' => (int)   $completedTodayStmt->fetchColumn(),
            'total_customers' => (int)   $customersStmt->fetchColumn(),
            'today_revenue'   => (float) $revenueStmt->fetchColumn(),
        ],
        'transactions' => [],
    ]);
    exit;
}

http_response_code(403);
echo json_encode(['success' => false, 'message' => 'Forbidden.']);