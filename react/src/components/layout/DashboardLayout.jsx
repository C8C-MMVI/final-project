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
    'Customers':             'customers',   // ← own section now
    'Reports / Analytics':   'reports',
    'Member Management':     'members',     // ← stays as members
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

const DEFAULT_SECTION = {
  admin:      'dashboard',
  owner:      'dashboard',
  technician: 'dashboard',
  customer:   'dashboard',
};

export default function DashboardLayout({ role, username, children, pageMap, onLogout }) {
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
    const mapped = label ? (SECTION_MAP[role] ?? {})[label] : null;
  
    // If it's a standalone page (members, profile, repairs), load it directly
    const standalonePages = Object.keys(pageMap ?? {}).filter(k => k !== 'dashboard');
    if (standalonePages.includes(pageKey) && !mapped) {
      setPage(pageKey);
      return;
    }
  
    if (mapped) {
      // 'members' for owner is a standalone page, not a section inside OwnerDashboard
      if (pageKey === 'members') {
        setPage('members');
        setSection('members');
        return;
      }
      setSection(mapped);
      setPage('dashboard');
    } else {
      setPage(pageKey);
    }
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
              />
            : children}
        </div>
      </div>
    </div>
  );
}