<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

if ($_SESSION['role'] !== 'technician') {
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

$userId = (int) $_SESSION['user_id'];

// Check if reviews table exists — if not, return empty gracefully
try {
    $stmt = $pdo->prepare("
        SELECT
            rv.rating,
            rv.comment,
            rv.created_at,
            cu.username  AS customer_name,
            rr.device_type
        FROM reviews rv
        JOIN repair_requests rr ON rr.request_id = rv.request_id
        JOIN users cu           ON cu.user_id     = rv.customer_id
        WHERE rr.technician_id = ?
        ORDER BY rv.created_at DESC
    ");
    $stmt->execute([$userId]);

    echo json_encode([
        'success' => true,
        'reviews' => $stmt->fetchAll(PDO::FETCH_ASSOC),
    ]);
} catch (PDOException $e) {
    // Table doesn't exist yet — return empty so UI shows "No reviews yet"
    echo json_encode(['success' => true, 'reviews' => []]);
}