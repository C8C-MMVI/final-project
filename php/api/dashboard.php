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
    $totalRev    = $pdo->query("SELECT COALESCE(SUM(amount), 0) FROM repair_sales")->fetchColumn();

    $activity = $pdo->query("
        SELECT
            cu.username   AS username,
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

    $adminId    = (int) $_SESSION['user_id'];
    $alertsStmt = $pdo->prepare("
        SELECT notification_id, message, is_read, created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $alertsStmt->execute([$adminId]);
    $rawAlerts = $alertsStmt->fetchAll(PDO::FETCH_ASSOC);

    $alerts = array_map(function ($n) {
        $msg = strtolower($n['message']);
        if (str_contains($msg, 'login') || str_contains($msg, 'fail') || str_contains($msg, 'error') || str_contains($msg, 'danger')) {
            $type = 'danger';
        } elseif (str_contains($msg, 'pending') || str_contains($msg, 'request') || str_contains($msg, 'warn')) {
            $type = 'warn';
        } else {
            $type = 'info';
        }

        $created = new DateTime($n['created_at']);
        $now     = new DateTime();
        $diff    = $now->diff($created);
        if ($diff->days >= 1)  { $time = $diff->days . 'd ago'; }
        elseif ($diff->h >= 1) { $time = $diff->h   . 'h ago'; }
        elseif ($diff->i >= 1) { $time = $diff->i   . 'm ago'; }
        else                   { $time = 'just now'; }

        return [
            'notification_id' => (int)  $n['notification_id'],
            'title'           =>        $n['message'],
            'sub'             => $n['is_read'] ? 'Read' : 'Unread',
            'type'            => $type,
            'time'            => $time,
            'is_read'         => (bool) $n['is_read'],
        ];
    }, $rawAlerts);

    echo json_encode([
        'success'  => true,
        'stats'    => [
            'total_users'   => (int)   $totalUsers,
            'active_shops'  => (int)   $activeShops,
            'open_repairs'  => (int)   $openRepairs,
            'total_revenue' => (float) $totalRev,
        ],
        'activity' => $activity,
        'alerts'   => $alerts,
    ]);
    exit;
}

// ── Customer ──────────────────────────────────────────────────────────────────
if ($role === 'customer') {
    $activeStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests
        WHERE customer_id = ? AND status != 'Completed' AND status != 'Cancelled'
    ");
    $activeStmt->execute([$userId]);

    $completedStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests
        WHERE customer_id = ? AND status = 'Completed'
    ");
    $completedStmt->execute([$userId]);

    // KEY FIX: LEFT JOIN reviews so each repair carries a `reviewed` boolean.
    // Without this the ★ Review button reappears on every page refresh.
    $repairsStmt = $pdo->prepare("
        SELECT
            rr.request_id,
            rr.device_type,
            rr.issue_description,
            rr.status,
            rr.technician_notes,
            rr.created_at,
            rr.technician_id,
            tu.username  AS technician_name,
            s.shop_name,
            CASE
                WHEN rv.review_id IS NOT NULL THEN true
                ELSE false
            END          AS reviewed
        FROM repair_requests rr
        JOIN shops s ON s.shop_id = rr.shop_id
        LEFT JOIN users tu ON tu.user_id = rr.technician_id
        LEFT JOIN reviews rv
               ON rv.request_id  = rr.request_id
              AND rv.customer_id  = rr.customer_id
        WHERE rr.customer_id = ?
        ORDER BY rr.created_at DESC
    ");
    $repairsStmt->execute([$userId]);
    $repairs = $repairsStmt->fetchAll(PDO::FETCH_ASSOC);

    // PostgreSQL returns booleans as 't'/'f' strings via PDO — normalise to real bools
    foreach ($repairs as &$r) {
        $r['reviewed'] = ($r['reviewed'] === true || $r['reviewed'] === 't' || $r['reviewed'] === '1' || $r['reviewed'] === 1);
    }
    unset($r);

    // Latest non-completed repair for the timeline widget
    $latestRepair = null;
    foreach ($repairs as $r) {
        if (strtolower($r['status']) !== 'completed' && strtolower($r['status']) !== 'cancelled') {
            $latestRepair = $r;
            break;
        }
    }
    // Fall back to most recent repair if all are completed
    if (!$latestRepair && !empty($repairs)) {
        $latestRepair = $repairs[0];
    }

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
        'repairs'       => $repairs,
        'transactions'  => [],
        'latest_repair' => $latestRepair,
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
            'shop_name'       => $shop['shop_name']     ?? null,
            'shop_address'    => $shop['address']        ?? null,
            'shop_phone'      => $shop['contact_number'] ?? null,
            'active_repairs'  => (int)   $activeStmt->fetchColumn(),
            'completed_today' => (int)   $completedTodayStmt->fetchColumn(),
            'total_customers' => (int)   $customersStmt->fetchColumn(),
            'today_revenue'   => (float) $revenueStmt->fetchColumn(),
        ],
        'transactions' => [],
    ]);
    exit;
}

// ── Technician ────────────────────────────────────────────────────────────────
// FIXED: previously unreachable — the owner block had http_response_code(403)
// + exit before this code, so technicians always got a 403 response.
if ($role === 'technician') {
    $assignedStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests WHERE technician_id = ?
    ");
    $assignedStmt->execute([$userId]);

    $inProgressStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests
        WHERE technician_id = ? AND status = 'In Progress'
    ");
    $inProgressStmt->execute([$userId]);

    $completedStmt = $pdo->prepare("
        SELECT COUNT(*) FROM repair_requests
        WHERE technician_id = ? AND status = 'Completed'
    ");
    $completedStmt->execute([$userId]);

    echo json_encode([
        'success' => true,
        'stats'   => [
            'technician_id'  => $userId,
            'total_assigned' => (int) $assignedStmt->fetchColumn(),
            'in_progress'    => (int) $inProgressStmt->fetchColumn(),
            'completed'      => (int) $completedStmt->fetchColumn(),
        ],
    ]);
    exit;
}

// Fallback — unknown role
http_response_code(403);
echo json_encode(['success' => false, 'message' => 'Forbidden.']);