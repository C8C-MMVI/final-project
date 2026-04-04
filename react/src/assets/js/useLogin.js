'use strict';

import { useState, useCallback } from 'react';

export function useLogin({ onLogin } = {}) {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]         = useState(true);
  const [errors, setErrors]             = useState({ username: false, password: false });
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError, show: true });
    setTimeout(() => setToast(t => t ? { ...t, show: false } : null), 3300);
  }, []);

  const togglePassword = useCallback(() => {
    setShowPassword(v => !v);
  }, []);

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

  function validateAll() {
    const newErrors = {
      username: !username.trim(),
      password: !password.trim(),
    };
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  }

  const handleForgot = useCallback((e) => {
    e.preventDefault();
    showToast('📧 A password reset link will be sent to your email.');
  }, [showToast]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
      showToast('⚠ Please fill in all required fields.', true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/login.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      // ✅ Safe parsing — won't throw if server returns non-JSON
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned an invalid response.');
      }

      if (res.ok && data.success) {
        showToast('✓ Login successful! Redirecting…');
        setTimeout(() => {
          onLogin?.({ userId: data.userId, username: data.username, role: data.role });
        }, 1200);
      } else {
        setErrors(e => ({ ...e, password: true }));
        showToast('⚠ ' + (data.message || 'Invalid username or password.'), true);
      }
    } catch (err) {
      console.error('Login error:', err);
      showToast('⚠ ' + (err.message === 'Server returned an invalid response.'
        ? 'Server error. Please try again.'
        : 'Cannot connect to server. Please try again.'), true);
    } finally {
      setLoading(false);   // ✅ always runs
    }
  }

  return {
    username,     setUsername: wrappedSetUsername,
    password,     setPassword: wrappedSetPassword,
    showPassword, togglePassword,
    remember,     setRemember,
    errors,
    loading,
    handleSubmit,
    handleForgot,
    toast,
  };
}