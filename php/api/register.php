<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

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
$email            = trim($data['email']            ?? '');
$phone            = trim($data['phone']            ?? '');
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

if (empty($email)) {
    $errors[] = 'Email address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Enter a valid email address.';
}

if (empty($phone)) {
    $errors[] = 'Phone number is required.';
} elseif (!preg_match('/^[0-9+\-\s()]{7,15}$/', $phone)) {
    $errors[] = 'Enter a valid phone number.';
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

try {
    // Check username taken
    $stmt = $pdo->prepare('SELECT user_id FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Username is already taken.']);
        exit;
    }

    // Check email taken
    $stmt = $pdo->prepare('SELECT user_id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email address is already registered.']);
        exit;
    }

    // Insert user
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare(
        'INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?) RETURNING user_id'
    );
    $stmt->execute([$username, $email, $phone, $hashedPassword]);
    $newUser = $stmt->fetch();

    if (!$newUser || empty($newUser['user_id'])) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create account. Please try again.']);
        exit;
    }

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Account created successfully.']);

} catch (PDOException $e) {
    error_log('Registration error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred.']);
    exit;
}