const labelClass = 'text-[0.68rem] font-bold tracking-[2px] uppercase text-[rgba(13,31,26,0.5)] font-[Orbitron]';

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

const inputError = 'border-[#ef4444] shadow-[0_0_0_3px_rgba(239,68,68,0.1)]';

export default function LoginFields({ username, setUsername, password, setPassword, showPassword, togglePassword, errors }) {
  return (
    <>
      {/* Username */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="username" className={labelClass}>Username</label>
        <div className="relative">
          <input
            type="text" id="username" name="username"
            placeholder="Enter your username…"
            autoComplete="off"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className={`${inputBase} ${errors.username ? inputError : ''}`}
          />
        </div>
        {errors.username && (
          <span className="flex items-center gap-[5px] text-[0.74rem] text-[#ef4444]">⚠ Username is required.</span>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-[7px]">
        <label htmlFor="password" className={labelClass}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'} id="password" name="password"
            placeholder="Enter your password…"
            autoComplete="off"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`${inputBase} ${errors.password ? inputError : ''}`}
          />
          <button
            type="button" onClick={togglePassword}
            aria-label="Toggle password visibility"
            className="absolute right-[13px] top-1/2 -translate-y-1/2 bg-transparent border-none p-0 leading-none cursor-pointer text-[rgba(13,31,26,0.35)] hover:text-[#1abc9c] transition-colors duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: showPassword ? 'none' : 'block' }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: showPassword ? 'block' : 'none' }}>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
        {errors.password && (
          <span className="flex items-center gap-[5px] text-[0.74rem] text-[#ef4444]">⚠ Password is required.</span>
        )}
      </div>
    </>
  );
}