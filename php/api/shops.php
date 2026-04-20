<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$shops = $pdo->query("
    SELECT shop_id, shop_name, address, contact_number
    FROM shops
    ORDER BY shop_name ASC
")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'shops' => $shops]);