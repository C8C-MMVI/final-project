<?php
/**
 * api/reviews.php  —  Hybrid version (PostgreSQL + MongoDB)
 *
 * WHAT CHANGED FROM THE ORIGINAL:
 *   - Reviews are written to BOTH PostgreSQL (for relational integrity /
 *     joins with repair_requests) AND MongoDB (for rich querying, analytics,
 *     and extra fields like sentiment tags).
 *   - GET  — reads from MongoDB (faster, no joins needed for display).
 *   - POST — writes to PostgreSQL first (integrity check + duplicate guard),
 *             then mirrors the document to MongoDB.
 *
 * MongoDB document shape:
 * {
 *   _id           : ObjectId,
 *   pg_review_id  : int,           // mirrors PostgreSQL review_id
 *   request_id    : int,
 *   customer_id   : int,
 *   customer_name : string,        // denormalised
 *   technician_id : int,           // denormalised
 *   device_type   : string,        // denormalised
 *   rating        : int (1-5),
 *   comment       : string|null,
 *   created_at    : UTCDateTime
 * }
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';       // PostgreSQL $pdo
require_once __DIR__ . '/../mongo_config.php';     // MongoDB getMongoDb()

$userId = (int) $_SESSION['user_id'];
$role   = $_SESSION['role'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

$mongo      = getMongoDb();
$collection = $mongo->reviews;

// ── GET: Technician fetches their own reviews (from MongoDB) ───────────────
if ($method === 'GET') {
    if ($role !== 'technician') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    try {
        $cursor = $collection->find(
            ['technician_id' => $userId],
            ['sort' => ['created_at' => -1]]
        );

        $reviews = [];
        foreach ($cursor as $doc) {
            $reviews[] = [
                'review_id'     => (string) $doc['_id'],
                'rating'        => $doc['rating']        ?? null,
                'comment'       => $doc['comment']       ?? null,
                'customer_name' => $doc['customer_name'] ?? null,
                'device_type'   => $doc['device_type']   ?? null,
                'created_at'    => isset($doc['created_at'])
                    ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                    : null,
            ];
        }

        echo json_encode(['success' => true, 'reviews' => $reviews]);
    } catch (\Exception $e) {
        error_log('MongoDB reviews GET error: ' . $e->getMessage());
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

    $body      = json_decode(file_get_contents('php://input'), true) ?? [];
    $requestId = isset($body['request_id']) ? (int) $body['request_id'] : 0;
    $rating    = isset($body['rating'])     ? (int) $body['rating']     : 0;
    $comment   = trim($body['comment'] ?? '');

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
        // ── Step 1: Validate ownership + status via PostgreSQL ─────────────
        $check = $pdo->prepare("
            SELECT rr.technician_id, rr.device_type, u.username AS customer_name
            FROM repair_requests rr
            JOIN users u ON u.user_id = rr.customer_id
            WHERE rr.request_id = ?
              AND rr.customer_id = ?
              AND rr.status = 'Completed'
        ");
        $check->execute([$requestId, $userId]);
        $row = $check->fetch();

        if (!$row) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'You can only review your own completed repairs.',
            ]);
            exit;
        }

        // ── Step 2: Duplicate check via PostgreSQL ─────────────────────────
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

        // ── Step 3: Insert into PostgreSQL ────────────────────────────────
        $insert = $pdo->prepare("
            INSERT INTO reviews (request_id, customer_id, rating, comment)
            VALUES (?, ?, ?, ?)
        ");
        $insert->execute([$requestId, $userId, $rating, $comment ?: null]);
        $pgReviewId = (int) $pdo->lastInsertId();

        // ── Step 4: Mirror to MongoDB ─────────────────────────────────────
        $collection->insertOne([
            'pg_review_id'  => $pgReviewId,
            'request_id'    => $requestId,
            'customer_id'   => $userId,
            'customer_name' => $row['customer_name'],
            'technician_id' => (int) $row['technician_id'],
            'device_type'   => $row['device_type'],
            'rating'        => $rating,
            'comment'       => $comment ?: null,
            'created_at'    => new \MongoDB\BSON\UTCDateTime(),
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Review submitted successfully.',
        ]);
    } catch (\PDOException $e) {
        error_log('PostgreSQL reviews POST error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    } catch (\Exception $e) {
        error_log('MongoDB reviews POST error: ' . $e->getMessage());
        // PostgreSQL write succeeded — return success even if Mongo mirror fails
        echo json_encode([
            'success' => true,
            'message' => 'Review submitted (analytics sync pending).',
        ]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);