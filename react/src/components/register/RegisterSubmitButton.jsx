import { useRef } from 'react';

export default function RegisterSubmitButton({ loading }) {
  const btnRef = useRef(null);

  function handleRipple(e) {
    const btn = btnRef.current;
    if (!btn) return;
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }

  return (
    <div className="flex flex-col gap-[12px] mt-1">
      <button
        ref={btnRef}
        type="submit"
        disabled={loading}
        onClick={handleRipple}
        className={`login-btn-signin${loading ? ' loading' : ''}`}
      >
        <span className="btn-text">CREATE ACCOUNT</span>
        <span className="spinner" />
      </button>

      <div className="text-center text-[0.8rem] text-[rgba(13,31,26,0.45)]">
        Already have an account?{' '}
        <a href="/login" className="text-[#1abc9c] no-underline font-semibold hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}