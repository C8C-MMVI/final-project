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

if ($method === 'GET') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    $stmt = $pdo->query("
        SELECT user_id, username, email, role, status, created_at
        FROM users
        ORDER BY created_at DESC
    ");
    echo json_encode(['success' => true, 'users' => $stmt->fetchAll()]);
    exit;
}

if ($method === 'POST') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    $data     = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $email    = trim($data['email']    ?? '');
    $password = trim($data['password'] ?? '');
    $newRole  = trim($data['role']     ?? 'technician');

    if (!$username || !$password) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
        exit;
    }

    if (strlen($username) < 3 || strlen($username) > 50) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Username must be 3–50 characters.']);
        exit;
    }

    if (strlen($password) < 8) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
        exit;
    }

    $allowedRoles = ['admin', 'owner', 'technician', 'customer'];
    if (!in_array($newRole, $allowedRoles)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid role.']);
        exit;
    }

    $check = $pdo->prepare("SELECT user_id FROM users WHERE username = ?");
    $check->execute([$username]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Username already exists.']);
        exit;
    }

    if ($email) {
        $checkEmail = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $checkEmail->execute([$email]);
        if ($checkEmail->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Email already exists.']);
            exit;
        }
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password, role, status, created_at)
        VALUES (?, ?, ?, ?, 'active', NOW())
    ");
    $stmt->execute([$username, $email ?: null, $hash, $newRole]);

    echo json_encode([
        'success' => true,
        'message' => 'Member added successfully.',
        'user_id' => $pdo->lastInsertId(),
    ]);
    exit;
}

if ($method === 'DELETE') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    $data     = json_decode(file_get_contents('php://input'), true);
    $targetId = (int) ($data['user_id'] ?? 0);
    $selfId   = (int) $_SESSION['user_id'];

    if (!$targetId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'user_id is required.']);
        exit;
    }

    if ($targetId === $selfId) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'You cannot delete your own account.']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->execute([$targetId]);
    echo json_encode(['success' => true, 'message' => 'User deleted.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);