<?php
// php/api/serve_doc.php
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

$file     = $_GET['file']     ?? '';
$download = isset($_GET['download']); // ?download forces attachment

// ── Sanitize ──────────────────────────────────────────────────────────────────
$file = basename($file);

if ($file === '' || $file === '.') {
    http_response_code(400);
    echo 'Invalid file parameter.';
    exit;
}

// ── Resolve path ──────────────────────────────────────────────────────────────
$uploadDir = realpath(__DIR__ . '/../uploads/shop_docs');
$filePath  = $uploadDir . DIRECTORY_SEPARATOR . $file;

if ($uploadDir === false || strpos($filePath, $uploadDir) !== 0) {
    http_response_code(403);
    echo 'Forbidden.';
    exit;
}

if (!file_exists($filePath) || !is_file($filePath)) {
    http_response_code(404);
    echo 'File not found.';
    exit;
}

// ── MIME check ────────────────────────────────────────────────────────────────
$finfo    = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($filePath);

$allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
if (!in_array($mimeType, $allowedMimes, true)) {
    http_response_code(403);
    echo 'File type not allowed.';
    exit;
}

// ── Stream ────────────────────────────────────────────────────────────────────
$disposition = $download ? 'attachment' : 'inline';

header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($filePath));
header('Content-Disposition: ' . $disposition . '; filename="' . $file . '"');
header('Cache-Control: private, max-age=3600');

readfile($filePath);
exit;