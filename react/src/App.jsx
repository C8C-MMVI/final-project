// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './assets/css/login.css';
import './assets/css/tailwind.css';

import Home                from './pages/Home';
import Login               from './pages/Login';
import Register            from './pages/Register';
import PrivateRoute        from './routes/PrivateRoute';
import DashboardLayout     from './components/layout/DashboardLayout';

// Dashboard main pages
import CustomerDashboard   from './pages/CustomerDashboard';
import AdminDashboard      from './pages/AdminDashboard';
import OwnerDashboard      from './pages/OwnerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

// Sub-pages (used inside the layout via pageMap)
import RepairsPage         from './pages/RepairsPage';
import MembersPage         from './pages/MembersPage';

// ── Page maps per role ─────────────────────────────────────────────────────
// Keys must match what Sidebar's labelToPage / Topbar's roleNavLinks produce
const customerPages = {
  dashboard: CustomerDashboard,
  repairs:   RepairsPage,
};

const adminPages = {
  dashboard: AdminDashboard,
  repairs:   RepairsPage,
  members:   MembersPage,
};

const ownerPages = {
  dashboard: OwnerDashboard,
  repairs:   RepairsPage,
  members:   MembersPage,
};

const technicianPages = {
  dashboard: TechnicianDashboard,
  repairs:   RepairsPage,
};

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [userRole,  setUserRole]  = useState(null);
  const [username,  setUsername]  = useState('');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/session.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) {
          setUserRole(data.role);
          setUsername(data.username ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Shared layout builder — keeps routes DRY
  const withLayout = (role, pageMap) => (
    <DashboardLayout role={role} username={username} pageMap={pageMap} />
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ── */}
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

        {/* ── Protected routes ── */}
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