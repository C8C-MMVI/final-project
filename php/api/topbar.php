    <?php
    /**
     * components/topbar.php
     * Renders the top navigation bar.
     *
     * @param string $username  Current user's username
     * @param string $initials  Two-letter initials for the avatar
     * @param string $roleLabel Human-readable role label
     */

    if (!function_exists('topbarTimeAgo')) {
        function topbarTimeAgo(string $datetime): string {
            $diff = time() - strtotime($datetime);
            if ($diff < 60)     return 'Just now';
            if ($diff < 3600)   return intval($diff / 60) . ' min ago';
            if ($diff < 86400)  return intval($diff / 3600) . ' hr ago';
            if ($diff < 604800) return intval($diff / 86400) . ' day' . (intval($diff / 86400) > 1 ? 's' : '') . ' ago';
            return date('M j, Y', strtotime($datetime));
        }
    }

    function renderTopbar(string $username, string $initials, string $roleLabel): void {

        $icons = [
            'repair' => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
            'stock'  => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
            'done'   => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            'user'   => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        ];

        // ── Notifications from DB ──
        $notifications = [];

        try {
            global $pdo;

            $userId = $_SESSION['user_id'] ?? null;

            if ($userId && $pdo) {
                // Assigned pending repair requests
                $stmt = $pdo->prepare("
                    SELECT request_id, device_type, created_at
                    FROM repair_requests
                    WHERE technician_id = ?
                    AND status = 'Pending'
                    AND created_at >= NOW() - INTERVAL '7 days'
                    ORDER BY created_at DESC
                    LIMIT 3
                ");
                $stmt->execute([$userId]);
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                    $notifications[] = [
                        'icon'   => 'repair',
                        'title'  => 'New repair job assigned',
                        'desc'   => 'Job #' . $row['request_id'] . ' – ' . htmlspecialchars($row['device_type']),
                        'time'   => topbarTimeAgo($row['created_at']),
                        'unread' => true,
                    ];
                }

                // Completed repair requests
                $stmt = $pdo->prepare("
                    SELECT request_id, device_type, created_at
                    FROM repair_requests
                    WHERE technician_id = ?
                    AND status = 'Completed'
                    AND created_at >= NOW() - INTERVAL '7 days'
                    ORDER BY created_at DESC
                    LIMIT 3
                ");
                $stmt->execute([$userId]);
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                    $notifications[] = [
                        'icon'   => 'done',
                        'title'  => 'Job completed',
                        'desc'   => 'Job #' . $row['request_id'] . ' – ' . htmlspecialchars($row['device_type']),
                        'time'   => topbarTimeAgo($row['created_at']),
                        'unread' => false,
                    ];
                }
            }
        } catch (Exception $e) {
            // Fail silently — topbar should never crash the page
        }

        $unreadCount = count(array_filter($notifications, fn($n) => $n['unread']));

        // ── Search quick links ──
        $navLinks = [
            'Dashboard'      => 'dashboard.php',
            'Repairs'        => 'repairs.php',
            'Inventory'      => 'inventory.php',
            'Members'        => 'users.php',
            'Transactions'   => 'transactions.php',
        ];
    ?>

    <header class="topbar">

        <div class="topbar__left">
            <span class="topbar__page-title" id="pageTitle">Dashboard</span>
            <span class="topbar__breadcrumb" id="pageBreadcrumb">TechnoLogs / Dashboard</span>
        </div>

        <div class="topbar__right">

            <!-- ── Search ── -->
            <div class="tb-dropdown-wrapper">
                <button class="tb-icon-btn" id="tbSearchBtn" aria-label="Search"
                        onclick="tbToggle('tbSearchDropdown', this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                </button>
                <div class="tb-dropdown tb-search-dropdown" id="tbSearchDropdown">
                    <div class="tb-search-input-wrap">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input class="tb-search-input" type="text" id="tbSearchInput"
                            placeholder="Search pages…"
                            oninput="tbFilterSearch(this.value)">
                    </div>
                    <div class="tb-search-label">Quick Links</div>
                    <div id="tbSearchResults">
                        <?php foreach ($navLinks as $label => $href): ?>
                        <a href="<?= htmlspecialchars($href) ?>" class="tb-search-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                            <?= htmlspecialchars($label) ?>
                        </a>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- ── Notifications ── -->
            <div class="tb-dropdown-wrapper">
                <button class="tb-icon-btn" id="tbNotifBtn" aria-label="Notifications"
                        onclick="tbToggle('tbNotifDropdown', this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <?php if ($unreadCount > 0): ?>
                    <span class="tb-badge" id="tbNotifBadge"><?= $unreadCount ?></span>
                    <?php endif; ?>
                </button>
                <div class="tb-dropdown tb-notif-dropdown" id="tbNotifDropdown">
                    <div class="tb-dropdown-header">
                        <span class="tb-dropdown-title">Notifications</span>
                        <button class="tb-mark-read-btn" onclick="tbMarkAllRead()">Mark all read</button>
                    </div>
                    <div class="tb-notif-list">
                        <?php if (empty($notifications)): ?>
                        <div class="tb-notif-item" style="color:var(--muted);cursor:default;justify-content:center;font-size:0.8rem;">
                            No notifications
                        </div>
                        <?php else: ?>
                        <?php foreach ($notifications as $i => $n): ?>
                        <div class="tb-notif-item <?= $n['unread'] ? 'unread' : '' ?>" id="tbNotif-<?= $i ?>">
                            <div class="tb-notif-icon"><?= $icons[$n['icon']] ?></div>
                            <div class="tb-notif-content">
                                <div class="tb-notif-title"><?= htmlspecialchars($n['title']) ?></div>
                                <div class="tb-notif-desc"><?= htmlspecialchars($n['desc']) ?></div>
                            </div>
                            <span class="tb-notif-time"><?= htmlspecialchars($n['time']) ?></span>
                        </div>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                    <div class="tb-dropdown-footer">
                        <a href="#">View all notifications →</a>
                    </div>
                </div>
            </div>

            <!-- ── Profile dropdown ── -->
            <div class="tb-dropdown-wrapper">
                <button class="tb-profile-btn" id="tbProfileBtn" aria-label="Profile"
                        onclick="tbToggle('tbProfileDropdown', this)">
                    <div class="tb-avatar"><?= htmlspecialchars($initials) ?></div>
                    <div class="tb-profile-meta">
                        <span class="tb-profile-name"><?= htmlspecialchars($username) ?></span>
                        <span class="tb-profile-role"><?= htmlspecialchars($roleLabel) ?></span>
                    </div>
                    <svg class="tb-profile-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="tb-dropdown tb-profile-dropdown" id="tbProfileDropdown">

                    <div class="tb-profile-info">
                        <div class="tb-avatar tb-avatar-lg"><?= htmlspecialchars($initials) ?></div>
                        <div>
                            <div class="tb-profile-info-name"><?= htmlspecialchars($username) ?></div>
                            <div class="tb-profile-info-role"><?= htmlspecialchars($roleLabel) ?></div>
                        </div>
                    </div>

                    <div class="tb-profile-menu">
                        <a href="#" class="tb-menu-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            My Profile
                        </a>
                        <div class="tb-menu-divider"></div>
                        <a href="/api/logout.php" class="tb-menu-item tb-menu-danger">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16 17 21 12 16 7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Logout
                        </a>
                    </div>

                </div>
            </div>

        </div><!-- /.topbar__right -->

    </header>

    <?php
        $jsLinks = json_encode(
            array_map(
                fn($label, $href) => ['label' => $label, 'href' => $href],
                array_keys($navLinks),
                array_values($navLinks)
            )
        );
        echo "<script>const tbNavLinks = {$jsLinks};</script>";
    }