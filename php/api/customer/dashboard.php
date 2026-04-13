<?php
/**
 * api/customer/dashboard.php
 * Returns all data needed for the customer dashboard.
 *
 * Returns JSON: {
 *   success, username, stats, repairs, transactions, timeline
 * }
 */

require_once __DIR__ . '/../../includes/auth.php';
authRequireRole('customer');

require_once __DIR__ . '/../../db_config.php';

header('Content-Type: application/json');

$customerId = (int) $_SESSION['user_id'];
$username   = $_SESSION['username'];

// ── Repair Requests ───────────────────────────────────────────────────
$repairStmt = $pdo->prepare('
    SELECT
        rr.request_id,
        rr.device_type,
        rr.issue_description,
        rr.status,
        rr.technician_notes,
        rr.created_at,
        u.username AS technician_name
    FROM repair_requests rr
    LEFT JOIN users u ON u.user_id = rr.technician_id
    WHERE rr.customer_id = ?
    ORDER BY rr.created_at DESC
');
$repairStmt->execute([$customerId]);
$repairs = $repairStmt->fetchAll();

// ── Transactions ──────────────────────────────────────────────────────
$txStmt = $pdo->prepare('
    SELECT
        st.transaction_id,
        st.total_amount,
        st.payment_method,
        st.transaction_date
    FROM sales_transactions st
    WHERE st.customer_id = ?
    ORDER BY st.transaction_date DESC
    LIMIT 10
');
$txStmt->execute([$customerId]);
$transactions = $txStmt->fetchAll();

// ── Stats ─────────────────────────────────────────────────────────────
$totalRepairs    = count($repairs);
$pendingRepairs  = count(array_filter($repairs, fn($r) => $r['status'] === 'Pending'));
$inProgress      = count(array_filter($repairs, fn($r) => $r['status'] === 'In Progress'));
$completed       = count(array_filter($repairs, fn($r) => $r['status'] === 'Completed'));

$stats = [
    ['label' => 'Total Repairs',   'value' => $totalRepairs],
    ['label' => 'Pending',         'value' => $pendingRepairs],
    ['label' => 'In Progress',     'value' => $inProgress],
    ['label' => 'Completed',       'value' => $completed],
];

// ── Timeline — steps for the most recent repair ───────────────────────
$timeline = [];
if (!empty($repairs)) {
    $latest   = $repairs[0];
    $statuses = ['Pending', 'In Progress', 'Completed'];
    $current  = $latest['status'];

    foreach ($statuses as $step) {
        $timeline[] = [
            'label'  => $step,
            'done'   => array_search($step, $statuses) <= array_search($current, $statuses),
            'active' => $step === $current,
        ];
    }
}

echo json_encode([
    'success'      => true,
    'username'     => $username,
    'stats'        => $stats,
    'repairs'      => $repairs,
    'transactions' => $transactions,
    'timeline'     => $timeline,
]);