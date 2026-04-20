<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

$username = trim($data['username'] ?? '');
$password = $data['password']      ?? '';

if (empty($username) || empty($password)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

$stmt = $pdo->prepare('SELECT user_id, username, password, role FROM users WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

$_SESSION['user_id']  = $user['user_id'];
$_SESSION['username'] = $user['username'];
$_SESSION['role']     = $user['role'];

$redirect = match($user['role']) {
    'admin'      => '/admin/dashboard',
    'owner'      => '/owner/dashboard',
    'technician' => '/technician/dashboard',
    'customer'   => '/customer/dashboard',
    default      => '/customer/dashboard',
};

http_response_code(200);
echo json_encode([
    'success'  => true,
    'message'  => 'Login successful.',
    'userId'   => $user['user_id'],
    'username' => $user['username'],
    'role'     => $user['role'],
    'redirect' => $redirect,
]);