<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$userId = (int) $_SESSION['user_id'];
$role   = $_SESSION['role'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Technician fetches their own reviews ──────────────────────────────
if ($method === 'GET') {
    if ($role !== 'technician') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT
                rv.review_id,
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
        echo json_encode(['success' => true, 'reviews' => []]);
    }
    exit;
}

// ── POST: Customer submits a review ───────────────────────────────────────
if ($method === 'POST') {
    if ($role !== 'customer') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Only customers can submit reviews.']);
        exit;
    }

    $body       = json_decode(file_get_contents('php://input'), true) ?? [];
    $requestId  = isset($body['request_id']) ? (int) $body['request_id'] : 0;
    $rating     = isset($body['rating'])     ? (int) $body['rating']     : 0;
    $comment    = trim($body['comment'] ?? '');

    // Basic validation
    if ($requestId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid repair request.']);
        exit;
    }
    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5.']);
        exit;
    }

    try {
        // Verify this repair belongs to this customer and is Completed
        $check = $pdo->prepare("
            SELECT request_id FROM repair_requests
            WHERE request_id = ?
              AND customer_id = ?
              AND status = 'Completed'
        ");
        $check->execute([$requestId, $userId]);

        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'You can only review your own completed repairs.',
            ]);
            exit;
        }

        // Prevent duplicate reviews
        $dup = $pdo->prepare("
            SELECT review_id FROM reviews
            WHERE request_id = ? AND customer_id = ?
        ");
        $dup->execute([$requestId, $userId]);

        if ($dup->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'You have already reviewed this repair.',
            ]);
            exit;
        }

        // Insert review
        $insert = $pdo->prepare("
            INSERT INTO reviews (request_id, customer_id, rating, comment)
            VALUES (?, ?, ?, ?)
        ");
        $insert->execute([$requestId, $userId, $rating, $comment ?: null]);

        echo json_encode([
            'success' => true,
            'message' => 'Review submitted successfully.',
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);