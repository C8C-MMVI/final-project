<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$method = $_SERVER['REQUEST_METHOD'];
$role   = $_SESSION['role'];
$userId = (int) $_SESSION['user_id'];

if ($method === 'GET') {
    if (!in_array($role, ['owner', 'admin', 'technician'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    if ($role === 'owner') {
        $stmt = $pdo->prepare("
            SELECT i.item_id, i.item_name, i.category, i.quantity, i.price, s.shop_name
            FROM inventory_items i
            JOIN shops s ON s.shop_id = i.shop_id
            WHERE s.owner_id = ?
            ORDER BY i.item_name ASC
        ");
        $stmt->execute([$userId]);
    } else {
        $stmt = $pdo->query("
            SELECT i.item_id, i.item_name, i.category, i.quantity, i.price, s.shop_name
            FROM inventory_items i
            JOIN shops s ON s.shop_id = i.shop_id
            ORDER BY i.item_name ASC
        ");
    }

    echo json_encode(['success' => true, 'items' => $stmt->fetchAll()]);
    exit;
}

if (!in_array($role, ['owner', 'admin'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

if ($method === 'POST') {
    $name     = trim($data['name']     ?? '');
    $category = trim($data['category'] ?? '');
    $quantity = (int)   ($data['quantity'] ?? 0);
    $price    = (float) ($data['price']    ?? 0);
    $shopId   = (int)   ($data['shop_id']  ?? 0);

    if (empty($name) || empty($category) || !$shopId) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'name, category, and shop_id are required.']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO inventory_items (shop_id, item_name, category, quantity, price)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$shopId, $name, $category, $quantity, $price]);
    echo json_encode(['success' => true, 'message' => 'Item added.']);
    exit;
}

if ($method === 'PUT') {
    $itemId   = (int)   ($data['item_id']  ?? 0);
    $name     = trim($data['name']         ?? '');
    $category = trim($data['category']     ?? '');
    $quantity = (int)   ($data['quantity'] ?? 0);
    $price    = (float) ($data['price']    ?? 0);

    if (!$itemId || empty($name) || empty($category)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'item_id, name, and category are required.']);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE inventory_items
        SET item_name = ?, category = ?, quantity = ?, price = ?
        WHERE item_id = ?
    ");
    $stmt->execute([$name, $category, $quantity, $price, $itemId]);
    echo json_encode(['success' => true, 'message' => 'Item updated.']);
    exit;
}

if ($method === 'DELETE') {
    $itemId = (int) ($data['item_id'] ?? 0);
    if (!$itemId) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'item_id is required.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM inventory_items WHERE item_id = ?");
    $stmt->execute([$itemId]);
    echo json_encode(['success' => true, 'message' => 'Item deleted.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);