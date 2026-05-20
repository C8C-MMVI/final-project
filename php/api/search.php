<?php
/**
 * /php/api/search.php
 * TechnoLogs — Global Search API (PostgreSQL)
 */

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../db_config.php';

header('Content-Type: application/json');

// ── Auth ──────────────────────────────────────────────────────────────────
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit;
}

$userId = (int) $_SESSION['user_id'];
$role   = $_SESSION['role'] ?? '';

if (!in_array($role, ['admin', 'owner', 'technician', 'customer'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

// ── Resolve shop_id for owner (never rely on session) ─────────────────────
$shopId = null;
if ($role === 'owner') {
    try {
        $s = $pdo->prepare("SELECT shop_id FROM shops WHERE owner_id = ? LIMIT 1");
        $s->execute([$userId]);
        $row    = $s->fetch();
        $shopId = $row ? (int) $row['shop_id'] : null;
    } catch (Exception $e) {
        error_log('Search shop lookup error: ' . $e->getMessage());
    }
}

// ── Query ─────────────────────────────────────────────────────────────────
$q = trim($_GET['q'] ?? '');
if (strlen($q) < 2) {
    echo json_encode(['success' => true, 'results' => new stdClass()]);
    exit;
}

$like  = '%' . $q . '%';
$LIMIT = 6;
$results = (object)[];

// ── Helper ────────────────────────────────────────────────────────────────
function fetchRows(PDO $pdo, string $sql, array $params = []): array {
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        error_log('Search query error: ' . $e->getMessage());
        return [];
    }
}

// ═════════════════════════════════════════════════════════════════════════
// 1. REPAIRS
// ═════════════════════════════════════════════════════════════════════════
if ($role === 'admin') {
    $repairRows = fetchRows($pdo, "
        SELECT  rr.request_id, rr.device_type, rr.issue_description, rr.status,
                cu.username AS customer_name, tu.username AS technician_name
        FROM    repair_requests rr
        JOIN    users cu ON cu.user_id = rr.customer_id
        LEFT JOIN users tu ON tu.user_id = rr.technician_id
        WHERE   rr.device_type       ILIKE ?
           OR   rr.issue_description ILIKE ?
           OR   rr.status            ILIKE ?
           OR   cu.username          ILIKE ?
           OR   tu.username          ILIKE ?
           OR   rr.request_id::text  ILIKE ?
        ORDER BY rr.request_id DESC
        LIMIT ?
    ", [$like, $like, $like, $like, $like, $like, $LIMIT]);

} elseif ($role === 'owner') {
    if (!$shopId) {
        echo json_encode(['success' => true, 'results' => new stdClass()]);
        exit;
    }
    $repairRows = fetchRows($pdo, "
        SELECT  rr.request_id, rr.device_type, rr.issue_description, rr.status,
                cu.username AS customer_name, tu.username AS technician_name
        FROM    repair_requests rr
        JOIN    users cu ON cu.user_id = rr.customer_id
        LEFT JOIN users tu ON tu.user_id = rr.technician_id
        WHERE   rr.shop_id = ?
          AND  (rr.device_type       ILIKE ?
           OR   rr.issue_description ILIKE ?
           OR   rr.status            ILIKE ?
           OR   cu.username          ILIKE ?
           OR   tu.username          ILIKE ?
           OR   rr.request_id::text  ILIKE ?)
        ORDER BY rr.request_id DESC
        LIMIT ?
    ", [$shopId, $like, $like, $like, $like, $like, $like, $LIMIT]);

} elseif ($role === 'technician') {
    $repairRows = fetchRows($pdo, "
        SELECT  rr.request_id, rr.device_type, rr.issue_description, rr.status,
                cu.username AS customer_name, tu.username AS technician_name
        FROM    repair_requests rr
        JOIN    users cu ON cu.user_id = rr.customer_id
        LEFT JOIN users tu ON tu.user_id = rr.technician_id
        WHERE   rr.technician_id = ?
          AND  (rr.device_type       ILIKE ?
           OR   rr.issue_description ILIKE ?
           OR   rr.status            ILIKE ?
           OR   cu.username          ILIKE ?
           OR   rr.request_id::text  ILIKE ?)
        ORDER BY rr.request_id DESC
        LIMIT ?
    ", [$userId, $like, $like, $like, $like, $like, $LIMIT]);

} else { // customer
    $repairRows = fetchRows($pdo, "
        SELECT  rr.request_id, rr.device_type, rr.issue_description, rr.status,
                cu.username AS customer_name, tu.username AS technician_name
        FROM    repair_requests rr
        JOIN    users cu ON cu.user_id = rr.customer_id
        LEFT JOIN users tu ON tu.user_id = rr.technician_id
        WHERE   rr.customer_id = ?
          AND  (rr.device_type       ILIKE ?
           OR   rr.issue_description ILIKE ?
           OR   rr.status            ILIKE ?
           OR   rr.request_id::text  ILIKE ?)
        ORDER BY rr.request_id DESC
        LIMIT ?
    ", [$userId, $like, $like, $like, $like, $LIMIT]);
}

foreach ($repairRows as $row) {
    $tech = $row['technician_name'] ? ' · ' . $row['technician_name'] : '';
    $results->repairs[] = [
        'id'      => $row['request_id'],
        'label'   => '#' . $row['request_id'] . ' — ' . $row['device_type'],
        'sub'     => $row['customer_name'] . $tech . ' · ' . $row['status'],
        'page'    => 'repairs',
        'page_id' => $row['request_id'],
    ];
}

// ═════════════════════════════════════════════════════════════════════════
// 2. CUSTOMERS  (admin + owner only)
// ═════════════════════════════════════════════════════════════════════════
if (in_array($role, ['admin', 'owner'])) {
    if ($role === 'admin') {
        $custRows = fetchRows($pdo, "
            SELECT u.user_id, u.username, u.email, u.phone, u.status
            FROM   users u
            WHERE  u.role = 'customer'
              AND (u.username ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
            ORDER BY u.username
            LIMIT ?
        ", [$like, $like, $like, $LIMIT]);
    } else {
        $custRows = fetchRows($pdo, "
            SELECT DISTINCT u.user_id, u.username, u.email, u.phone, u.status
            FROM   users u
            JOIN   repair_requests rr ON rr.customer_id = u.user_id
            WHERE  u.role = 'customer'
              AND  rr.shop_id = ?
              AND (u.username ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
            ORDER BY u.username
            LIMIT ?
        ", [$shopId, $like, $like, $like, $LIMIT]);
    }

    foreach ($custRows as $row) {
        $sub = $row['email'] ?? '';
        if ($row['phone']) $sub .= ($sub ? ' · ' : '') . $row['phone'];
        $sub .= ($sub ? ' · ' : '') . ucfirst($row['status']);
        $results->customers[] = [
            'id'      => $row['user_id'],
            'label'   => $row['username'],
            'sub'     => $sub,
            'page'    => 'customers',
            'page_id' => $row['user_id'],
        ];
    }
}

// ═════════════════════════════════════════════════════════════════════════
// 3. TRANSACTIONS  (admin, owner, customer)
// ═════════════════════════════════════════════════════════════════════════
if (in_array($role, ['admin', 'owner', 'customer'])) {
    if ($role === 'admin') {
        $txRows = fetchRows($pdo, "
            SELECT  t.transaction_id, t.reference_no, t.amount, t.status, t.notes,
                    u.username AS customer_name
            FROM    transactions t
            JOIN    repair_requests rr ON rr.request_id = t.request_id
            JOIN    users u ON u.user_id = rr.customer_id
            WHERE   t.reference_no         ILIKE ?
               OR   t.status               ILIKE ?
               OR   t.notes                ILIKE ?
               OR   t.amount::text         ILIKE ?
               OR   t.transaction_id::text ILIKE ?
               OR   u.username             ILIKE ?
            ORDER BY t.created_at DESC
            LIMIT ?
        ", [$like, $like, $like, $like, $like, $like, $LIMIT]);

    } elseif ($role === 'owner') {
        $txRows = fetchRows($pdo, "
            SELECT  t.transaction_id, t.reference_no, t.amount, t.status, t.notes,
                    u.username AS customer_name
            FROM    transactions t
            JOIN    repair_requests rr ON rr.request_id = t.request_id
            JOIN    users u ON u.user_id = rr.customer_id
            WHERE   rr.shop_id = ?
              AND  (t.reference_no         ILIKE ?
               OR   t.status               ILIKE ?
               OR   t.notes                ILIKE ?
               OR   t.amount::text         ILIKE ?
               OR   t.transaction_id::text ILIKE ?
               OR   u.username             ILIKE ?)
            ORDER BY t.created_at DESC
            LIMIT ?
        ", [$shopId, $like, $like, $like, $like, $like, $like, $LIMIT]);

    } else { // customer
        $txRows = fetchRows($pdo, "
            SELECT  t.transaction_id, t.reference_no, t.amount, t.status, t.notes,
                    u.username AS customer_name
            FROM    transactions t
            JOIN    repair_requests rr ON rr.request_id = t.request_id
            JOIN    users u ON u.user_id = rr.customer_id
            WHERE   rr.customer_id = ?
              AND  (t.reference_no         ILIKE ?
               OR   t.status               ILIKE ?
               OR   t.amount::text         ILIKE ?
               OR   t.transaction_id::text ILIKE ?)
            ORDER BY t.created_at DESC
            LIMIT ?
        ", [$userId, $like, $like, $like, $like, $LIMIT]);
    }

    foreach ($txRows as $row) {
        $results->transactions[] = [
            'id'      => $row['transaction_id'],
            'label'   => ($row['reference_no'] ?? 'TXN-' . $row['transaction_id']) . ' — ₱' . number_format($row['amount'], 2),
            'sub'     => ($row['customer_name'] ?? '') . ' · ' . ucfirst($row['status']),
            'page'    => 'transactions',
            'page_id' => $row['transaction_id'],
        ];
    }
}

// ═════════════════════════════════════════════════════════════════════════
// 4. TECHNICIANS  (admin + owner only)
// ═════════════════════════════════════════════════════════════════════════
if (in_array($role, ['admin', 'owner'])) {
    if ($role === 'admin') {
        $techRows = fetchRows($pdo, "
            SELECT u.user_id, u.username, u.email, u.phone, u.status
            FROM   users u
            WHERE  u.role = 'technician'
              AND (u.username ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
            ORDER BY u.username
            LIMIT ?
        ", [$like, $like, $like, $LIMIT]);
    } else {
        $techRows = fetchRows($pdo, "
            SELECT DISTINCT u.user_id, u.username, u.email, u.phone, u.status
            FROM   users u
            JOIN   shop_technicians st ON st.technician_id = u.user_id
            WHERE  u.role = 'technician'
              AND  st.shop_id = ?
              AND (u.username ILIKE ? OR u.email ILIKE ? OR u.phone ILIKE ?)
            ORDER BY u.username
            LIMIT ?
        ", [$shopId, $like, $like, $like, $LIMIT]);
    }

    foreach ($techRows as $row) {
        $sub = $row['email'] ?? '';
        if ($row['phone']) $sub .= ($sub ? ' · ' : '') . $row['phone'];
        $sub .= ($sub ? ' · ' : '') . ucfirst($row['status']);
        $results->technicians[] = [
            'id'      => $row['user_id'],
            'label'   => $row['username'],
            'sub'     => $sub,
            'page'    => 'members',
            'page_id' => $row['user_id'],
        ];
    }
}

// ═════════════════════════════════════════════════════════════════════════
// 5. USERS  (admin only)
// ═════════════════════════════════════════════════════════════════════════
if ($role === 'admin') {
    $userRows = fetchRows($pdo, "
        SELECT u.user_id, u.username, u.email, u.phone, u.role, u.status
        FROM   users u
        WHERE  u.username ILIKE ?
           OR  u.email    ILIKE ?
           OR  u.phone    ILIKE ?
           OR  u.role     ILIKE ?
           OR  u.status   ILIKE ?
        ORDER BY u.username
        LIMIT ?
    ", [$like, $like, $like, $like, $like, $LIMIT]);

    foreach ($userRows as $row) {
        $results->users[] = [
            'id'      => $row['user_id'],
            'label'   => $row['username'],
            'sub'     => ($row['email'] ?? 'no email') . ' · ' . ucfirst($row['role']) . ' · ' . ucfirst($row['status']),
            'page'    => 'userManagement',
            'page_id' => $row['user_id'],
        ];
    }
}

// ═════════════════════════════════════════════════════════════════════════
// 6. SHOPS  (admin only)
// ═════════════════════════════════════════════════════════════════════════
if ($role === 'admin') {
    $shopRows = fetchRows($pdo, "
        SELECT  s.shop_id, s.shop_name, s.address, s.contact_number,
                u.username AS owner_name
        FROM    shops s
        JOIN    users u ON u.user_id = s.owner_id
        WHERE   s.shop_name      ILIKE ?
           OR   s.address        ILIKE ?
           OR   s.contact_number ILIKE ?
           OR   u.username       ILIKE ?
        ORDER BY s.shop_name
        LIMIT ?
    ", [$like, $like, $like, $like, $LIMIT]);

    foreach ($shopRows as $row) {
        $results->shops[] = [
            'id'      => $row['shop_id'],
            'label'   => $row['shop_name'],
            'sub'     => 'Owner: ' . $row['owner_name'] . ($row['address'] ? ' · ' . $row['address'] : ''),
            'page'    => 'shopRequests',
            'page_id' => $row['shop_id'],
        ];
    }
}

// ── Done ──────────────────────────────────────────────────────────────────
echo json_encode(['success' => true, 'results' => $results]);