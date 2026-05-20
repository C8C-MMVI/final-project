<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';
require_once __DIR__ . '/../includes/notify.php';

// ← ADD THIS TEMPORARILY
ini_set('display_errors', 1);
error_reporting(E_ALL);
set_exception_handler(function($e) {
    echo json_encode(['success' => false, 'debug' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
    exit;
});

$role   = $_SESSION['role'];
$userId = (int) $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// ── Document upload helper ────────────────────────────────────────────────────
/**
 * Validates and saves an uploaded document file.
 * Returns the saved relative path, or throws on error.
 *
 * @param  array  $file     Entry from $_FILES (e.g. $_FILES['dti_permit'])
 * @param  string $fieldKey Field name used in error messages
 * @return string           Relative path e.g. "uploads/shop_docs/abc123_dti.pdf"
 */
function saveShopDocument(array $file, string $fieldKey): string
{
    // Allowed MIME types
    $allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
    ];

    // Max 5 MB per file
    $maxBytes = 5 * 1024 * 1024;

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errMap = [
            UPLOAD_ERR_INI_SIZE   => 'File too large (server limit).',
            UPLOAD_ERR_FORM_SIZE  => 'File too large (form limit).',
            UPLOAD_ERR_PARTIAL    => 'File only partially uploaded.',
            UPLOAD_ERR_NO_FILE    => 'No file uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder.',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
            UPLOAD_ERR_EXTENSION  => 'A PHP extension blocked the upload.',
        ];
        throw new RuntimeException(
            ($errMap[$file['error']] ?? 'Unknown upload error.') . " ($fieldKey)"
        );
    }

    if ($file['size'] > $maxBytes) {
        throw new RuntimeException("$fieldKey: File must be 5 MB or smaller.");
    }

    // Check MIME via finfo (more reliable than $_FILES['type'])
    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (!in_array($mimeType, $allowedMimes, true)) {
        throw new RuntimeException("$fieldKey: Only PDF, JPG, or PNG files are accepted.");
    }

    // Build unique filename: {timestamp}_{random}_{field}.{ext}
    $extMap = [
        'application/pdf' => 'pdf',
        'image/jpeg'      => 'jpg',
        'image/jpg'       => 'jpg',
        'image/png'       => 'png',
    ];
    $ext      = $extMap[$mimeType];
    $filename = time() . '_' . bin2hex(random_bytes(6)) . '_' . $fieldKey . '.' . $ext;

    // Save to php/uploads/shop_docs/
    $uploadDir = __DIR__ . '/../uploads/shop_docs/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $destPath = $uploadDir . $filename;
    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        throw new RuntimeException("$fieldKey: Failed to save file. Check folder permissions.");
    }

    return 'uploads/shop_docs/' . $filename;
}

// ── Customer GET: check their own request status ──────────────────────────────
if ($method === 'GET' && $role === 'customer') {
    $stmt = $pdo->prepare("
        SELECT
            status,
            dti_permit,
            nc3_certificate,
            bir_permit,
            dit_permit,
            ntc_permit,
            requested_at
        FROM shop_requests
        WHERE user_id = ?
        ORDER BY requested_at DESC
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $req = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'my_request' => $req ?: null]);
    exit;
}

