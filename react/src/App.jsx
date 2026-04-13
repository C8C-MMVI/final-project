// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

import './assets/css/login.css';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session.php", { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUserRole(data.loggedIn ? data.role : null);
      })
      .catch(() => setUserRole(null))
      .finally(() => setLoading(false));
  }, []);

  // Block ALL route rendering until session is resolved
  if (loading) return null;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin" userRole={userRole} loading={loading}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <PrivateRoute role="owner" userRole={userRole} loading={loading}>
              <OwnerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/technician"
          element={
            <PrivateRoute role="technician" userRole={userRole} loading={loading}>
              <TechnicianDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <PrivateRoute role="customer" userRole={userRole} loading={loading}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;