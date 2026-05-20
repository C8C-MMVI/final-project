<?php
session_start();
header('Content-Type: application/json');

// Capture fatal errors as JSON instead of 500 silence
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            http_response_code(500);
        }
        echo json_encode([
            'success' => false,
            'message' => 'Fatal error: ' . $err['message'] . ' in ' . $err['file'] . ':' . $err['line']
        ]);
    }
});

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once dirname(__DIR__) . '/db_config.php';
require_once dirname(__DIR__) . '/includes/log.php';

$method = $_SERVER['REQUEST_METHOD'];
$role   = $_SESSION['role'] ?? '';

// ── GET ───────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    try {
        $stmt = $pdo->query("
            SELECT user_id, username, email, role, status, created_at
            FROM users
            ORDER BY created_at DESC
        ");
        echo json_encode(['success' => true, 'users' => $stmt->fetchAll()]);
    } catch (PDOException $e) {
        error_log('GET /users failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Query failed: ' . $e->getMessage()]);
    }
    exit;
}

// ── POST ──────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    $data     = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $email    = trim($data['email']    ?? '');
    $password = trim($data['password'] ?? '');
    $newRole  = trim($data['role']     ?? 'technician');

    if (!$username || !$password) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
        exit;
    }

    if (strlen($username) < 3 || strlen($username) > 50) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Username must be 3–50 characters.']);
        exit;
    }

    if (strlen($password) < 8) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters.']);
        exit;
    }

    $allowedRoles = ['admin', 'technician'];
    if (!in_array($newRole, $allowedRoles, true)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Invalid role. Only technician or admin accounts can be created here.']);
        exit;
    }

    try {
        $check = $pdo->prepare("SELECT user_id FROM users WHERE username = ?");
        $check->execute([$username]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Username already exists.']);
            exit;
        }

        if ($email) {
            $checkEmail = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
            $checkEmail->execute([$email]);
            if ($checkEmail->fetch()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Email already exists.']);
                exit;
            }
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, password, role, status, created_at)
            VALUES (?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
            RETURNING user_id
        ");
        $stmt->execute([$username, $email ?: null, $hash, $newRole]);

        $newUserId = $stmt->fetchColumn();

        write_log($pdo, (int) $_SESSION['user_id'], "Admin created new {$newRole} account: {$username}", 'info', $_SERVER['REMOTE_ADDR'] ?? null);

        echo json_encode([
            'success' => true,
            'message' => 'Member added successfully.',
            'user_id' => $newUserId,
        ]);
    } catch (PDOException $e) {
        error_log('POST /users failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to create user: ' . $e->getMessage()]);
    }
    exit;
}

// ── DELETE ────────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Forbidden.']);
        exit;
    }

    $data     = json_decode(file_get_contents('php://input'), true);
    $targetId = (int) ($data['user_id'] ?? 0);
    $selfId   = (int) $_SESSION['user_id'];

    if (!$targetId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'user_id is required.']);
        exit;
    }

    if ($targetId === $selfId) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'You cannot delete your own account.']);
        exit;
    }

    try {
        $fetchUser = $pdo->prepare("SELECT username, role FROM users WHERE user_id = ?");
        $fetchUser->execute([$targetId]);
        $targetUser = $fetchUser->fetch(PDO::FETCH_ASSOC);

        if (!$targetUser) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found.']);
            exit;
        }

        $pdo->beginTransaction();

        // ── 1. Get all shops owned by this user ───────────────────────────
        $shopStmt = $pdo->prepare("SELECT shop_id FROM shops WHERE owner_id = ?");
        $shopStmt->execute([$targetId]);
        $shopIds = $shopStmt->fetchAll(PDO::FETCH_COLUMN);

        if (!empty($shopIds)) {
            $placeholders = implode(',', array_fill(0, count($shopIds), '?'));

            $pdo->prepare("UPDATE shop_technicians SET appointed_by = NULL WHERE shop_id IN ($placeholders)")->execute($shopIds);
            $pdo->prepare("DELETE FROM shop_technicians WHERE shop_id IN ($placeholders)")->execute($shopIds);
            $pdo->prepare("DELETE FROM repair_requests WHERE shop_id IN ($placeholders)")->execute($shopIds);
            $pdo->prepare("DELETE FROM shops WHERE shop_id IN ($placeholders)")->execute($shopIds);
        }

        // ── 2. Technician membership in OTHER shops ────────────────────────
        $pdo->prepare("UPDATE shop_technicians SET appointed_by = NULL WHERE appointed_by = ?")->execute([$targetId]);
        $pdo->prepare("DELETE FROM shop_technicians WHERE technician_id = ?")->execute([$targetId]);

        // ── 3. shop_requests ──────────────────────────────────────────────
        $pdo->prepare("UPDATE shop_requests SET reviewed_by = NULL WHERE reviewed_by = ?")->execute([$targetId]);
        $pdo->prepare("DELETE FROM shop_requests WHERE user_id = ?")->execute([$targetId]);

        // ── 4. notifications ──────────────────────────────────────────────
        $pdo->prepare("DELETE FROM notifications WHERE user_id = ?")->execute([$targetId]);

        // ── 5. repair_requests as customer in OTHER shops ─────────────────
        $pdo->prepare("DELETE FROM repair_requests WHERE customer_id = ?")->execute([$targetId]);

        // ── 6. user_profiles ──────────────────────────────────────────────
        $pdo->prepare("DELETE FROM user_profiles WHERE user_id = ?")->execute([$targetId]);

        // ── 7. Audit log ──────────────────────────────────────────────────
        write_log(
            $pdo,
            $selfId,
            "Admin deleted user: '{$targetUser['username']}' (role: {$targetUser['role']})",
            'warn',
            $_SERVER['REMOTE_ADDR'] ?? null
        );

        // ── 8. Finally delete the user ────────────────────────────────────
        $pdo->prepare("DELETE FROM users WHERE user_id = ?")->execute([$targetId]);

        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'User deleted.']);

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('DELETE /users failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Delete failed: ' . $e->getMessage()]);
    }
    exit;
}

// ── 405 Method Not Allowed ────────────────────────────────────────────────────
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);