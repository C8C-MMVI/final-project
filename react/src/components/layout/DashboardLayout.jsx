// src/components/layout/DashboardLayout.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import styles  from './DashboardLayout.module.css';

const SECTION_MAP = {
  admin: {
    'Dashboard':       'dashboard',
    'Repairs':         'repairs',
    'User Management': 'userManagement',
    'Shop Requests':   'shopRequests',
    'System Logs':     'systemLogs',
    'My Profile':      'profile',
    'Notifications':   'notifications',
  },
  owner: {
    'Dashboard':             'dashboard',
    'Repairs / Job Orders':  'repairs',
    'Inventory':             'inventory',
    'Customers':             'customers',
    'Reports / Analytics':   'reports',
    'Member Management':     'members',
    'My Profile':            'profile',
    'Notifications':         'notifications',
  },
  technician: {
    'My Jobs':       'repairs',
    'Reviews':       'reviews',
    'My Profile':    'profile',
    'Notifications': 'notifications',
  },
  customer: {
    'My Dashboard':     'dashboard',
    'My Repairs':       'repairs',
    'My Transactions':  'transactions',
    'Notifications':    'notifications',
    'Help & FAQs':      'help',
    'My Profile':       'profile',
    'Register My Shop': 'shop',
  },
};

const SECTION_KEYS = new Set([
  'dashboard', 'repairs', 'transactions', 'notifications',
  'help', 'shop',
  'userManagement', 'shopRequests', 'systemLogs',
  'reports', 'reviews', 'customers', 'inventory',
  'members', 'profile', 'chat',
]);

const DEFAULT_SECTION = {
  admin:      'dashboard',
  owner:      'dashboard',
  technician: 'repairs',
  customer:   'dashboard',
};

// Sidebar widths — must match Sidebar.module.css
const SIDEBAR_EXPANDED  = 260;
const SIDEBAR_COLLAPSED = 68;

export default function DashboardLayout({
  role, username, avatar, userId, children, pageMap, onLogout, onProfileUpdate,
}) {
  const [page,            setPage]            = useState(DEFAULT_SECTION[role] ?? 'dashboard');
  const [section,         setSection]         = useState(DEFAULT_SECTION[role] ?? 'dashboard');
  const [selectedId,      setSelectedId]      = useState(null);
  const [loggingOut,      setLoggingOut]      = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [collapsed,       setCollapsed]       = useState(false);  // ← lifted from Sidebar
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await fetch('/api/logout.php', { method: 'POST', credentials: 'include' }); } catch {}
    onLogout?.();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (pageKey, labelOrId) => {
    setSidebarOpen(false);

    if (
      typeof labelOrId === 'number' ||
      (labelOrId !== null && labelOrId !== undefined && labelOrId !== '' && !isNaN(Number(labelOrId)))
    ) {
      const id = labelOrId != null ? Number(labelOrId) : null;
      setSelectedId(id);
      if (pageMap?.[pageKey]) {
        setPage(pageKey); setSection(pageKey);
      } else if (SECTION_KEYS.has(pageKey)) {
        setSection(pageKey); setPage(pageKey);
      } else {
        setSection(pageKey); setPage('dashboard');
      }
      return;
    }

    setSelectedId(null);
    const label           = labelOrId;
    const mappedFromLabel = label ? (SECTION_MAP[role] ?? {})[label] : null;
    const key             = mappedFromLabel ?? pageKey;

    if (SECTION_KEYS.has(key)) setSection(key);
    if (pageMap?.[key]) { setPage(key); setSection(key); return; }
    setPage('dashboard');
  };

  const handleUnreadChatChange = useCallback((count) => {
    setUnreadChatCount(count);
  }, []);

  const Content = loggingOut
    ? null
    : (pageMap?.[page] ?? pageMap?.['dashboard'] ?? null);

  // On mobile (≤900px) the sidebar is off-canvas, so no margin needed
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
  const sidebarWidth = isMobile ? 0 : (collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED);

  return (
    <div className={styles.wrapper}>

      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        role={role}
        username={username}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        activeSection={section}
        isOpen={sidebarOpen}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(c => !c)}
      />

      {/* margin-left mirrors the sidebar width so content is never hidden behind it */}
      <div
        className={styles.main}
        style={{
          marginLeft: sidebarWidth,
          transition: 'margin-left 0.28s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <Topbar
          role={role}
          username={username}
          avatar={avatar}
          currentPage={section}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onMenuToggle={() => setSidebarOpen(o => !o)}
          unreadChatCount={unreadChatCount}
        />
        <div className={styles.body}>
          {Content
            ? <Content
                role={role}
                setPage={setPage}
                activeSection={section}
                setActiveSection={setSection}
                username={username}
                avatar={avatar}
                userId={userId}
                selectedId={selectedId}
                clearSelectedId={() => setSelectedId(null)}
                onProfileUpdate={onProfileUpdate}
                onUnreadChatChange={handleUnreadChatChange}
              />
            : children}
        </div>
      </div>
    </div>
  );
}