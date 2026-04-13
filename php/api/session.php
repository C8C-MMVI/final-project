<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

header('Content-Type: application/json');

echo json_encode(
    isset($_SESSION['role'])
        ? [
            'loggedIn' => true,
            'username' => $_SESSION['username'],
            'role'     => $_SESSION['role'],
            'userId'   => $_SESSION['user_id'],
          ]
        : ['loggedIn' => false]
);