// ── Customer POST: submit a shop request (multipart/form-data) ────────────────
if ($method === 'POST' && $role === 'customer') {

    // Data comes as multipart/form-data (because of file uploads)
    $shopName    = trim($_POST['shop_name']      ?? '');
    $address     = trim($_POST['address']        ?? '');
    $contact     = trim($_POST['contact_number'] ?? '');
    $description = trim($_POST['description']    ?? '');

    // ── Validate required text fields ────────────────────────────────────────
    if (!$shopName || !$address || !$contact) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Shop name, address, and contact number are required.',
        ]);
        exit;
    }

    // ── Validate required documents ──────────────────────────────────────────
    $requiredDocs = ['dti_permit', 'nc3_certificate', 'bir_permit', 'dit_permit', 'ntc_permit'];
    foreach ($requiredDocs as $doc) {
        if (empty($_FILES[$doc]) || $_FILES[$doc]['error'] === UPLOAD_ERR_NO_FILE) {
            http_response_code(422);
            echo json_encode([
                'success' => false,
                'message' => "Document required: $doc. Please upload all five permits.",
            ]);
            exit;
        }
    }

    // ── Check for duplicate pending/approved request ──────────────────────────
    $check = $pdo->prepare("
        SELECT request_id, status FROM shop_requests
        WHERE user_id = ? AND status IN ('pending', 'approved')
        LIMIT 1
    ");
    $check->execute([$userId]);
    $existing = $check->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $msg = $existing['status'] === 'approved'
            ? 'You already have an approved shop.'
            : 'You already have a pending shop request. Please wait for admin review.';
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => $msg]);
        exit;
    }

    // ── Save uploaded files ───────────────────────────────────────────────────
    $savedPaths = [];
    try {
        foreach ($requiredDocs as $doc) {
            $savedPaths[$doc] = saveShopDocument($_FILES[$doc], $doc);
        }
    } catch (RuntimeException $e) {
        // Clean up any files already saved before the error
        foreach ($savedPaths as $path) {
            $abs = __DIR__ . '/../' . $path;
            if (file_exists($abs)) unlink($abs);
        }
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }

    // ── Insert into DB ────────────────────────────────────────────────────────
    try {
        $stmt = $pdo->prepare("
            INSERT INTO shop_requests (
                user_id, shop_name, address, contact_number, description,
                dti_permit, nc3_certificate, bir_permit, dit_permit, ntc_permit,
                status, requested_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
            RETURNING request_id
        ");
        $stmt->execute([
            $userId,
            $shopName,
            $address,
            $contact,
            $description,
            $savedPaths['dti_permit'],
            $savedPaths['nc3_certificate'],
            $savedPaths['bir_permit'],
            $savedPaths['dit_permit'],
            $savedPaths['ntc_permit'],
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Notify all admins
        $admins = $pdo->query("SELECT user_id FROM users WHERE role = 'admin'")
                      ->fetchAll(PDO::FETCH_COLUMN);
        foreach ($admins as $adminId) {
            notify(
                (int) $adminId,
                "New shop registration request: \"{$shopName}\". Documents attached. Please review in Shop Requests."
            );
        }

        echo json_encode([
            'success'    => true,
            'message'    => 'Shop request submitted! Please wait for admin approval.',
            'request_id' => (int) $row['request_id'],
        ]);

    } catch (PDOException $e) {
        // DB failed — clean up uploaded files
        foreach ($savedPaths as $path) {
            $abs = __DIR__ . '/../' . $path;
            if (file_exists($abs)) unlink($abs);
        }
        error_log('shop_requests POST error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error. Please try again.']);
    }
    exit;
}

// ── Admin only below this point ───────────────────────────────────────────────
if ($role !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

// ── Admin POST: approve or reject ─────────────────────────────────────────────
if ($method === 'POST') {
    $body      = json_decode(file_get_contents('php://input'), true);
    $requestId = (int) ($body['shop_id'] ?? 0);
    $action    = $body['action'] ?? '';

    if (!$requestId || !in_array($action, ['approve', 'reject'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid request.']);
        exit;
    }

    $newStatus = $action === 'approve' ? 'approved' : 'rejected';

    $pdo->prepare("
        UPDATE shop_requests
        SET status = ?, reviewed_at = NOW(), reviewed_by = ?
        WHERE request_id = ?
    ")->execute([$newStatus, $userId, $requestId]);

    $infoStmt = $pdo->prepare("
        SELECT sr.shop_name, sr.address, sr.contact_number, sr.user_id
        FROM shop_requests sr
        WHERE sr.request_id = ?
    ");
    $infoStmt->execute([$requestId]);
    $info = $infoStmt->fetch(PDO::FETCH_ASSOC);

    if ($info && $action === 'approve') {
        $pdo->prepare("UPDATE users SET role = 'owner' WHERE user_id = ?")
            ->execute([$info['user_id']]);

        $pdo->prepare("
            INSERT INTO shops (owner_id, shop_name, address, contact_number, status, created_at)
            VALUES (?, ?, ?, ?, 'active', NOW())
        ")->execute([
            $info['user_id'],
            $info['shop_name'],
            $info['address'],
            $info['contact_number'],
        ]);

        notify(
            (int) $info['user_id'],
            "Congratulations! Your shop \"{$info['shop_name']}\" has been approved. " .
            "Please log out and log back in to access your Shop Owner dashboard."
        );

    } elseif ($info && $action === 'reject') {
        notify(
            (int) $info['user_id'],
            "Your shop registration request for \"{$info['shop_name']}\" was not approved. " .
            "Please contact support for more information."
        );
    }

    // Audit log
    try {
        $shopName = $info['shop_name'] ?? "ID $requestId";
        $pdo->prepare("
            INSERT INTO system_logs (user_id, action, log_type, ip_address, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ")->execute([
            $userId,
            "Admin {$action}d shop request: \"{$shopName}\"",
            $action === 'approve' ? 'info' : 'warn',
            $_SERVER['REMOTE_ADDR'] ?? null,
        ]);
    } catch (PDOException $e) {
        error_log('Audit log failed: ' . $e->getMessage());
    }

    echo json_encode(['success' => true, 'status' => $newStatus]);
    exit;
}

// ── Admin GET: all shop requests ──────────────────────────────────────────────
try {
    $requests = $pdo->query("
        SELECT
            sr.request_id    AS shop_id,
            sr.shop_name,
            sr.address,
            sr.contact_number,
            sr.description,
            LOWER(sr.status) AS status,
            sr.requested_at  AS created_at,
            sr.rejection_reason,
            sr.reviewed_at,
            sr.dti_permit,
            sr.nc3_certificate,
            sr.bir_permit,
            sr.dit_permit,
            sr.ntc_permit,
            u.username       AS owner_name,
            u.email
        FROM shop_requests sr
        JOIN users u ON u.user_id = sr.user_id
        ORDER BY sr.requested_at DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'requests' => $requests]);
} catch (PDOException $e) {
    error_log('shop_requests GET failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}