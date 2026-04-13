const ICONS = {
  'Total Repairs': '🔧',
  'Pending':       '⏳',
  'In Progress':   '⚙️',
  'Completed':     '✅',
};

export default function QuickStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-2 p-5 rounded-[14px] transition-all duration-200 hover:-translate-y-[2px]"
          style={{
            background: 'rgba(10,22,44,0.6)',
            border: '1px solid rgba(26,188,156,0.12)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-koho text-[rgba(255,255,255,0.5)] text-[0.75rem] tracking-widest uppercase">
              {label}
            </span>
            <span className="text-[1.1rem]">{ICONS[label] ?? '📊'}</span>
          </div>
          <div
            className="font-rajdhani font-bold text-[2rem] leading-none"
            style={{
              background: 'linear-gradient(90deg, #1abc9c, #0ea882)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
