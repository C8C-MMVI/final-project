// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import styles  from './DashboardLayout.module.css';

export default function DashboardLayout({ role, username, children, pageMap, onLogout }) {
  const [page,       setPage]       = useState('dashboard');
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    // 1. Unmount dashboard content immediately so no more fetches fire
    setLoggingOut(true);

    // 2. Destroy the server session
    try {
      await fetch('/api/logout.php', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}

    // 3. Clear userRole in App state — this is what actually allows
    //    /login to render instead of redirecting back to the dashboard
    onLogout?.();

    // 4. Navigate to login
    navigate('/login', { replace: true });
  };

  const handleNavigate = (p) => setPage(p);

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
      />
      <div className={styles.main}>
        <Topbar
          role={role}
          username={username}
          currentPage={page}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        <div className={styles.body}>
          {Content
            ? <Content setPage={setPage} />
            : children}
        </div>
      </div>
    </div>
  );
}