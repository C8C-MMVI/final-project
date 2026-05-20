<?php
/**
 * includes/log.php
 * Central audit logger — writes to PostgreSQL system_logs table.
 * Call write_log($pdo, $userId, $action, $logType, $ip) from any endpoint.
 */

function write_log(
    PDO     $pdo,
    int     $userId,
    string  $action,
    string  $logType = 'info',
    ?string $ip      = null
): void {
    $allowed = ['info', 'warn', 'danger'];
    if (!in_array($logType, $allowed, true)) {
        $logType = 'info';
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO system_logs (user_id, action, log_type, ip_address)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $action, $logType, $ip]);
    } catch (PDOException $e) {
        // Log failure should never block the main response
        error_log('write_log failed: ' . $e->getMessage());
    }
}