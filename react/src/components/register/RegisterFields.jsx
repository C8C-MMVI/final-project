import { useState } from 'react';
import TermsModal from '../shared/TermsModal';

const labelClass = 'text-[0.68rem] font-bold tracking-[2px] uppercase text-[rgba(13,31,26,0.5)]';

const inputBase = [
  'w-full py-[12px] pl-[16px] pr-[44px]',
  'bg-[rgba(13,31,26,0.03)]',
  'border border-[rgba(13,31,26,0.14)] rounded-[10px]',
  'text-[#0a1c16] text-[0.91rem]',
  'outline-none',
  'placeholder:text-[rgba(13,31,26,0.3)]',
  'transition-[border-color,box-shadow,background] duration-[220ms]',
  'focus:border-[#1abc9c] focus:shadow-[0_0_0_3px_rgba(26,188,156,0.2)] focus:bg-[rgba(26,188,156,0.03)]',
].join(' ');

const STRENGTH_LEVELS = [
  { label: 'Too short', color: '#ef4444', pct: 10  },
  { label: 'Weak',      color: '#f97316', pct: 30  },
  { label: 'Fair',      color: '#eab308', pct: 55  },
  { label: 'Good',      color: '#1abc9c', pct: 78  },
  { label: 'Strong',    color: '#0aaa86', pct: 100 },
];

function FieldError({ msg }) {
  if (!msg) return null;
  return <span className="flex items-center gap-[5px] text-[0.74rem] text-[#ef4444]">⚠ {msg}</span>;
}

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button" onClick={onToggle}
      aria-label="Toggle password visibility"
      className="absolute right-[13px] top-1/2 -translate-y-1/2 bg-transparent border-none p-0 leading-none cursor-pointer text-[rgba(13,31,26,0.35)] hover:text-[#1abc9c] transition-colors duration-200"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: show ? 'none' : 'block' }}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: show ? 'block' : 'none' }}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    </button>
  );
}

function inputStateClass(error, success) {
  if (error)   return 'border-[#ef4444] shadow-[0_0_0_3px_rgba(239,68,68,0.1)]';
  if (success) return 'border-[#1abc9c]';
  return '';
}

export default function RegisterFields({
  username, setUsername,
  email, setEmail,
  phone, setPhone,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, togglePassword,
  showConfirmPassword, toggleConfirmPassword,
  strength, errors,
  // T&C props
  termsAccepted, setTermsAccepted,
}) {
  const lvl = strength !== null ? STRENGTH_LEVELS[strength] : null;
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  return (
    <>
      {/* Username */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="username" className={labelClass}>Username</label>
        <div className="relative">
          <input type="text" id="username" placeholder="Choose a username…" autoComplete="off"
            value={username} onChange={e => setUsername(e.target.value)}
            className={`${inputBase} ${inputStateClass(errors.username, username && !errors.username)}`}
          />
        </div>
        <FieldError msg={errors.username} />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="email" className={labelClass}>Email Address</label>
        <div className="relative">
          <input type="email" id="email" placeholder="you@example.com…" autoComplete="off"
            value={email} onChange={e => setEmail(e.target.value)}
            className={`${inputBase} ${inputStateClass(errors.email, email && !errors.email)}`}
          />
        </div>
        <FieldError msg={errors.email} />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="phone" className={labelClass}>Phone Number</label>
        <div className="relative">
          <input type="tel" id="phone" placeholder="e.g. +63 912 345 6789…" autoComplete="off"
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
          <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Create a password…" autoComplete="new-password"
            value={password} onChange={e => setPassword(e.target.value)}
            className={`${inputBase} ${inputStateClass(errors.password, password && !errors.password)}`}
          />
          <EyeToggle show={showPassword} onToggle={togglePassword} />
        </div>
        {password && lvl && (
          <div className="flex flex-col gap-1 mt-[2px]">
            <div className="h-[3px] bg-[rgba(13,31,26,0.08)] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-[width,background] duration-[350ms]"
                style={{ width: `${lvl.pct}%`, background: lvl.color }} />
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
          <input type={showConfirmPassword ? 'text' : 'password'} id="confirm_password" placeholder="Repeat your password…" autoComplete="new-password"
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            className={`${inputBase} ${inputStateClass(errors.confirmPassword, confirmPassword && !errors.confirmPassword)}`}
          />
          <EyeToggle show={showConfirmPassword} onToggle={toggleConfirmPassword} />
        </div>
        <FieldError msg={errors.confirmPassword} />
      </div>

      {/* ── Terms & Conditions ── */}
      <div className="flex flex-col gap-[6px] pt-[2px] items-center">
      <label
  htmlFor="terms_accepted"
  className="flex items-start gap-[10px] cursor-pointer select-none"
>
          {/* Custom checkbox */}
          <div className="relative mt-[1px] flex-shrink-0">
            <input
              type="checkbox"
              id="terms_accepted"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="sr-only"
            />
            <div
              className={[
                'w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center',
                'transition-[border-color,background] duration-[180ms]',
                termsAccepted
                  ? 'border-[#1abc9c] bg-[#1abc9c]'
                  : 'border-[rgba(13,31,26,0.25)] bg-white',
              ].join(' ')}
            >
              {termsAccepted && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>

          {/* Label text */}
          <span className="text-[0.82rem] text-[rgba(13,31,26,0.7)] leading-[1.5]">
            I have read and agree to the{' '}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setTermsModalOpen(true); }}
              className="text-[#1abc9c] font-semibold underline underline-offset-2 hover:text-[#0aaa86] transition-colors duration-150 cursor-pointer bg-transparent border-none p-0"
            >
              Terms &amp; Conditions
            </button>
          </span>
        </label>

        <FieldError msg={errors.termsAccepted} />
      </div>

      {/* T&C Modal */}
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
    </>
  );
}