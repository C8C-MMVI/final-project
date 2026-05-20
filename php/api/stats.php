<?php
/**
 * api/stats.php — Public stats endpoint for the Hero section
 * No authentication required but rate-limited by IP
 */
header('Content-Type: application/json');

// ── Rate limiting by IP ───────────────────────────────────────────────────
session_start();
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateKey  = 'stats_rate_' . md5($ip);
$limit    = 30;          // max requests
$window   = 60;          // per 60 seconds

if (!isset($_SESSION[$rateKey])) {
    $_SESSION[$rateKey] = ['count' => 0, 'start' => time()];
}

$elapsed = time() - $_SESSION[$rateKey]['start'];

if ($elapsed > $window) {
    // reset window
    $_SESSION[$rateKey] = ['count' => 0, 'start' => time()];
}

$_SESSION[$rateKey]['count']++;

if ($_SESSION[$rateKey]['count'] > $limit) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
    exit;
}

// ── Only allow GET ────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

try {
    $completedStmt = $pdo->query("
        SELECT COUNT(*) AS total FROM repair_requests WHERE status = 'Completed'
    ");
    $completedCount = (int) $completedStmt->fetch(PDO::FETCH_ASSOC)['total'];

    $ratingStmt = $pdo->query("
        SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating FROM reviews
    ");
    $avgRating = $ratingStmt->fetch(PDO::FETCH_ASSOC)['avg_rating'];
    $avgRating = $avgRating ? number_format((float)$avgRating, 1) . '★' : '4.8★';

    $activeStmt = $pdo->query("
        SELECT COUNT(*) AS total FROM repair_requests WHERE status = 'In Progress'
    ");
    $activeCount = (int) $activeStmt->fetch(PDO::FETCH_ASSOC)['total'];

    $shopsStmt = $pdo->query("SELECT COUNT(*) AS total FROM shops");
    $shopsCount = (int) $shopsStmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        'success'        => true,
        'repairs_done'   => $completedCount,
        'avg_rating'     => $avgRating,
        'active_repairs' => $activeCount,
        'partner_shops'  => $shopsCount,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error.']);
}