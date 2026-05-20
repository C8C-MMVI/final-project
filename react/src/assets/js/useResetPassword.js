import { useState, useCallback } from 'react';

export function useResetPassword() {
  // Read token once from URL on hook initialisation
  const [token] = useState(
    () => new URLSearchParams(window.location.search).get('token') || ''
  );

  const [password,      setPassword]      = useState('');
  const [confirm,       setConfirm]       = useState('');
  const [errors,        setErrors]        = useState({ password: '', confirm: '' });
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  // Live strength indicator helpers
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)              s++;
    if (/[A-Z]/.test(password))           s++;
    if (/[0-9]/.test(password))           s++;
    if (/[^A-Za-z0-9]/.test(password))    s++;
    return s;   // 0-4
  })();

  const validate = useCallback(() => {
    const pwErr  = password.length < 8 ? 'At least 8 characters required.' : '';
    const cfmErr = confirm !== password  ? 'Passwords do not match.'        : '';
    setErrors({ password: pwErr, confirm: cfmErr });
    return !pwErr && !cfmErr;
  }, [password, confirm]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setServerMessage('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res  = await fetch('/api/reset_password.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          token,
          password,
          confirm_password: confirm,
        }),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { /* non-JSON body */ }

      if (res.ok && data.success) {
        setSuccess(true);
        setServerMessage(data.message || 'Password updated successfully.');
      } else {
        setSuccess(false);
        setServerMessage(data.message || 'Failed to reset password. Please try again.');
      }
    } catch {
      setSuccess(false);
      setServerMessage('Cannot connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [token, password, confirm, validate]);

  return {
    token,
    password,      setPassword,
    confirm,       setConfirm,
    errors,
    loading,
    success,
    serverMessage,
    strength,
    handleSubmit,
  };
}