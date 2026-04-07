import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import InventoryPage from './pages/InventoryPage';
import MembersPage from './pages/MembersPage';
import RepairsPage from './pages/RepairsPage';

// Layout
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import QuickActions from './components/layout/QuickActions';

// Styles
import './assets/css/login.css';
import './assets/css/tailwind.css';

// ========================
// Private Route
// ========================
function PrivateRoute({ user, children }) {
  if (user === null) return <div>Loading…</div>; // session fetch not done
  return user ? children : <Navigate to="/login" replace />;
}

// ========================
// Role-Based Route
// ========================
function RoleRoute({ user, allowedRoles, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

// ========================
// Role-Based Dashboard Switcher
// ========================
function RoleBasedDashboard({ user }) {
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'owner':
      return <OwnerDashboard />;
    case 'technician':
      return <TechnicianDashboard />;
    case 'customer':
      return <CustomerDashboard username={user.username} />;
    default:
      return <div>Unauthorized role</div>;
  }
}

// ========================
// Dashboard Layout
// ========================
function DashboardShell({ user, onLogout }) {
  return (
    <div className="app">
      <Sidebar role={user.role} username={user.username} onLogout={onLogout} />
      <div className="main">
        <Topbar role={user.role} username={user.username} onLogout={onLogout} />
        <QuickActions role={user.role} />
        <Outlet />
      </div>
    </div>
  );
}

// ========================
// App Routes
// ========================
function AppRoutes() {
  const [user, setUser] = useState(null); // null = loading

  // Fetch session on mount
  useEffect(() => {
    fetch('/api/session.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        else setUser(false); // not logged in
      })
      .catch(err => {
        console.error('Session fetch error:', err);
        setUser(false);
      });
  }, []);

  // Login handler
  const handleLogin = async (userData) => {
    setUser(userData);
  };

  // Logout handler
  const handleLogout = async () => {
    await fetch('/api/logout.php', { method: 'POST', credentials: 'include' });
    setUser(false);
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register onLogin={handleLogin} />}
      />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute user={user}>
            <DashboardShell user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      >
        {/* Default dashboard */}
        <Route index element={<RoleBasedDashboard user={user} />} />

        {/* Repairs (all roles) */}
        <Route path="repairs" element={<RepairsPage role={user?.role} />} />

        {/* Inventory (admin + owner) */}
        <Route
          path="inventory"
          element={
            <RoleRoute user={user} allowedRoles={['admin', 'owner']}>
              <InventoryPage />
            </RoleRoute>
          }
        />

        {/* Members (admin + owner) */}
        <Route
          path="members"
          element={
            <RoleRoute user={user} allowedRoles={['admin', 'owner']}>
              <MembersPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ========================
// Main App
// ========================
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}