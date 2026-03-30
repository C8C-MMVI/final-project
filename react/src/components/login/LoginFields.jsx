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

const inputError = 'border-[#ff4f4f] shadow-[0_0_0_3px_rgba(255,79,79,0.18)]';

const labelClass = 'text-[0.7rem] font-semibold tracking-[2.5px] uppercase text-[rgba(255,255,255,0.7)]';

export default function LoginFields({
  username, setUsername,
  password, setPassword,
  showPassword, togglePassword,
  errors,
}) {
  return (
    <>
      {/* Username */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="username" className={labelClass}>Username</label>
        <div className="relative">
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username…"
            autoComplete="off"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className={`${inputBase} ${errors.username ? inputError : ''}`}
          />
        </div>
        {errors.username && (
          <span className="flex items-center gap-[5px] text-[0.74rem] text-[#ff4f4f]">
            ⚠ Username is required.
          </span>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="password" className={labelClass}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Enter your password…"
            autoComplete="off"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`${inputBase} ${errors.password ? inputError : ''}`}
          />
          <button
            type="button"
            onClick={togglePassword}
            aria-label="Toggle password visibility"
            className="absolute right-[13px] top-1/2 -translate-y-1/2 bg-transparent border-none p-0 leading-none cursor-pointer text-[rgba(255,255,255,0.55)] hover:text-teal transition-colors duration-200"
          >
            {/* Eye */}
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ display: showPassword ? 'none' : 'block' }}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {/* Eye-off */}
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ display: showPassword ? 'block' : 'none' }}
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>
        {errors.password && (
          <span className="flex items-center gap-[5px] text-[0.74rem] text-[#ff4f4f]">
            ⚠ Password is required.
          </span>
        )}
      </div>
    </>
  );
}