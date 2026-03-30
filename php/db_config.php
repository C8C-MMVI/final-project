<?php
/**
 * db_config.php
 * Reads credentials from environment variables (Docker).
 * Falls back to MySQL for local XAMPP development.
 */

$host   = getenv('DB_HOST')     ?: 'localhost';
$port   = getenv('DB_PORT')     ?: 5432;
$db     = getenv('DB_NAME')     ?: 'technologs_db';
$user   = getenv('DB_USER')     ?: 'postgres';
$pass   = getenv('DB_PASSWORD') ?: '1234';
$driver = getenv('DB_HOST') ? 'pgsql' : 'mysql';

try {
    if ($driver === 'pgsql') {
        $dsn = "pgsql:host=$host;port=$port;dbname=$db";
    } else {
        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    }

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}