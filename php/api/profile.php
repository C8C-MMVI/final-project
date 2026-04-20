<?php
/**
 * api/profile.php
 * Any logged-in user — update their own username.
 * Receives JSON: { username }
 */

session_start();
header('Content-Type: application/json');

// Must be logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

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

if (!$username) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Username cannot be empty.']);
    exit;
}

if (strlen($username) < 3 || strlen($username) > 50) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Username must be 3–50 characters.']);
    exit;
}

$userId = (int) $_SESSION['user_id'];

// Check username isn't already taken by someone else
$check = $pdo->prepare('SELECT user_id FROM users WHERE username = ? AND user_id != ?');
$check->execute([$username, $userId]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'message' => 'Username already taken.']);
    exit;
}

$stmt = $pdo->prepare('UPDATE users SET username = ? WHERE user_id = ?');
$stmt->execute([$username, $userId]);

// Update session so the topbar reflects the new name immediately
$_SESSION['username'] = $username;

echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);