// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

import './assets/css/login.css'
function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch session from PHP
  useEffect(() => {
    fetch("/php_sys/api/session.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setUserRole(data.role);
        } else {
          setUserRole(null);
        }
      })
      .catch((err) => {
        console.error("Session fetch error:", err);
        setUserRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>; // optional: a spinner

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
            <PrivateRoute role="admin" userRole={userRole}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/owner"
          element={
            <PrivateRoute role="owner" userRole={userRole}>
              <OwnerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/technician"
          element={
            <PrivateRoute role="technician" userRole={userRole}>
              <TechnicianDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <PrivateRoute role="customer" userRole={userRole}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;