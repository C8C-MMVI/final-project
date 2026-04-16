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
  if (!open) return null;

  const inputBase = [
    'w-full py-[13px] px-[16px]',
    'bg-[rgba(255,255,255,0.06)]',
    'border border-[rgba(255,255,255,0.15)] rounded-[10px]',
    'text-white text-[0.91rem]',
    'outline-none',
    'placeholder:text-[rgba(255,255,255,0.28)]',
    'transition-[border-color,box-shadow,background] duration-[250ms]',
    'focus:border-teal focus:shadow-[0_0_0_3px_rgba(26,188,156,0.25)] focus:bg-[rgba(26,188,156,0.04)]',
    emailError ? 'border-[#ff4f4f] shadow-[0_0_0_3px_rgba(255,79,79,0.18)]' : '',
  ].join(' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-[18px] border border-[rgba(26,188,156,0.22)] p-[36px]"
        style={{ background: 'rgba(10,22,44,0.97)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[14px] right-[16px] text-[rgba(255,255,255,0.4)] hover:text-white transition-colors text-[1.3rem] leading-none bg-transparent border-none cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        {!sent ? (
          <>
            <h2 className="text-white text-[1.25rem] font-bold mb-[6px]">Reset Password</h2>
            <p className="text-[rgba(255,255,255,0.5)] text-[0.84rem] mb-[24px]">
              Enter your registered email address and we'll send you a reset link.
            </p>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[14px]">
              <div className="flex flex-col gap-[7px]">
                <label className="text-[0.7rem] font-semibold tracking-[2.5px] uppercase text-[rgba(255,255,255,0.7)]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com…"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputBase}
                  autoFocus
                />
                {emailError && (
                  <span className="flex items-center gap-[5px] text-[0.74rem] text-[#ff4f4f]">
                    ⚠ {emailError}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-[13px] rounded-[10px] font-semibold text-[0.92rem] text-white transition-all duration-200 cursor-pointer border-none"
                style={{
                  background: loading
                    ? 'rgba(26,188,156,0.5)'
                    : 'linear-gradient(135deg,#1abc9c,#16a085)',
                  boxShadow: loading ? 'none' : '0 4px 18px rgba(26,188,156,0.35)',
                }}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="flex flex-col items-center text-center gap-[14px] py-[10px]">
            <div className="text-[2.5rem]">📧</div>
            <h2 className="text-white text-[1.2rem] font-bold">Check your inbox</h2>
            <p className="text-[rgba(255,255,255,0.5)] text-[0.84rem] leading-relaxed">
              If <span className="text-teal">{email}</span> is registered, you'll receive a
              password reset link shortly. Check your spam folder if you don't see it.
            </p>
            <p className="text-[rgba(255,255,255,0.3)] text-[0.75rem]">
              (Testing locally? View the email at{' '}
              <a
                href="http://localhost:8025"
                target="_blank"
                rel="noreferrer"
                className="text-teal no-underline hover:text-white transition-colors"
              >
                localhost:8025
              </a>
              )
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-[6px] text-[0.82rem] text-teal underline bg-transparent border-none cursor-pointer hover:text-white transition-colors"
            >
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
  } = useLogin({ onLogin });

  return (
    <>
      <Background />

      <div className="relative z-[2] flex items-center justify-center min-h-screen p-6">
        <div
          className="grid grid-cols-2 w-full max-w-[1412px] overflow-hidden rounded-[22px] border border-[rgba(26,188,156,0.18)] backdrop-blur-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(26,188,156,0.06)_inset]"
          style={{
            height: 'min(858px, 90vh)',
            background: 'rgba(10,22,44,0.85)',
            animation: 'fadeUp 0.7s cubic-bezier(.22,.68,0,1.2) both',
          }}
        >
          <LeftPanel logoSrc="/images/Logo.png" />

          <div className="flex flex-col justify-center px-[clamp(28px,4vw,50px)] py-[clamp(32px,6vh,60px)]">
            <div className="text-[clamp(1.4rem,2.5vw,2rem)] font-bold mb-[5px] text-white">
              Welcome Back
            </div>
            <div className="text-[0.87rem] text-[rgba(255,255,255,0.55)] mb-[clamp(18px,3vh,34px)]">
              Sign in to continue
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate autoComplete="off">
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