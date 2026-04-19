'use strict';

import { useState, useCallback } from 'react';

const REMEMBER_KEY = 'remembered_username';

export function useLogin() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember]         = useState(true);
  const [errors, setErrors]             = useState({ username: false, password: false });
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);

  const [forgotOpen,       setForgotOpen]       = useState(false);
  const [forgotEmail,      setForgotEmail]      = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [forgotLoading,    setForgotLoading]    = useState(false);
  const [forgotSent,       setForgotSent]       = useState(false);

  // Toast
  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError, show: true });
    setTimeout(() => setToast(t => t ? { ...t, show: false } : null), 3300);
  }, []);

  // Password toggle
  const togglePassword = useCallback(() => {
    setShowPassword(v => !v);
  }, []);

  // Clear field error on input
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
    setForgotEmail('');
    setForgotEmailError('');
    setForgotSent(false);
    setForgotOpen(true);
  }, []);

  const closeForgot = useCallback(() => setForgotOpen(false), []);

  const handleForgotSubmit = useCallback(async (e) => {
    e.preventDefault();

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim()) {
      setForgotEmailError('Email address is required.');
      return;
    }
    if (!EMAIL_RE.test(forgotEmail.trim())) {
      setForgotEmailError('Enter a valid email address.');
      return;
    }

    setForgotEmailError('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/forgot_password.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: forgotEmail.trim() }),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { }

      if (data.success) {
        setForgotSent(true);
      } else {
        setForgotEmailError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setForgotEmailError('Cannot connect to server. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  }, [forgotEmail]);

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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      // safe parse — avoids crash on empty or non-JSON response
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error('Server returned non-JSON response:', text);
        showToast('⚠ Unexpected server response. Please contact support.', true);
        setLoading(false);
        return;
      }

      setLoading(false);

      if (res.ok && data.success) {
        try {
          if (remember) {
            localStorage.setItem(REMEMBER_KEY, username.trim());
          } else {
            localStorage.removeItem(REMEMBER_KEY);
          }
        } catch { }

        showToast('✓ Login successful! Redirecting…');
        setTimeout(() => { window.location.href = data.redirect; }, 1200);
      } else {
        setErrors(e => ({ ...e, password: true }));
        showToast('⚠ ' + (data.message || 'Invalid username or password.'), true);
      }
    } catch (err) {
      console.error('Login error:', err);
      showToast('⚠ Cannot connect to server. Please try again.', true);
    } finally {
      setLoading(false);
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
    forgotOpen,
    closeForgot,
    forgotEmail,      setForgotEmail,
    forgotLoading,
    forgotEmailError, setForgotEmailError,
    forgotSent,
    handleForgotSubmit,
  };
}