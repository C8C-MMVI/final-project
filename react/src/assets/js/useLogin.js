'use strict';

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({ username: false, password: false });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Toast
  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError, show: true });
    setTimeout(() => setToast(t => t ? { ...t, show: false } : null), 3300);
  }, []);

  // Password toggle
  const togglePassword = useCallback(() => {
    setShowPassword(v => !v);
  }, []);

  // Clear field error
  const clearError = useCallback((field) => {
    setErrors(e => ({ ...e, [field]: false }));
  }, []);

  const wrappedSetUsername = useCallback((val) => {
    setUsername(val);
    clearError('username');
  }, [clearError]);

  const wrappedSetPassword = useCallback((val) => {
    setPassword(val);
    clearError('password');
  }, [clearError]);

  // Validation
  function validateAll() {
    const newErrors = {
      username: !username.trim(),
      password: !password.trim(),
    };
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  }

  // Forgot password
  const handleForgot = useCallback((e) => {
    e.preventDefault();
    showToast('📧 A password reset link will be sent to your email.');
  }, [showToast]);

  // Submit
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
      showToast('⚠ Please fill in all required fields.', true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        showToast('✓ Login successful! Redirecting…');

        // Navigate to the SPA route returned by PHP
        if (data.redirect) {
          setTimeout(() => navigate(data.redirect, { replace: true }), 1200);
        }
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
    username, setUsername: wrappedSetUsername,
    password, setPassword: wrappedSetPassword,
    showPassword, togglePassword,
    remember, setRemember,
    errors,
    loading,
    handleSubmit,
    handleForgot,
    toast,
  };
}