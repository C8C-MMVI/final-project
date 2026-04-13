'use strict';

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const navigate = useNavigate();

  const [username,     setUsernameRaw] = useState('');
  const [password,     setPasswordRaw] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember,     setRemember]    = useState(true);
  const [errors,       setErrors]      = useState({ username: false, password: false });
  const [loading,      setLoading]     = useState(false);
  const [toast,        setToast]       = useState(null);

  // ── Toast ──────────────────────────────────────────────────────────
  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError, show: true });
    setTimeout(() => setToast(t => t ? { ...t, show: false } : null), 3300);
  }, []);

  // ── Password toggle ────────────────────────────────────────────────
  const togglePassword = useCallback(() => setShowPassword(v => !v), []);

  // ── Setters — clear error on change ───────────────────────────────
  const setUsername = useCallback((val) => {
    setUsernameRaw(val);
    setErrors(e => ({ ...e, username: false }));
  }, []);

  const setPassword = useCallback((val) => {
    setPasswordRaw(val);
    setErrors(e => ({ ...e, password: false }));
  }, []);

  // ── Validation ─────────────────────────────────────────────────────
  function validateAll() {
    const newErrors = {
      username: !username.trim(),
      password: !password.trim(),
    };
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  }

  // ── Forgot password ────────────────────────────────────────────────
  const handleForgot = useCallback((e) => {
    e.preventDefault();
    showToast('📧 A password reset link will be sent to your email.');
  }, [showToast]);

  // ── Submit ─────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
      showToast('⚠ Please fill in all required fields.', true);
      return;
    }

    setLoading(true);

    try {
      const res  = await fetch('/api/login.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        showToast('✓ Login successful! Redirecting…');
        // Use redirect path from PHP directly
        setTimeout(() => navigate(data.redirect, { replace: true }), 1200);
      } else if (res.status === 403) {
        // Account disabled
        showToast('⚠ ' + data.message, true);
      } else {
        setErrors(e => ({ ...e, password: true }));
        showToast('⚠ ' + (data.message || 'Invalid username or password.'), true);
      }
    } catch (err) {
      setLoading(false);
      console.error('Login error:', err);
      showToast('⚠ Cannot connect to server. Please try again.', true);
    }
  }

  return {
    username,     setUsername,
    password,     setPassword,
    showPassword, togglePassword,
    remember,     setRemember,
    errors,
    loading,
    handleSubmit,
    handleForgot,
    toast,
  };
}