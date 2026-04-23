import '../assets/css/login.css';

import Background from '../components/shared/Background';
import LeftPanel from '../components/shared/LeftPanel';
import Toast from '../components/shared/Toast';
import LoginFields from '../components/login/LoginFields';
import LoginOptions from '../components/login/LoginOptions';
import LoginSubmitButton from '../components/login/LoginSubmitButton';
import LoginFooter from '../components/login/LoginFooter';
import { useLogin } from '../assets/js/useLogin';

/* ── Forgot Password Modal ─────────────────────────────────────────────────── */
function ForgotPasswordModal({
  open, onClose,
  email, setEmail,
  emailError,
  loading,
  sent,
  onSubmit,
}) {
  return (
    <div
      className={`login-modal-overlay${open ? ' show' : ''}`}
      onClick={onClose}
    >
      <div
        className="login-modal-card"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          className="login-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {!sent ? (
          <>
            <div className="login-modal-icon">🔑</div>
            <h2 className="login-modal-title">Reset Password</h2>
            <p className="login-modal-sub">
              Enter your registered email address and we'll send you a reset link.
            </p>

            <form onSubmit={onSubmit} noValidate className="login-form">
              <div className="login-field">
                <label>Email Address</label>
                <div className="login-input-wrap">
                  <input
                    type="email"
                    placeholder="you@example.com…"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={emailError ? 'input-error' : ''}
                    autoFocus
                  />
                </div>
                {emailError && (
                  <span className="login-field-error show">⚠ {emailError}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`login-btn-signin${loading ? ' loading' : ''}`}
              >
                <span className="btn-text">
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </span>
                <span className="spinner" />
              </button>
            </form>
          </>
        ) : (
          <div className="login-modal-success">
            <div className="login-modal-success-icon">📧</div>
            <h2 className="login-modal-title">Check your inbox</h2>
            <p className="login-modal-sub">
              If <span className="login-modal-email-highlight">{email}</span> is registered,
              you'll receive a password reset link shortly. Check your spam folder if
              you don't see it.
            </p>
            <p className="login-modal-local-note">
              (Testing locally? View the email at{' '}
              <a href="http://localhost:8025" target="_blank" rel="noreferrer">
                localhost:8025
              </a>
              )
            </p>
            <button type="button" onClick={onClose} className="login-forgot login-modal-back-btn">
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Login Page ────────────────────────────────────────────────────────────── */
export default function Login({ onLogin }) {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, togglePassword,
    remember, setRemember,
    errors,
    loading,
    handleSubmit,
    handleForgot,
    toast,
    forgotOpen,
    closeForgot,
    forgotEmail,      setForgotEmail,
    forgotLoading,
    forgotEmailError,
    forgotSent,
    handleForgotSubmit,
    googleLogin,
  } = useLogin({ onLogin });

  return (
    <>
      <Background />

      <div className="login-page">
        <div className="login-container">

          {/* ── Left Panel ── */}
          <LeftPanel logoSrc="/images/Logo.png" />

          {/* ── Right Panel ── */}
          <div className="login-right">
            <div className="login-welcome">Welcome Back</div>
            <div className="login-welcome-sub">Sign in to continue</div>

            <form className="login-form" onSubmit={handleSubmit} noValidate autoComplete="off">
              <LoginFields
                username={username} setUsername={setUsername}
                password={password} setPassword={setPassword}
                showPassword={showPassword} togglePassword={togglePassword}
                errors={errors}
              />
              <LoginOptions
                remember={remember} setRemember={setRemember}
                onForgot={handleForgot}
              />
              <LoginSubmitButton loading={loading} />

              {/* ── Google Login Divider ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '12px 0',
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  or sign in with
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* ── Google Button ── */}
              <button
                type="button"
                onClick={() => googleLogin()}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  background: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#3c4043',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.15)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  width="20"
                  height="20"
                  alt="Google"
                />
                Continue with Google
              </button>

              <LoginFooter />
            </form>
          </div>

        </div>
      </div>

      <Toast toast={toast} />

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={closeForgot}
        email={forgotEmail}
        setEmail={setForgotEmail}
        emailError={forgotEmailError}
        loading={forgotLoading}
        sent={forgotSent}
        onSubmit={handleForgotSubmit}
      />
    </>
  );
}