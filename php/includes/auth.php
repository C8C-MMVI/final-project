<?php
/**
 * includes/auth.php
 * Session authentication helper.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

/**
 * Require the user to be logged in with a specific role.
 * Accepts a string or an array of allowed roles.
 *
 * @param string|array $roles
 */
function authRequireRole(string|array $roles): void {
    $roles = (array) $roles;

    // Not logged in
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
        exit;
    }

    // Wrong role
    if (!in_array($_SESSION['role'], $roles)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Forbidden. Insufficient permissions.']);
        exit;
    }
}