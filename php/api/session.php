<?php
/**
 * api/session.php
 * Returns the currently logged-in user from session.
 */

session_start();
header('Content-Type: application/json');

// Add your CORS headers here if needed (match your login.php)
// header('Access-Control-Allow-Origin: http://localhost:3000');
// header('Access-Control-Allow-Credentials: true');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'user' => [
            'userId'   => $_SESSION['user_id'],
            'username' => $_SESSION['username'],
            'role'     => $_SESSION['role'],
        ]
    ]);
} else {
    echo json_encode(['user' => null]);
}