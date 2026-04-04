<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

$host = getenv('DB_HOST')     ?: 'db';
$port = getenv('DB_PORT')     ?: 5432;
$db   = getenv('DB_NAME')     ?: 'technologs_db';
$user = getenv('DB_USER')     ?: 'postgres';
$pass = getenv('DB_PASSWORD') ?: '1234';
$dsn  = "pgsql:host=$host;port=$port;dbname=$db";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    $pdo->exec("SET search_path TO public");
} catch (PDOException $e) {
    error_log('DB connection failed: ' . $e->getMessage());
    if (!headers_sent()) {
        header('Content-Type: application/json');
        http_response_code(500);
    }
    echo json_encode(['success' => false, 'message' => 'Database unavailable.']);
    exit;
}