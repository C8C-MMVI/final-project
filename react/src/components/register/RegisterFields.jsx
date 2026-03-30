const inputBase = [
  'w-full py-[13px] pl-[16px] pr-[44px]',
  'bg-[rgba(255,255,255,0.06)]',
  'border border-[rgba(255,255,255,0.15)] rounded-[10px]',
  'text-white text-[0.91rem] font-inter',
  'outline-none',
  'placeholder:text-[rgba(255,255,255,0.28)]',
  'transition-[border-color,box-shadow,background] duration-[250ms]',
  'focus:border-teal focus:shadow-[0_0_0_3px_rgba(26,188,156,0.25)] focus:bg-[rgba(26,188,156,0.04)]',
].join(' ');

const labelClass = 'text-[0.7rem] font-semibold tracking-[2.5px] uppercase text-[rgba(255,255,255,0.7)]';

const STRENGTH_LEVELS = [
  { label: 'Too short', color: '#ff4f4f', pct: 10  },
  { label: 'Weak',      color: '#ff914d', pct: 30  },
  { label: 'Fair',      color: '#f1c40f', pct: 55  },
  { label: 'Good',      color: '#1abc9c', pct: 78  },
  { label: 'Strong',    color: '#1abc9c', pct: 100 },
];

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

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <span className="flex items-center gap-[5px] text-[0.74rem] text-[#ff4f4f]">
      ⚠ {msg}
    </span>
  );
}

function ToggleButton({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle password visibility"
      className="absolute right-[13px] top-1/2 -translate-y-1/2 bg-transparent border-none p-0 leading-none cursor-pointer text-[rgba(255,255,255,0.55)] hover:text-teal transition-colors duration-200"
    >
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

function inputStateClass(error, success) {
  if (error)   return 'border-[#ff4f4f] shadow-[0_0_0_3px_rgba(255,79,79,0.18)]';
  if (success) return 'border-teal';
  return '';
}

export default function RegisterFields({
  username, setUsername,
  phone, setPhone,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, togglePassword,
  showConfirmPassword, toggleConfirmPassword,
  strength,
  errors,
}) {
  const lvl = strength !== null ? STRENGTH_LEVELS[strength] : null;

  return (
    <>
      {/* Username */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="username" className={labelClass}>Username</label>
        <div className="relative">
          <input
            type="text" id="username" name="username"
            placeholder="Choose a username…" autoComplete="off"
            value={username} onChange={e => setUsername(e.target.value)}
            className={`${inputBase} ${inputStateClass(errors.username, username && !errors.username)}`}
          />
        </div>
        <FieldError msg={errors.username} />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="phone" className={labelClass}>Phone Number</label>
        <div className="relative">
          <input
            type="tel" id="phone" name="phone"
            placeholder="e.g. +63 912 345 6789…" autoComplete="off"
            value={phone} onChange={e => setPhone(e.target.value)}
            className={`${inputBase} ${inputStateClass(errors.phone, phone && !errors.phone)}`}
          />
        </div>
        <FieldError msg={errors.phone} />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="password" className={labelClass}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'} id="password" name="password"
            placeholder="Create a password…" autoComplete="new-password"
            value={password} onChange={e => setPassword(e.target.value)}
            className={`${inputBase} ${inputStateClass(errors.password, password && !errors.password)}`}
          />
          <ToggleButton show={showPassword} onToggle={togglePassword} />
        </div>

        {/* Strength bar */}
        {password && lvl && (
          <div className="flex flex-col gap-1 mt-[2px]">
            <div className="h-[3px] bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width,background] duration-[350ms]"
                style={{ width: `${lvl.pct}%`, background: lvl.color }}
              />
            </div>
            <span className="text-[11px]" style={{ color: lvl.color }}>{lvl.label}</span>
          </div>
        )}

        <FieldError msg={errors.password} />
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="confirm_password" className={labelClass}>Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'} id="confirm_password" name="confirm_password"
            placeholder="Repeat your password…" autoComplete="new-password"
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className={`${inputBase} ${inputStateClass(errors.confirmPassword, confirmPassword && !errors.confirmPassword)}`}
          />
          <ToggleButton show={showConfirmPassword} onToggle={toggleConfirmPassword} />
        </div>
        <FieldError msg={errors.confirmPassword} />
      </div>
    </>
  );
}
