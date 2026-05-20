<?php
// api/profile_debug.php
// DELETE THIS FILE after debugging is done
session_set_cookie_params([
    'lifetime' => 0, 'path' => '/',
    'secure' => false, 'httponly' => true, 'samesite' => 'Lax',
]);
session_start();
header('Content-Type: application/json');

$debug = [
    'session'      => $_SESSION,
    'user_id_raw'  => $_SESSION['user_id'] ?? 'NOT SET',
    'user_id_cast' => isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null,
];

// Try DB connection
try {
    require_once __DIR__ . '/../db_config.php';
    $debug['db_connected'] = true;

    // Check if user exists by id
    $userId = (int)($_SESSION['user_id'] ?? 0);
    $stmt = $pdo->prepare('SELECT id, username, email, phone, role FROM users WHERE id = :id');
    $stmt->execute([':id' => $userId]);
    $row = $stmt->fetch();
    $debug['user_found']  = (bool)$row;
    $debug['user_row']    = $row ?: null;

    // Also check avatar column exists
    $col = $pdo->query("SELECT column_name FROM information_schema.columns
                        WHERE table_name = 'users' AND column_name = 'avatar'")->fetch();
    $debug['avatar_column_exists'] = (bool)$col;

} catch (PDOException $e) {
    $debug['db_connected'] = false;
    $debug['db_error']     = $e->getMessage();
}

echo json_encode($debug, JSON_PRETTY_PRINT);