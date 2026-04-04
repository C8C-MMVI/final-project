<?php
/**
 * api/register.php
 * Handles user registration.
 * Receives JSON: { username, password, confirm_password }
 * Returns JSON:  { success, message }
 *
 * Note: users table only has id, username, password, date_created.
 * Role is stored in user_roles table (role_id 4 = customer by default).
 */

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

$username         = trim($data['username']         ?? '');
$password         = $data['password']              ?? '';
$confirm_password = $data['confirm_password']      ?? '';

$errors = [];

if (empty($username)) {
    $errors[] = 'Username is required.';
} elseif (strlen($username) < 3 || strlen($username) > 30) {
    $errors[] = 'Username must be between 3 and 30 characters.';
} elseif (preg_match('/\s/', $username)) {
    $errors[] = 'Username must not contain spaces.';
}

if (empty($password)) {
    $errors[] = 'Password is required.';
} elseif (strlen($password) < 8) {
    $errors[] = 'Password must be at least 8 characters.';
}

if ($password !== $confirm_password) {
    $errors[] = 'Passwords do not match.';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// Check username taken
$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Username is already taken.']);
    exit;
}

// Insert user
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$stmt = $pdo->prepare('INSERT INTO users (username, password) VALUES (?, ?) RETURNING id');
$stmt->execute([$username, $hashedPassword]);
$newUser = $stmt->fetch();

// Assign default role: customer (role_id = 4)
$roleStmt = $pdo->prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, 4)');
$roleStmt->execute([$newUser['id']]);

http_response_code(201);
echo json_encode(['success' => true, 'message' => 'Account created successfully.']);