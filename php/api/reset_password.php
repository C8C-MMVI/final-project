<?php
/**
 * api/reset_password.php
 *
 * GET  ?token=xxx        → { valid: true|false }   (used by ResetPassword.jsx on mount)
 * POST { token, password } → { success, message }
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once __DIR__ . '/../db_config.php';

// ── GET: validate token ───────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = trim($_GET['token'] ?? '');

    if (empty($token)) {
        echo json_encode(['valid' => false]);
        exit;
    }

    try {
        // ✅ column is `token`, not `token_hash`
        $stmt = $pdo->prepare(
            "SELECT id FROM password_resets
              WHERE token = ? AND used = false AND expires_at > NOW()
              LIMIT 1"
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch();
    } catch (PDOException $e) {
        error_log('reset_password GET failed: ' . $e->getMessage());
        echo json_encode(['valid' => false]);
        exit;
    }

    echo json_encode(['valid' => (bool)$row]);
    exit;
}

// ── POST: apply new password ──────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$token    = trim($data['token']            ?? '');
$password = trim($data['password']         ?? '');
$confirm  = trim($data['confirm_password'] ?? '');

if (empty($token) || empty($password)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Token and new password are required.']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
    exit;
}

if ($password !== $confirm) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

try {
    // ✅ column is `token`, not `token_hash`
    $stmt = $pdo->prepare(
        "SELECT id, user_id, expires_at, used FROM password_resets
          WHERE token = ? LIMIT 1"
    );
    $stmt->execute([$token]);
    $reset = $stmt->fetch();
} catch (PDOException $e) {
    error_log('reset_password POST lookup failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred.']);
    exit;
}

if (!$reset) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or expired reset link.']);
    exit;
}

if ($reset['used']) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'This reset link has already been used.']);
    exit;
}

if (strtotime($reset['expires_at']) < time()) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'This reset link has expired. Please request a new one.']);
    exit;
}

try {
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // ✅ column is `id`, not `user_id`
    $pdo->prepare('UPDATE users SET password = ? WHERE id = ?')
        ->execute([$hashedPassword, $reset['user_id']]);

    // ✅ PostgreSQL boolean is `true`, not 1
    $pdo->prepare('UPDATE password_resets SET used = true WHERE id = ?')
        ->execute([$reset['id']]);

} catch (PDOException $e) {
    error_log('reset_password POST update failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'A server error occurred.']);
    exit;
}

http_response_code(200);
echo json_encode(['success' => true, 'message' => 'Password updated successfully. You can now log in.']);