export default function LoginOptions({ remember, setRemember, onForgot }) {
  return (
    <div className="flex items-center justify-between -mt-1">

      {/* Remember me */}
      <label className="remember flex items-center gap-[9px] text-[0.79rem] text-[rgba(255,255,255,0.55)] cursor-pointer select-none">
        <input
          type="checkbox"
          className="hidden"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
        />
        <span className="check-box" />
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