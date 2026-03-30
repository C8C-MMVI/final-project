<?php
/**
 * components/dashboard/sidebar.php
 * Role-aware sidebar navigation.
 */

function renderSidebar(string $role, string $dotClass, string $roleLabel): void {
?>
<aside class="sidebar" id="sidebar">

  <div class="sidebar__header">
    <img src="../images/Logo.png" alt="TechnoLogs" class="sidebar__logo"/>
    <button class="sidebar__toggle" id="sidebarToggle" aria-label="Toggle sidebar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
  </div>

  <div class="sidebar__role-badge">
    <span class="role-badge__dot <?= $dotClass ?>"></span>
    <span class="role-badge__label"><?= htmlspecialchars($roleLabel) ?></span>
  </div>

  <nav class="sidebar__nav">

    <?php if ($role === 'admin'): ?>

      <span class="nav-section-label">Main</span>
      <a href="admin_dashboard.php" class="nav-item" data-page="Dashboard" data-tooltip="Dashboard">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
        <span class="nav-item__label">Dashboard</span>
      </a>

      <span class="nav-section-label">System</span>
      <a href="user_management.php" class="nav-item" data-page="User Management" data-tooltip="User Management">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
        <span class="nav-item__label">User Management</span>
      </a>
      <a href="shop_requests.php" class="nav-item" data-page="Shop Requests" data-tooltip="Shop Requests">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
        <span class="nav-item__label">Shop Requests</span>
      </a>
      <a href="system_logs.php" class="nav-item" data-page="System Logs" data-tooltip="System Logs">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
        <span class="nav-item__label">System Logs</span>
      </a>

    <?php elseif ($role === 'owner'): ?>

      <span class="nav-section-label">Main</span>
      <a href="owner_dashboard.php" class="nav-item" data-page="Dashboard" data-tooltip="Dashboard">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
        <span class="nav-item__label">Dashboard</span>
      </a>
      <a href="repairs.php" class="nav-item" data-page="Repairs / Job Orders" data-tooltip="Repairs / Job Orders">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
        <span class="nav-item__label">Repairs / Job Orders</span>
      </a>

      <span class="nav-section-label">Management</span>
      <a href="inventory.php" class="nav-item" data-page="Inventory" data-tooltip="Inventory">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
        <span class="nav-item__label">Inventory</span>
      </a>
      <a href="customers.php" class="nav-item" data-page="Customers" data-tooltip="Customers">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
        <span class="nav-item__label">Customers</span>
      </a>

      <span class="nav-section-label">Insights</span>
      <a href="reports.php" class="nav-item" data-page="Reports / Analytics" data-tooltip="Reports / Analytics">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>
        <span class="nav-item__label">Reports / Analytics</span>
      </a>

    <?php else: ?>

      <span class="nav-section-label">Main</span>
      <a href="dashboard.php" class="nav-item" data-page="Dashboard" data-tooltip="Dashboard">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
        <span class="nav-item__label">Dashboard</span>
      </a>
      <a href="repairs.php" class="nav-item" data-page="Repairs / Job Orders" data-tooltip="Repairs / Job Orders">
        <span class="nav-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></span>
        <span class="nav-item__label">Repairs / Job Orders</span>
      </a>

    <?php endif; ?>

  </nav>

</aside>
<?php
}