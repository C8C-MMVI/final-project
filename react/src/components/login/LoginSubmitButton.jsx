import { useRef } from 'react';

export default function LoginSubmitButton({ loading }) {
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
    <button
      ref={btnRef}
      type="submit"
      disabled={loading}
      onClick={handleRipple}
      className={[
        'relative overflow-hidden w-full mt-1',
        'py-[14px] border-none rounded-[10px]',
        'text-white font-rajdhani text-[1rem] font-bold tracking-[3px] uppercase',
        'cursor-pointer transition-[transform,box-shadow] duration-[150ms]',
        'shadow-[0_6px_24px_rgba(26,188,156,0.35)]',
        'hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(26,188,156,0.52)]',
        'active:translate-y-0',
        loading ? 'btn-loading' : '',
      ].join(' ')}
      style={{
        background: 'linear-gradient(90deg, #0ea882 0%, #1abc9c 100%)',
      }}
    >
      <span className="btn-text relative z-[1]">SIGN IN</span>
      <span className="spinner" />
    </button>
  );
}