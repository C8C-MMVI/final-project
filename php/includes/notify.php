<?php
require_once __DIR__ . '/../db_config.php';

function notify(int $user_id, string $message): void {
    try {
        global $pdo;
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, message, is_read, created_at)
            VALUES (:uid, :msg, FALSE, NOW())
        ");
        $stmt->execute([':uid' => $user_id, ':msg' => $message]);
    } catch (Exception $e) {
        error_log('notify() failed: ' . $e->getMessage());
    }
}

function notifyMany(array $user_ids, string $message): void {
    foreach ($user_ids as $uid) {
        notify((int) $uid, $message);
    }
}

function notifyRole(string $role, string $message): void {
    try {
        global $pdo;
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE role = ?");
        $stmt->execute([$role]);
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        notifyMany($ids, $message);
    } catch (Exception $e) {
        error_log('notifyRole() failed: ' . $e->getMessage());
    }
}