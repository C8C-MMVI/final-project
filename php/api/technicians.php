<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../db_config.php';

$role   = $_SESSION['role'];
$userId = (int) $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

if ($role === 'owner') {
    $stmt = $pdo->prepare("
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.phone,
            u.status,
            st.shop_id,
            s.shop_name,
            st.appointed_at,
            COUNT(rr.request_id)                                        AS jobs_done,
            SUM(CASE WHEN rr.status = 'In Progress' THEN 1 ELSE 0 END) AS active_jobs
        FROM shop_technicians st
        JOIN users u  ON u.user_id  = st.technician_id
        JOIN shops s  ON s.shop_id  = st.shop_id
        LEFT JOIN repair_requests rr ON rr.technician_id = u.user_id
        WHERE s.owner_id = ?
        GROUP BY u.user_id, u.username, u.email, u.phone, u.status,
                 st.shop_id, s.shop_name, st.appointed_at
        ORDER BY u.username ASC
    ");
    $stmt->execute([$userId]);

} elseif ($role === 'admin') {
    $stmt = $pdo->query("
        SELECT
            u.user_id,
            u.username,
            u.email,
            u.phone,
            u.status,
            st.shop_id,
            s.shop_name,
            st.appointed_at,
            COUNT(rr.request_id)                                        AS jobs_done,
            SUM(CASE WHEN rr.status = 'In Progress' THEN 1 ELSE 0 END) AS active_jobs
        FROM shop_technicians st
        JOIN users u  ON u.user_id  = st.technician_id
        JOIN shops s  ON s.shop_id  = st.shop_id
        LEFT JOIN repair_requests rr ON rr.technician_id = u.user_id
        GROUP BY u.user_id, u.username, u.email, u.phone, u.status,
                 st.shop_id, s.shop_name, st.appointed_at
        ORDER BY s.shop_name ASC, u.username ASC
    ");

} else {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Forbidden.']);
    exit;
}

echo json_encode(['success' => true, 'technicians' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);