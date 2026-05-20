import '../assets/css/auth.css';
import Background from '../components/shared/Background';
import useForgotPassword from '../assets/js/useForgotPassword';

export default function ForgotPassword() {
  const { email, setEmail, loading, sent, error, handleSubmit, reset } = useForgotPassword();

  return (
    <>
      <Background />

      <div className="login-page">
        <div style={{
          width: '100%',
          maxWidth: 460,
          background: '#fff',
          border: '1px solid var(--card-border)',
          borderRadius: 22,
          padding: 'clamp(32px,4vw,48px) clamp(28px,4vw,44px)',
          boxShadow: '0 16px 64px rgba(13,31,26,0.1)',
          animation: 'fadeUp 0.6s cubic-bezier(.22,.68,0,1.2) both',
        }}>

          {!sent ? (
            /* ── Request form ── */
            <>
              {/* Icon badge — matches login-modal-icon style */}
              <div className="login-modal-icon" style={{ marginBottom: 20 }}>🔑</div>

              <div className="login-welcome" style={{ fontSize: '1.6rem', marginBottom: 6 }}>
                Forgot Password?
              </div>
              <div className="login-welcome-sub" style={{ marginBottom: 28 }}>
                Enter your registered email and we'll send you a reset link valid for 1 hour.
              </div>

              <form onSubmit={handleSubmit} noValidate className="login-form">
                <div className="login-field">
                  <label>Email Address</label>
                  <div className="login-input-wrap">
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={error ? 'input-error' : ''}
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                  {error && (
                    <span className="login-field-error show">⚠ {error}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`login-btn-signin${loading ? ' btn-loading' : ''}`}
                >
                  <span className="btn-text">
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </span>
                  <span className="spinner" />
                </button>
              </form>

              <div className="login-register" style={{ marginTop: 20 }}>
                Remembered it?{' '}
                <a href="/login">Back to Login</a>
              </div>
            </>
          ) : (
            /* ── Success state ── */
            <div className="login-modal-success" style={{ padding: '10px 0' }}>
              <div className="login-modal-success-icon">📧</div>

              <div className="login-modal-title">Check Your Inbox</div>

              <p className="login-modal-sub">
                If <span className="login-modal-email-highlight">{email}</span> is linked
                to an account, you'll receive a reset link shortly. Check your spam folder
                if you don't see it.
              </p>

              <p className="login-modal-local-note">
                Testing locally? View the email at{' '}
                <a href="http://localhost:8025" target="_blank" rel="noreferrer">
                  localhost:8025
                </a>
              </p>

              <button
                type="button"
                onClick={reset}
                className="login-modal-back-btn"
                style={{ marginTop: 4 }}
              >
                Try a different email
              </button>

              <div className="login-register" style={{ marginTop: 16 }}>
                <a href="/login">← Back to Login</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}