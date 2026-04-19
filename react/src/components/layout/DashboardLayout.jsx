// src/components/layout/DashboardLayout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import styles  from './DashboardLayout.module.css';

// Which dashboard component to render for each page key
// Pass the page-level components in via props so this stays generic
export default function DashboardLayout({ role, username, children, pageMap }) {
  const [page, setPage] = useState('dashboard');
  const navigate        = useNavigate();

  const handleLogout = () => {
    navigate('/login', { replace: true });
  };

  const handleNavigate = (p) => setPage(p);

  // Resolve which content to render: pageMap overrides, else default children
  const Content = pageMap?.[page] ?? null;

  return (
    <div className={styles.wrapper}>
      <Sidebar
        role={role}
        username={username}
        onNavigate={handleNavigate}
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