import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './assets/css/login.css';
import './assets/css/tailwind.css';

import Home                from './pages/Home';
import Login               from './pages/Login';
import Register            from './pages/Register';
import ResetPassword       from './pages/ResetPassword';
import PrivateRoute        from './routes/PrivateRoute';
import DashboardLayout     from './components/layout/DashboardLayout';

import CustomerDashboard   from './pages/CustomerDashboard';
import AdminDashboard      from './pages/AdminDashboard';
import OwnerDashboard      from './pages/OwnerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

import RepairsPage         from './pages/RepairsPage';
import MembersPage         from './pages/MembersPage';
import ProfilePage         from './pages/ProfilePage';

const customerPages   = { dashboard: CustomerDashboard,   repairs: RepairsPage, profile: ProfilePage };
const adminPages      = { dashboard: AdminDashboard,      repairs: RepairsPage, members: MembersPage, profile: ProfilePage };
const ownerPages      = { dashboard: OwnerDashboard,      repairs: RepairsPage, members: MembersPage, profile: ProfilePage };
const technicianPages = { dashboard: TechnicianDashboard, repairs: RepairsPage, profile: ProfilePage };

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [userId,   setUserId]   = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch('/api/session.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) {
          setUserRole(data.role);
          setUsername(data.username ?? '');
          setUserId(data.userId ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    setUserRole(null);
    setUsername('');
    setUserId(null);
  };

  const withLayout = (role, pageMap) => (
    <DashboardLayout
      role={role}
      username={username}
      userId={userId}
      pageMap={pageMap}
      onLogout={handleLogout}
    />
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            !loading && userRole
              ? <Navigate to={`/${userRole}/dashboard`} replace />
              : <Login />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/customer/dashboard"
          element={
            <PrivateRoute role="customer" userRole={userRole} loading={loading}>
              {withLayout('customer', customerPages)}
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="admin" userRole={userRole} loading={loading}>
              {withLayout('admin', adminPages)}
            </PrivateRoute>
          }
        />
        <Route
          path="/owner/dashboard"
          element={
            <PrivateRoute role="owner" userRole={userRole} loading={loading}>
              {withLayout('owner', ownerPages)}
            </PrivateRoute>
          }
        />
        <Route
          path="/technician/dashboard"
          element={
            <PrivateRoute role="technician" userRole={userRole} loading={loading}>
              {withLayout('technician', technicianPages)}
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}