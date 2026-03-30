export default function Toast({ toast }) {
  const base = [
    'fixed bottom-7 left-1/2 z-[999]',
    '-translate-x-1/2',
    'bg-[#142035]',
    'border border-[rgba(26,188,156,0.18)] border-l-[3px]',
    'rounded-[10px] px-[22px] py-[13px]',
    'text-[0.84rem] text-white whitespace-nowrap',
    'backdrop-blur-[14px]',
    'shadow-[0_8px_32px_rgba(0,0,0,0.45)]',
    'transition-all duration-300',
  ].join(' ');

  const shown   = 'translate-y-0 opacity-100';
  const hidden  = 'translate-y-20 opacity-0';
  const errorBorder = 'border-l-[#ff4f4f]';
  const tealBorder  = 'border-l-teal';

  return (
    <div
      id="toast"
      className={`
        ${base}
        ${toast?.show ? shown : hidden}
        ${toast?.isError ? errorBorder : tealBorder}
      `}
    >
      {toast?.message ?? ''}
    </div>
  );
}