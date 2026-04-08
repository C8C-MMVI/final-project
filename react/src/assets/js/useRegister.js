'use strict';

import { useState, useCallback } from 'react';

const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;

function scorePassword(val) {
  if (val.length < 6) return 0;
  let s = 1;
  if (val.length >= 10)         s++;
  if (/[A-Z]/.test(val))        s++;
  if (/[0-9]/.test(val))        s++;
  if (/[^A-Za-z0-9]/.test(val)) s++;
  return Math.min(s, 4);
}

export function useRegister() {
  const [username,        setUsernameRaw]        = useState('');
  const [phone,           setPhoneRaw]           = useState('');
  const [password,        setPasswordRaw]        = useState('');
  const [confirmPassword, setConfirmPasswordRaw] = useState('');
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength] = useState(null);
  const [errors,   setErrors]   = useState({
    username: '', phone: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);

  // Toast
  const showToast = useCallback((message, type = 'default') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast(t => t ? { ...t, show: false } : null), 3500);
  }, []);

  // Toggles
  const togglePassword        = useCallback(() => setShowPassword(v => !v),        []);
  const toggleConfirmPassword = useCallback(() => setShowConfirmPassword(v => !v), []);

  // Validators
  function validateUsername(val) {
    if (!val)            return 'Username is required.';
    if (val.length < 3)  return 'At least 3 characters required.';
    if (val.length > 30) return 'Maximum 30 characters allowed.';
    if (/\s/.test(val))  return 'No spaces allowed.';
    return '';
  }
  function validatePhone(val) {
    if (!val)                return 'Phone number is required.';
    if (!PHONE_RE.test(val)) return 'Enter a valid phone number.';
    return '';
  }
  function validatePassword(val) {
    if (!val)           return 'Password is required.';
    if (val.length < 8) return 'At least 8 characters required.';
    return '';
  }
  function validateConfirm(val, pw) {
    if (!val)      return 'Please confirm your password.';
    if (val !== pw) return 'Passwords do not match.';
    return '';
  }

  // Setters with live validation
  const setUsername = useCallback((val) => {
    setUsernameRaw(val);
    setErrors(e => ({ ...e, username: validateUsername(val.trim()) }));
  }, []);

  const setPhone = useCallback((val) => {
    setPhoneRaw(val);
    setErrors(e => ({ ...e, phone: validatePhone(val.trim()) }));
  }, []);

  const setPassword = useCallback((val) => {
    setPasswordRaw(val);
    setStrength(val ? scorePassword(val) : null);
    setErrors(e => ({
      ...e,
      password: validatePassword(val),
      // re-validate confirm if already filled
      confirmPassword: e.confirmPassword ? validateConfirm(e._confirmVal ?? '', val) : e.confirmPassword,
    }));
  }, []);

  const setConfirmPassword = useCallback((val) => {
    setConfirmPasswordRaw(val);
    setErrors(e => ({ ...e, confirmPassword: validateConfirm(val, password) }));
  }, [password]);

  // Full validation on submit
  function validateAll() {
    const u = validateUsername(username.trim());
    const p = validatePhone(phone.trim());
    const w = validatePassword(password);
    const c = validateConfirm(confirmPassword, password);
    setErrors({ username: u, phone: p, password: w, confirmPassword: c });
    return !u && !p && !w && !c;
  }

  // Submit
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
      showToast('⚠ Please fix the errors before continuing.', 'error');
      return;
    }

    setLoading(true);

    try {
      const res  = await fetch('/api/register.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          username:         username.trim(),
          phone:            phone.trim(),
          password,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();

      setLoading(false);

      if (res.ok && data.success) {
        showToast('✓ Account created! Redirecting to login…', 'success');
        setTimeout(() => { window.location.href = '/login'; }, 1500);
      } else {
        showToast('⚠ ' + (data.message || 'Registration failed. Please try again.'), 'error');
      }
    } catch (err) {
      setLoading(false);
      console.error('Registration error:', err);
      showToast('⚠ Cannot connect to server. Please try again.', 'error');
    }
  }

  return {
    username,        setUsername,
    phone,           setPhone,
    password,        setPassword,
    confirmPassword, setConfirmPassword,
    showPassword,        togglePassword,
    showConfirmPassword, toggleConfirmPassword,
    strength,
    errors,
    loading,
    handleSubmit,
    toast,
  };
}
