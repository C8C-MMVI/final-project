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

if (!isset($_SESSION['role'])) {
    echo json_encode(['loggedIn' => false]);
    exit;
}

echo json_encode([
    'loggedIn' => true,
    'username' => $_SESSION['username'] ?? '',
    'role'     => $_SESSION['role'],
    'userId'   => $_SESSION['user_id'],
    'email'    => $_SESSION['email']    ?? '',
    // DB column is "phone" but frontend uses "contact" — map it here
    'contact'  => $_SESSION['phone']    ?? $_SESSION['contact'] ?? '',
    'avatar'   => $_SESSION['avatar']   ?? null,
]);