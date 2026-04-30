<?php
/**
 * mongo_config.php
 *
 * MongoDB connection helper — sits alongside db_config.php (PostgreSQL).
 * Requires: composer require mongodb/mongodb
 *
 * Add to .env / docker-compose.yml:
 *   MONGO_HOST     (default: mongo)
 *   MONGO_PORT     (default: 27017)
 *   MONGO_DB       (default: technologs_mongo)
 *   MONGO_USER     (optional)
 *   MONGO_PASSWORD (optional)
 */

require_once __DIR__ . '/vendor/autoload.php';

function getMongoDb(): \MongoDB\Database {
    static $db = null;
    if ($db !== null) return $db;

    $host     = getenv('MONGO_HOST')     ?: 'mongo';
    $port     = getenv('MONGO_PORT')     ?: '27017';
    $dbName   = getenv('MONGO_DB')       ?: 'technologs_mongo';
    $user     = getenv('MONGO_USER')     ?: '';
    $password = getenv('MONGO_PASSWORD') ?: '';

    $uri = ($user && $password)
        ? "mongodb://{$user}:{$password}@{$host}:{$port}/{$dbName}"
        : "mongodb://{$host}:{$port}";

    try {
        $client = new \MongoDB\Client($uri);
        $db     = $client->selectDatabase($dbName);
    } catch (\Exception $e) {
        error_log('MongoDB connection failed: ' . $e->getMessage());
        if (!headers_sent()) {
            header('Content-Type: application/json');
            http_response_code(500);
        }
        echo json_encode(['success' => false, 'message' => 'MongoDB unavailable.']);
        exit;
    }

    return $db;
}