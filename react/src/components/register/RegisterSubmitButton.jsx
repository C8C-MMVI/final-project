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
    <div className="flex flex-col gap-[14px] mt-1">
      <button
        ref={btnRef}
        type="submit"
        disabled={loading}
        onClick={handleRipple}
        className={[
          'relative overflow-hidden w-full',
          'py-[14px] border-none rounded-[10px]',
          'text-white font-rajdhani text-[1rem] font-bold tracking-[3px] uppercase',
          'cursor-pointer transition-[transform,box-shadow] duration-[150ms]',
          'shadow-[0_6px_24px_rgba(26,188,156,0.35)]',
          'hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(26,188,156,0.52)]',
          'active:translate-y-0',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none',
          loading ? 'btn-loading' : '',
        ].join(' ')}
        style={{ background: 'linear-gradient(90deg, #0ea882 0%, #1abc9c 100%)' }}
      >
        <span className="btn-text relative z-[1]">CREATE ACCOUNT</span>
        <span className="spinner" />
      </button>

      <div className="text-center text-[0.8rem] text-[rgba(255,255,255,0.55)]">
        Already have an account?{' '}
        <a href="/login" className="text-teal no-underline font-semibold hover:underline">
          Sign in
        </a>
      </div>
    </div>
  );
}
