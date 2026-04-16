import { useState, useCallback } from 'react';

export function useResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    if (!password.trim()) {
      setPasswordError('Password is required.');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/reset_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const text = await res.text();
      let data = {};
      try { data = JSON.parse(text); } catch { }

      if (res.ok && data.success) {
        setSuccess(true);
        setMessage(data.message || 'Password updated successfully.');
      } else {
        setSuccess(false);
        setMessage(data.message || 'Failed to reset password.');
      }
    } catch {
      setSuccess(false);
      setMessage('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, password]);

  return {
    token, setToken,
    password, setPassword,
    passwordError,
    loading,
    success,
    message,
    handleSubmit,
  };
}