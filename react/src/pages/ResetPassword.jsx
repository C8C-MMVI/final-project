import { useState, useEffect } from 'react';
import Background from '../components/shared/Background';
import Toast from '../components/shared/Toast';

const inputBase = [
  'w-full py-[13px] pl-[16px] pr-[44px]',
  'bg-[rgba(255,255,255,0.06)]',
  'border border-[rgba(255,255,255,0.15)] rounded-[10px]',
  'text-white text-[0.91rem]',
  'outline-none',
  'placeholder:text-[rgba(255,255,255,0.28)]',
  'transition-[border-color,box-shadow,background] duration-[250ms]',
  'focus:border-teal focus:shadow-[0_0_0_3px_rgba(26,188,156,0.25)] focus:bg-[rgba(26,188,156,0.04)]',
].join(' ');

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get('token') || '';

  const [tokenValid,   setTokenValid]   = useState(null);
  const [password,     setPassword]     = useState('');
  const [confirm,      setConfirm]      = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [errors,       setErrors]       = useState({ password: '', confirm: '' });
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError, show: true });
    setTimeout(() => setToast(t => t ? { ...t, show: false } : null), 3300);
  };

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    fetch(`/api/reset_password.php?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => setTokenValid(d.valid))
      .catch(() => setTokenValid(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();

    const pwErr  = password.length < 8 ? 'At least 8 characters required.' : '';
    const cfmErr = confirm !== password  ? 'Passwords do not match.'        : '';
    setErrors({ password: pwErr, confirm: cfmErr });
    if (pwErr || cfmErr) return;

    setLoading(true);
    try {
      const res  = await fetch('/api/reset_password.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password, confirm_password: confirm }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setDone(true);
        showToast('✓ Password reset! Redirecting to login…');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
      } else {
        showToast('⚠ ' + (data.message || 'Something went wrong.'), true);
      }
    } catch {
      showToast('⚠ Cannot connect to server.', true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Background />
      <div className="relative z-[2] flex items-center justify-center min-h-screen p-6">
        <div
          className="w-full max-w-[440px] rounded-[22px] border border-[rgba(26,188,156,0.18)] backdrop-blur-[28px] px-[clamp(28px,4vw,44px)] py-[clamp(36px,6vh,56px)]"
          style={{
            background: 'rgba(10,22,44,0.92)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.65)',
            animation: 'fadeUp 0.7s cubic-bezier(.22,.68,0,1.2) both',
          }}
        >
          {tokenValid === null && (
            <p className="text-[rgba(255,255,255,0.55)] text-center text-[0.9rem]">Verifying reset link…</p>
          )}

          {tokenValid === false && (
            <div className="flex flex-col items-center text-center gap-[14px]">
              <div className="text-[2.5rem]">⛔</div>
              <h2 className="text-white text-[1.2rem] font-bold">Link Invalid or Expired</h2>
              <p className="text-[rgba(255,255,255,0.5)] text-[0.84rem]">
                This password reset link is no longer valid. Please request a new one.
              </p>
              <a
                href="/login"
                className="mt-2 text-teal text-[0.85rem] no-underline hover:text-white transition-colors"
              >
                ← Back to Login
              </a>
            </div>
          )}

          {tokenValid === true && !done && (
            <>
              <h2 className="text-white text-[1.4rem] font-bold mb-[6px]">Set New Password</h2>
              <p className="text-[rgba(255,255,255,0.5)] text-[0.84rem] mb-[26px]">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[16px]">
                <div className="flex flex-col gap-[7px]">
                  <label className="text-[0.7rem] font-semibold tracking-[2.5px] uppercase text-[rgba(255,255,255,0.7)]">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="At least 8 characters…"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`${inputBase} ${errors.password ? 'border-[#ff4f4f]' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-[13px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.55)] hover:text-teal">
                      {showPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[0.74rem] text-[#ff4f4f]">⚠ {errors.password}</span>}
                </div>

                <div className="flex flex-col gap-[7px]">
                  <label className="text-[0.7rem] font-semibold tracking-[2.5px] uppercase text-[rgba(255,255,255,0.7)]">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password…"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={`${inputBase} ${errors.confirm ? 'border-[#ff4f4f]' : ''}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-[13px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.55)] hover:text-teal">
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirm && <span className="text-[0.74rem] text-[#ff4f4f]">⚠ {errors.confirm}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-[13px] rounded-[10px] font-semibold text-[0.92rem] text-white border-none cursor-pointer transition-all duration-200 mt-[4px]"
                  style={{
                    background: loading ? 'rgba(26,188,156,0.5)' : 'linear-gradient(135deg,#1abc9c,#16a085)',
                    boxShadow: loading ? 'none' : '0 4px 18px rgba(26,188,156,0.35)',
                  }}
                >
                  {loading ? 'Saving…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <Toast toast={toast} />
    </>
  );
}