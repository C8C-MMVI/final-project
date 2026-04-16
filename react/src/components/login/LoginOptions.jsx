export default function LoginOptions({ remember, setRemember, onForgot }) {
  return (
    <div className="flex items-center justify-between -mt-1">

      {/* Remember me — clicking the whole label toggles state */}
      <label
        className="remember flex items-center gap-[9px] text-[0.79rem] text-[rgba(255,255,255,0.55)] cursor-pointer select-none"
        onClick={() => setRemember(v => !v)}
      >
        {/* Custom checkbox driven by `remember` prop instead of hidden input */}
        <span
          className="check-box"
          style={{
            background:   remember ? '#1abc9c' : undefined,
            borderColor:  remember ? '#1abc9c' : undefined,
          }}
        >
          {/* Inline tick so we don't rely on the CSS sibling selector at all */}
          <span style={{
            fontSize: '11px',
            color: 'white',
            opacity: remember ? 1 : 0,
            transition: 'opacity 0.2s',
          }}>
            ✓
          </span>
        </span>
        Remember me
      </label>

      {/* Forgot password */}
      <a
        href="#"
        onClick={onForgot}
        className="text-[0.77rem] text-teal no-underline tracking-[0.5px] font-medium transition-[color,text-shadow] duration-200 hover:text-white hover:shadow-[0_0_10px_#1abc9c]"
      >
        FORGOT PASSWORD?
      </a>

    </div>
  );
}