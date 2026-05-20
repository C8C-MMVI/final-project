<?php
// php/api/chat/unread-by-repair.php
//
// GET /api/chat/unread-by-repair?repairId=<id>&userId=<id>
//
// Returns: { "unread": <count> }
//
// Counts chat_messages rows where:
//   • the message belongs to the room for this repair
//   • sender is NOT the current user (message is FROM the other side)
//   • is_read = 0

header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated', 'unread' => 0]);
    exit;
}

// Always use the server-side session user — never trust the client-supplied userId
$userId   = (int) $_SESSION['user_id'];
$repairId = isset($_GET['repairId']) ? (int) $_GET['repairId'] : 0;

if ($repairId <= 0) {
    echo json_encode(['unread' => 0]);
    exit;
}

// ── DB ────────────────────────────────────────────────────────────────────────
require_once __DIR__ . '/../../db_config.php';   // provides $pdo (PDO instance)

try {
    // Step 1 — find the chat room for this repair where the session user participates
    $roomStmt = $pdo->prepare("
        SELECT room_id
        FROM   chat_rooms
        WHERE  repair_id = :repairId
          AND  (customer_id = :userId OR technician_id = :userId)
        LIMIT  1
    ");
    $roomStmt->execute([
        ':repairId' => $repairId,
        ':userId'   => $userId,
    ]);
    $room = $roomStmt->fetch(PDO::FETCH_ASSOC);

    if (!$room) {
        // Room doesn't exist yet — definitely no unread messages
        echo json_encode(['unread' => 0]);
        exit;
    }

    // Step 2 — count messages FROM the other party that haven't been read
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) AS unread
        FROM   chat_messages
        WHERE  room_id    = :roomId
          AND  sender_id != :userId
          AND  is_read    = 0
    ");
    $countStmt->execute([
        ':roomId' => $room['room_id'],
        ':userId' => $userId,
    ]);
    $row = $countStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['unread' => (int) ($row['unread'] ?? 0)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'unread' => 0]);
}