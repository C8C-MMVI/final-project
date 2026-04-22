<?php
/**
 * notify.php — Reusable notification helper
 *
 * Include this file in any PHP API file, then call:
 *   notify($pdo, $user_id, "Your repair status has been updated.");
 *
 * For multiple recipients:
 *   notifyMany($pdo, [1, 2, 3], "Shop request approved.");
 */

/**
 * Create a single notification for one user.
 */
function notify(PDO $pdo, int $user_id, string $message): void {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, message)
            VALUES (?, ?)
        ");
        $stmt->execute([$user_id, $message]);
    } catch (Exception $e) {
        // Never let a notification failure break the main action
        error_log('notify() failed: ' . $e->getMessage());
    }
}

/**
 * Create a notification for multiple users at once.
 */
function notifyMany(PDO $pdo, array $user_ids, string $message): void {
    foreach ($user_ids as $uid) {
        notify($pdo, (int)$uid, $message);
    }
}

/**
 * Notify all users with a given role.
 * e.g. notifyRole($pdo, 'admin', 'New shop request submitted.')
 */
function notifyRole(PDO $pdo, string $role, string $message): void {
    try {
        $stmt = $pdo->prepare("
            SELECT user_id FROM users WHERE role = ?
        ");
        $stmt->execute([$role]);
        $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
        notifyMany($pdo, $ids, $message);
    } catch (Exception $e) {
        error_log('notifyRole() failed: ' . $e->getMessage());
    }
}