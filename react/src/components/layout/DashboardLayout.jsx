// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import styles  from './DashboardLayout.module.css';

const SECTION_MAP = {
  admin: {
    'Dashboard':       'dashboard',
    'User Management': 'userManagement',
    'Shop Requests':   'shopRequests',
    'System Logs':     'systemLogs',
  },
  owner: {
    'Dashboard':             'dashboard',
    'Repairs / Job Orders':  'repairs',
    'Inventory':             'inventory',
    'Customers':             'customers',
    'Reports / Analytics':   'reports',
    'Member Management':     'members',
  },
  technician: {
    'Dashboard':       'dashboard',
    'Repair Requests': 'repairs',
    'My Jobs':         'repairs',
    'Reviews':         'reviews',
  },
  customer: {
    'My Dashboard':    'dashboard',
    'My Repairs':      'repairs',
    'My Transactions': 'transactions',
    'Notifications':   'notifications',
    'Help & FAQs':     'help',
  },
};

const SECTION_KEYS = new Set([
  'dashboard', 'repairs', 'transactions', 'notifications',
  'help', 'userManagement', 'shopRequests', 'systemLogs',
  'reports', 'reviews', 'customers', 'inventory',
]);

const DEFAULT_SECTION = {
  admin:      'dashboard',
  owner:      'dashboard',
  technician: 'dashboard',
  customer:   'dashboard',
};

export default function DashboardLayout({ role, username, userId, children, pageMap, onLogout }) {
  const [page,       setPage]       = useState('dashboard');
  const [section,    setSection]    = useState(DEFAULT_SECTION[role] ?? 'dashboard');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await fetch('/api/logout.php', { method: 'POST', credentials: 'include' }); } catch {}
    onLogout?.();
    navigate('/login', { replace: true });
  };

  const handleNavigate = (pageKey, label) => {
    const mappedFromLabel = label ? (SECTION_MAP[role] ?? {})[label] : null;
    const key = mappedFromLabel ?? pageKey;

    if (SECTION_KEYS.has(key)) {
      setSection(key);
      setPage('dashboard');
      return;
    }

    if (pageMap?.[key]) {
      setPage(key);
      return;
    }

    setSection(key);
    setPage('dashboard');
  };

  const Content = loggingOut
    ? null
    : (pageMap?.[page] ?? pageMap?.['dashboard'] ?? null);

  return (
    <div className={styles.wrapper}>
      <Sidebar
        role={role}
        username={username}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        activeSection={section}
      />
      <div className={styles.main}>
        <Topbar
          role={role}
          username={username}
          currentPage={section}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <div className={styles.body}>
          {Content
            ? <Content
                setPage={setPage}
                activeSection={section}
                setActiveSection={setSection}
                username={username}
                userId={userId}
              />
            : children}
        </div>
      </div>
    </div>
  );
}