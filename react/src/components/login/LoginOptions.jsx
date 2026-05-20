export default function LoginOptions({ remember, setRemember, onForgot }) {
  return (
    <div className="flex items-center justify-between -mt-1">
      <label
        className="flex items-center gap-[9px] text-[0.79rem] text-[rgba(13,31,26,0.5)] cursor-pointer select-none"
        onClick={() => setRemember(v => !v)}
      >
        <span
          className="flex items-center justify-center w-[16px] h-[16px] rounded-[4px] border-[1.5px] transition-[background,border-color] duration-200 flex-shrink-0"
          style={{
            background:  remember ? '#1abc9c' : 'transparent',
            borderColor: remember ? '#1abc9c' : 'rgba(13,31,26,0.2)',
          }}
        >
          <span style={{ fontSize: '11px', color: '#fff', opacity: remember ? 1 : 0, transition: 'opacity 0.2s' }}>✓</span>
        </span>
        Remember me
      </label>

      <a
        href="#"
        onClick={onForgot}
        className="text-[0.77rem] text-[#1abc9c] no-underline tracking-[0.5px] font-semibold transition-colors duration-200 hover:text-[#0aaa86]"
      >
        Forgot password?
      </a>
    </div>
  );
}