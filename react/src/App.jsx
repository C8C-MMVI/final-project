import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import './assets/css/login.css';
import './assets/css/tailwind.css';

import Login    from './pages/Login';
import Register from './pages/Register';

import Sidebar             from './components/layout/Sidebar';
import Topbar              from './components/layout/Topbar';
import QuickActions        from './components/layout/QuickActions';
import OwnerDashboard      from './pages/OwnerDashboard';
import AdminDashboard      from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import CustomerDashboard   from './pages/CustomerDashboard';
import InventoryPage       from './pages/InventoryPage';
import MembersPage         from './pages/MembersPage';
import RepairsPage         from './pages/RepairsPage';

import styles from './App.module.css';

function DashboardShell({ user, onLogout }) {
  const { username, role } = user;
  const [activePage, setActivePage] = useState('dashboard');

  const dashboards = {
    owner:      <OwnerDashboard      setPage={setActivePage} />,
    admin:      <AdminDashboard      setPage={setActivePage} />,
    technician: <TechnicianDashboard setPage={setActivePage} />,
    customer:   <CustomerDashboard   setPage={setActivePage} username={username} />,
  };

  const pages = {
    dashboard: dashboards[role] ?? dashboards.admin,
    inventory: <InventoryPage setPage={setActivePage} role={role} />,
    members:   <MembersPage   setPage={setActivePage} />,
    repairs:   <RepairsPage   setPage={setActivePage} role={role} />,
  };

  const currentPage = pages[activePage] ?? pages.dashboard;

  return (
    <div className={styles.app}>
      <Sidebar role={role} username={username} onLogout={onLogout} onNavigate={setActivePage} />
      <div className={styles.main}>
        <Topbar role={role} username={username} onLogout={onLogout} />
        <QuickActions role={role} activePage={activePage} setPage={setActivePage} />
        {currentPage}
      </div>
    </div>
  );
}

function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login    onLogin={handleLogin} />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register onLogin={handleLogin} />} />
      <Route path="/" element={
        <PrivateRoute user={user}>
          <DashboardShell user={user} onLogout={handleLogout} />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}