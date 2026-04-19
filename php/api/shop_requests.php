<?php
// php/api/shop_requests.php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

// ── POST: approve or reject a shop ───────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body   = json_decode(file_get_contents('php://input'), true);
    $shopId = (int) ($body['shop_id'] ?? 0);
    $action = $body['action'] ?? '';

    if (!$shopId || !in_array($action, ['approve', 'reject'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid request.']);
        exit;
    }

    // shops table has no status column in V1 — add it if missing
    // (safe to run even if column exists; PostgreSQL will throw, so we catch)
    try {
        $pdo->exec("ALTER TABLE shops ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'");
    } catch (PDOException $ignored) {}

    $newStatus = $action === 'approve' ? 'approved' : 'rejected';
    $stmt = $pdo->prepare("UPDATE shops SET status = ? WHERE shop_id = ?");
    $stmt->execute([$newStatus, $shopId]);

    echo json_encode(['success' => true, 'status' => $newStatus]);
    exit;
}

// ── GET: all shops with owner info ───────────────────────────────────────────
// Shops table may not have a status column yet — use COALESCE to default to 'pending'
$requests = $pdo->query("
    SELECT
        s.shop_id,
        s.shop_name,
        s.address,
        s.created_at,
        COALESCE(s.status, 'pending') AS status,
        u.username  AS owner_name,
        u.email
    FROM shops s
    JOIN users u ON u.user_id = s.owner_id
    ORDER BY s.created_at DESC
")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'requests' => $requests]);