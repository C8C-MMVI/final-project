<?php
/**
 * api/login.php
 * Handles login authentication.
 *
 * Receives JSON: { username, password }
 * Returns JSON:  { success, message, userId, username, role, redirect }
 */

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'Strict',
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

// ── Validation ────────────────────────────────────────────────────────
if (empty($username) || empty($password)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

// ── Look up user ──────────────────────────────────────────────────────
$stmt = $pdo->prepare(
    'SELECT user_id, username, password, role, status FROM users WHERE username = ? LIMIT 1'
);
$stmt->execute([$username]);
$user = $stmt->fetch();

// ── Verify password ───────────────────────────────────────────────────
if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

// ── Check account status ──────────────────────────────────────────────
if ($user['status'] !== 'active') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Your account is disabled. Contact your administrator.']);
    exit;
}

// ── Store session ─────────────────────────────────────────────────────
$_SESSION['user_id']       = $user['user_id'];
$_SESSION['username']      = $user['username'];
$_SESSION['role']          = $user['role'];
$_SESSION['last_activity'] = time();

// ── Cache shop_id for owners ──────────────────────────────────────────
if ($user['role'] === 'owner') {
    $shopStmt = $pdo->prepare('SELECT shop_id FROM shops WHERE owner_id = ? LIMIT 1');
    $shopStmt->execute([$user['user_id']]);
    $shop = $shopStmt->fetch();
    $_SESSION['shop_id'] = $shop['shop_id'] ?? null;
}

// ── Role → React route ────────────────────────────────────────────────
$redirect = match($user['role']) {
    'admin'      => '/admin',
    'owner'      => '/owner',
    'technician' => '/technician',
    'customer'   => '/customer',
    default      => '/',
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