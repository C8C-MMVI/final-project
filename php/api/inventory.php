<?php
/**
 * api/inventory.php
 * Shop owner inventory CRUD.
 * GET    → fetch all items
 * POST   → add new item
 * PUT    → update item
 * DELETE → delete item
 */

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'owner') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt  = $pdo->query('SELECT * FROM inventory_items ORDER BY item_name ASC');
    $items = $stmt->fetchAll();
    echo json_encode(['success' => true, 'items' => $items]);
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

    if (empty($name) || empty($category)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO inventory_items (item_name, category, quantity, price) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, $category, $quantity, $price]);
    echo json_encode(['success' => true, 'message' => 'Item added successfully.', 'item_id' => $pdo->lastInsertId()]);
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
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE inventory_items SET item_name = ?, category = ?, quantity = ?, price = ? WHERE item_id = ?');
    $stmt->execute([$name, $category, $quantity, $price, $itemId]);
    echo json_encode(['success' => true, 'message' => 'Item updated successfully.']);
    exit;
}

if ($method === 'DELETE') {
    $itemId = (int) ($data['item_id'] ?? 0);
    if (!$itemId) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid item ID.']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM inventory_items WHERE item_id = ?');
    $stmt->execute([$itemId]);
    echo json_encode(['success' => true, 'message' => 'Item deleted successfully.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);