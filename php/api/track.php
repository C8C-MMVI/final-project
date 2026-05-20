<?php
/**
 * PUBLIC endpoint — no session required.
 * GET /php/api/track.php?id=1042
 *
 * Returns basic repair info so any visitor can check their repair status
 * from the home page without logging in.
 */

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$requestId = isset($_GET['id']) ? (int) trim($_GET['id']) : 0;

if (!$requestId || $requestId <= 0) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid Repair ID (numbers only).',
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT
            rr.request_id,
            rr.device_type,
            rr.issue_description,
            rr.status,
            rr.technician_notes,
            rr.created_at,
            s.shop_name,
            s.address    AS shop_address
        FROM repair_requests rr
        JOIN shops s ON s.shop_id = rr.shop_id
        WHERE rr.request_id = ?
        LIMIT 1
    ");
    $stmt->execute([$requestId]);
    $repair = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$repair) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => "No repair found with ID #$requestId. Please double-check your receipt.",
        ]);
        exit;
    }

    // Only expose safe public fields — no customer PII
    echo json_encode([
        'success'           => true,
        'request_id'        => (int) $repair['request_id'],
        'device_type'       => $repair['device_type'],
        'issue_description' => $repair['issue_description'],
        'status'            => $repair['status'],
        'technician_notes'  => $repair['technician_notes'] ?? null,
        'shop_name'         => $repair['shop_name'],
        'shop_address'      => $repair['shop_address'] ?? null,
        'created_at'        => $repair['created_at'],
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error. Please try again shortly.',
    ]);
}
exit;