<?php
/**
 * api/profile.php
 *
 * REAL users table (technologs_db, public schema, as PHP sees it):
 *   user_id, username, email, phone, password, role, status, created_at, avatar
 *
 * PK  = user_id
 * TEL = phone
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();
header('Content-Type: application/json');

// ── Auth ──────────────────────────────────────────────────────────────────────
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

// ── DB ────────────────────────────────────────────────────────────────────────
require_once __DIR__ . '/../db_config.php';

$userId      = (int) $_SESSION['user_id'];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isMultipart = str_contains($contentType, 'multipart/form-data');

// ── Parse body ────────────────────────────────────────────────────────────────
if ($isMultipart) {
    $data = $_POST;
} else {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
        exit;
    }
}

$action = $data['action'] ?? 'update_info';

// ═════════════════════════════════════════════════════════════════════════════
//  change_password
// ═════════════════════════════════════════════════════════════════════════════
if ($action === 'change_password') {
    $oldPw = $data['old_password'] ?? '';
    $newPw = $data['new_password'] ?? '';

    if (!$oldPw || !$newPw) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Both passwords are required.']);
        exit;
    }
    if (strlen($newPw) < 8) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 8 characters.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT password FROM users WHERE user_id = :id');
        $stmt->execute([':id' => $userId]);
        $row  = $stmt->fetch();
    } catch (PDOException $e) {
        error_log('profile.php/change_password select: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        exit;
    }

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        exit;
    }
    if (!password_verify($oldPw, $row['password'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
        exit;
    }
    if (password_verify($newPw, $row['password'])) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'New password must differ from current.']);
        exit;
    }

    try {
        $upd = $pdo->prepare('UPDATE users SET password = :pw WHERE user_id = :id');
        $upd->execute([':pw' => password_hash($newPw, PASSWORD_DEFAULT), ':id' => $userId]);
    } catch (PDOException $e) {
        error_log('profile.php/change_password update: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update password: ' . $e->getMessage()]);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
    exit;
}

// ═════════════════════════════════════════════════════════════════════════════
//  update_info — username + phone + optional avatar
// ═════════════════════════════════════════════════════════════════════════════
$username = trim($data['username'] ?? '');
// Frontend sends field as "contact", DB column is "phone"
$phone    = trim($data['contact'] ?? $data['phone'] ?? '');

if ($username === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Display name cannot be empty.']);
    exit;
}
if (strlen($username) < 3 || strlen($username) > 50) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Display name must be 3–50 characters.']);
    exit;
}
if ($phone !== '' && !preg_match('/^[\d\s\+\-\(\)]{7,20}$/', $phone)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Phone number format is invalid.']);
    exit;
}

// Unique username check
try {
    $chk = $pdo->prepare('SELECT user_id FROM users WHERE username = :uname AND user_id != :id');
    $chk->execute([':uname' => $username, ':id' => $userId]);
    if ($chk->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'That display name is already taken.']);
        exit;
    }
} catch (PDOException $e) {
    error_log('profile.php/username_check: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    exit;
}

// ── Avatar upload ─────────────────────────────────────────────────────────────
$avatarUrl = null;

if ($isMultipart && isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['avatar'];

    if ($file['size'] > 2 * 1024 * 1024) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Photo must be under 2 MB.']);
        exit;
    }

    if (function_exists('finfo_open')) {
        $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    } else {
        $info     = @getimagesize($file['tmp_name']);
        $mimeType = $info ? $info['mime'] : null;
    }

    $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
    if (!$mimeType || !isset($allowed[$mimeType])) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Only JPG and PNG photos are allowed.']);
        exit;
    }

    $uploadDir = __DIR__ . '/../uploads/avatars/';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server storage error.']);
        exit;
    }

    foreach (glob($uploadDir . 'avatar_' . $userId . '_*') ?: [] as $old) {
        @unlink($old);
    }

    $filename = 'avatar_' . $userId . '_' . time() . '.' . $allowed[$mimeType];
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save photo.']);
        exit;
    }
    $avatarUrl = '/uploads/avatars/' . $filename;
}

// ── UPDATE — correct columns: user_id, phone, avatar ─────────────────────────
try {
    if ($avatarUrl !== null) {
        $stmt = $pdo->prepare(
            'UPDATE users SET username = :uname, phone = :phone, avatar = :avatar WHERE user_id = :id'
        );
        $stmt->execute([
            ':uname'  => $username,
            ':phone'  => $phone ?: null,
            ':avatar' => $avatarUrl,
            ':id'     => $userId,
        ]);
    } else {
        $stmt = $pdo->prepare(
            'UPDATE users SET username = :uname, phone = :phone WHERE user_id = :id'
        );
        $stmt->execute([
            ':uname' => $username,
            ':phone' => $phone ?: null,
            ':id'    => $userId,
        ]);
    }
} catch (PDOException $e) {
    error_log('profile.php/update_info: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save changes: ' . $e->getMessage()]);
    exit;
}

// Sync session
$_SESSION['username'] = $username;
$_SESSION['phone']    = $phone;
if ($avatarUrl !== null) {
    $_SESSION['avatar'] = $avatarUrl;
}

$response = ['success' => true, 'message' => 'Profile updated successfully.'];
if ($avatarUrl !== null) {
    $response['avatar_url'] = $avatarUrl;
}
echo json_encode($response);