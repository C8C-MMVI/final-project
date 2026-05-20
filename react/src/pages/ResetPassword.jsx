import { useState, useEffect } from 'react';
import '../assets/css/auth.css';
import Background from '../components/shared/Background';
import Toast from '../components/shared/Toast';
import { useResetPassword } from '../assets/js/useResetPassword';

/* ── Password strength bar ──────────────────────────────────────────────────── */
const strengthConfig = [
  { label: 'Too short', color: '#ef4444' },
  { label: 'Weak',      color: '#f97316' },
  { label: 'Fair',      color: '#eab308' },
  { label: 'Good',      color: '#84cc16' },
  { label: 'Strong',    color: '#1abc9c' },
];

function StrengthBar({ value }) {
  const cfg = strengthConfig[value] ?? strengthConfig[0];
  return (
    <div style={{ marginTop: 7 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= value ? cfg.color : 'var(--input-border)',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: 600 }}>
        {cfg.label}
      </span>
    </div>
  );
}

/* ── Eye icons ──────────────────────────────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Main component
═══════════════════════════════════════════════════════════════════════════════ */
export default function ResetPassword() {
  const {
    token,
    password,      setPassword,
    confirm,       setConfirm,
    errors,
    loading,
    success,
    serverMessage,
    strength,
    handleSubmit,
  } = useResetPassword();

  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast,       setToast]       = useState(null);

  /* ── Token validation ────────────────────────────────────────────────────── */
  // null = checking | true = valid | false = invalid/expired/missing
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }

    let cancelled = false;

    fetch(`/api/reset_password.php?token=${encodeURIComponent(token)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (!cancelled) {
          console.log('[ResetPassword] token check:', data);
          setTokenValid(data.valid === true);
        }
      })
      .catch(err => {
        console.error('[ResetPassword] token check failed:', err);
        if (!cancelled) setTokenValid(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  /* ── Toast on server response ────────────────────────────────────────────── */
  useEffect(() => {
    if (!serverMessage) return;

    if (success) {
      setToast({ message: '✓ ' + serverMessage, isError: false, show: true });
      const t1 = setTimeout(() => {
        setToast(prev => prev ? { ...prev, show: false } : null);
        setTimeout(() => { window.location.href = '/login'; }, 400);
      }, 2000);
      return () => clearTimeout(t1);
    } else {
      setToast({ message: '⚠ ' + serverMessage, isError: true, show: true });
      const t2 = setTimeout(
        () => setToast(prev => prev ? { ...prev, show: false } : null),
        3500,
      );
      return () => clearTimeout(t2);
    }
  }, [serverMessage, success]);

  /* ── Shared card wrapper ─────────────────────────────────────────────────── */
  const card = {
    width: '100%',
    maxWidth: 460,
    background: '#fff',
    border: '1px solid var(--card-border)',
    borderRadius: 22,
    padding: 'clamp(32px,4vw,48px) clamp(28px,4vw,44px)',
    boxShadow: '0 16px 64px rgba(13,31,26,0.1)',
    animation: 'fadeUp 0.6s cubic-bezier(.22,.68,0,1.2) both',
  };

  return (
    <>
      <Background />

      <div className="login-page">
        <div style={card}>

          {/* ── Verifying ── */}
          {tokenValid === null && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: 32, height: 32, margin: '0 auto 16px',
                border: '3px solid var(--teal-glow)',
                borderTopColor: 'var(--teal)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p className="login-welcome-sub" style={{ margin: 0 }}>
                Verifying reset link…
              </p>
            </div>
          )}

          {/* ── Invalid / expired ── */}
          {tokenValid === false && (
            <div className="login-modal-success" style={{ padding: '10px 0', gap: 14 }}>
              <div className="login-modal-success-icon">⛔</div>

              <div className="login-modal-title">Link Invalid or Expired</div>

              <p className="login-modal-sub">
                This password reset link is no longer valid. Reset links expire after
                1 hour and can only be used once.
              </p>

              <a
                href="/forgot-password"
                className="login-btn-signin"
                style={{
                  display: 'block', textAlign: 'center',
                  textDecoration: 'none', marginTop: 4,
                  padding: '12px 24px', borderRadius: 10,
                }}
              >
                Request New Link
              </a>

              <div className="login-register" style={{ marginTop: 8 }}>
                <a href="/login">← Back to Login</a>
              </div>
            </div>
          )}

          {/* ── Success ── */}
          {tokenValid === true && success && (
            <div className="login-modal-success" style={{ padding: '10px 0', gap: 14 }}>
              <div className="login-modal-success-icon">✅</div>

              <div className="login-modal-title">Password Updated!</div>

              <p className="login-modal-sub">
                Your password has been reset successfully. Redirecting you to login…
              </p>

              <div className="login-register" style={{ marginTop: 8 }}>
                <a href="/login">Go to Login →</a>
              </div>
            </div>
          )}

          {/* ── Reset form ── */}
          {tokenValid === true && !success && (
            <>
              <div className="login-modal-icon" style={{ marginBottom: 20 }}>🔐</div>

              <div className="login-welcome" style={{ fontSize: '1.6rem', marginBottom: 6 }}>
                Set New Password
              </div>
              <div className="login-welcome-sub" style={{ marginBottom: 28 }}>
                Choose a strong password for your account.
              </div>

              <form onSubmit={handleSubmit} noValidate className="login-form">

                {/* New Password */}
                <div className="login-field">
                  <label>New Password</label>
                  <div className="login-input-wrap">
                    <input
                      id="rp-password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="At least 8 characters…"
                      autoComplete="new-password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={errors.password ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      className="login-toggle-pw"
                      onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && <StrengthBar value={strength} />}

                  {errors.password && (
                    <span className="login-field-error show">⚠ {errors.password}</span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="login-field">
                  <label>Confirm Password</label>
                  <div className="login-input-wrap">
                    <input
                      id="rp-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password…"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={errors.confirm ? 'input-error' : ''}
                    />
                    <button
                      type="button"
                      className="login-toggle-pw"
                      onClick={() => setShowConfirm(v => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {/* Live match indicator */}
                  {confirm.length > 0 && !errors.confirm && confirm === password && (
                    <span style={{
                      fontSize: '0.72rem', color: 'var(--teal)',
                      fontWeight: 600, marginTop: 5, display: 'block',
                    }}>
                      ✓ Passwords match
                    </span>
                  )}
                  {errors.confirm && (
                    <span className="login-field-error show">⚠ {errors.confirm}</span>
                  )}
                </div>

                {/* Server-level error banner */}
                {serverMessage && !success && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.18)',
                    fontSize: '0.8rem', color: 'var(--error)', lineHeight: 1.5,
                  }}>
                    ⚠ {serverMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`login-btn-signin${loading ? ' btn-loading' : ''}`}
                >
                  <span className="btn-text">{loading ? 'Saving…' : 'Reset Password'}</span>
                  <span className="spinner" />
                </button>

                <div className="login-register" style={{ marginTop: 4 }}>
                  <a href="/login">← Back to Login</a>
                </div>
              </form>
            </>
          )}

        </div>
      </div>

      <Toast toast={toast} />
    </>
  );
}