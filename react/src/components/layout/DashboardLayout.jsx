// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import styles  from './DashboardLayout.module.css';

export default function DashboardLayout({ role, username, children, pageMap }) {
  const [page, setPage] = useState('dashboard');
  const navigate        = useNavigate();

  const handleLogout = () => {
    // Clear session then redirect to login
    fetch('/api/logout.php', { credentials: 'include' })
      .finally(() => navigate('/login', { replace: true }));
  };

  const handleNavigate = (p) => setPage(p);

  const Content = pageMap?.[page] ?? null;

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