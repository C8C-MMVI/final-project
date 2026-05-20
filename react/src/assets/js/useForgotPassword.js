import { useState } from 'react';

export default function useForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);   // true once API returns success
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side guard
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/forgot_password.php', {   // relative — works in all envs
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });

      // Backend always returns 200 for valid requests (prevents enumeration)
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Cannot connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSent(false);
    setError('');
    setEmail('');
  };

  return { email, setEmail, loading, sent, error, handleSubmit, reset };
}