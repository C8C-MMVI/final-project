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
$accessToken = $data['token'] ?? '';

if (empty($accessToken)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing Google token.']);
    exit;
}

// Verify token with Google and get user info
$response = file_get_contents(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    false,
    stream_context_create([
        'http' => [
            'header' => "Authorization: Bearer $accessToken\r\n",
            'method' => 'GET',
        ]
    ])
);

if (!$response) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Failed to verify Google token.']);
    exit;
}

$googleUser = json_decode($response, true);
$email = $googleUser['email'] ?? '';
$name  = $googleUser['name']  ?? '';

if (empty($email)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Could not retrieve email from Google.']);
    exit;
}

// Check if customer already exists
$stmt = $pdo->prepare('SELECT user_id, username, role FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    // Auto-register as customer
    $username = explode('@', $email)[0] . '_' . rand(100, 999);
    $randomPassword = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);

    $stmt = $pdo->prepare(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?) RETURNING user_id'
    );
    $stmt->execute([$username, $email, $randomPassword, 'customer']);
    $newUser = $stmt->fetch();

    $userId   = $newUser['user_id'];
    $role     = 'customer';
} else {
    // Existing user - only allow customers via Google
    if ($user['role'] !== 'customer') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Google login is only available for customers.']);
        exit;
    }
    $userId   = $user['user_id'];
    $username = $user['username'];
    $role     = $user['role'];
}

$_SESSION['user_id']  = $userId;
$_SESSION['username'] = $username;
$_SESSION['role']     = $role;

http_response_code(200);
echo json_encode([
    'success'  => true,
    'message'  => 'Google login successful.',
    'userId'   => $userId,
    'username' => $username,
    'role'     => $role,
    'redirect' => '/customer/dashboard',
]);