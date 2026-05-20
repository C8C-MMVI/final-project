<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$role   = $_SESSION['role'];
$userId = (int) $_SESSION['user_id'];

// ── Customer / Technician — only see approved shops (for dropdowns) ────────
if (in_array($role, ['customer', 'technician'])) {
    $stmt = $pdo->query("
        SELECT shop_id, shop_name, address, contact_number
        FROM shops
        WHERE status = 'approved'
        ORDER BY shop_name ASC
    ");
    echo json_encode(['success' => true, 'shops' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── Owner — only see their own shop ───────────────────────────────────────
if ($role === 'owner') {
    $stmt = $pdo->prepare("
        SELECT shop_id, shop_name, address, contact_number, status, created_at
        FROM shops
        WHERE owner_id = ?
        ORDER BY shop_name ASC
    ");
    $stmt->execute([$userId]);
    echo json_encode(['success' => true, 'shops' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── Admin — see all shops with full details ───────────────────────────────
if ($role === 'admin') {
    $stmt = $pdo->query("
        SELECT 
            s.shop_id, 
            s.shop_name, 
            s.address, 
            s.contact_number,
            s.status,
            s.created_at,
            u.username AS owner_name,
            u.email    AS owner_email
        FROM shops s
        JOIN users u ON u.user_id = s.owner_id
        ORDER BY s.created_at DESC
    ");
    echo json_encode(['success' => true, 'shops' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// ── Any other role ────────────────────────────────────────────────────────
http_response_code(403);
echo json_encode(['success' => false, 'message' => 'Forbidden.']);