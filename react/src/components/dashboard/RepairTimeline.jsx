const STATUS_COLORS = {
  Pending:     { color: 'rgba(255,255,255,0.5)',  bg: 'rgba(255,255,255,0.07)' },
  'In Progress': { color: '#f1c40f',              bg: 'rgba(241,196,15,0.1)'   },
  Completed:   { color: '#1abc9c',                bg: 'rgba(26,188,156,0.1)'   },
};

export default function RepairTimeline({ timeline = [], currentRepair }) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-[16px]"
      style={{
        background: 'rgba(10,22,44,0.6)',
        border: '1px solid rgba(26,188,156,0.12)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h3 className="font-koho font-bold text-white text-[1rem] tracking-wide">
        Latest Repair Status
      </h3>

      {/* Device info */}
      {currentRepair ? (
        <div className="flex flex-col gap-1 pb-4 border-b border-[rgba(26,188,156,0.1)]">
          <p className="font-koho text-white font-semibold text-[0.95rem]">
            {currentRepair.device_type}
          </p>
          <p className="font-koho text-[rgba(255,255,255,0.5)] text-[0.82rem]">
            {currentRepair.issue_description}
          </p>
        </div>
      ) : (
        <p className="font-koho text-[rgba(255,255,255,0.4)] text-[0.85rem]">
          No active repair requests.
        </p>
      )}

      {/* Stepper */}
      {timeline.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          {timeline.map(({ label, done, active }, i) => {
            const { color, bg } = STATUS_COLORS[label] ?? STATUS_COLORS['Pending'];
            return (
              <div key={label} className="flex items-center gap-3">
                {/* Circle */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[0.75rem] font-bold flex-shrink-0 transition-all duration-300"
                  style={{
                    background: done ? 'linear-gradient(135deg, #0ea882, #1abc9c)' : 'rgba(255,255,255,0.07)',
                    border: active ? '2px solid #1abc9c' : done ? 'none' : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: active ? '0 0 12px rgba(26,188,156,0.5)' : 'none',
                    color: done ? 'white' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {done ? '✓' : i + 1}
                </div>

                {/* Label */}
                <div className="flex items-center gap-2">
                  <span
                    className="font-koho text-[0.85rem] font-medium"
                    style={{ color: done ? color : 'rgba(255,255,255,0.4)' }}
                  >
                    {label}
                  </span>
                  {active && (
                    <span
                      className="px-2 py-[2px] rounded-full text-[0.68rem] font-koho font-semibold"
                      style={{ background: bg, color }}
                    >
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Technician notes */}
      {currentRepair?.technician_notes && (
        <div
          className="mt-2 p-3 rounded-[10px] border-l-4"
          style={{ background: 'rgba(26,188,156,0.06)', borderColor: '#1abc9c' }}
        >
          <p className="font-koho text-[0.7rem] text-teal tracking-widest uppercase mb-1">
            Technician Notes
          </p>
          <p className="font-koho text-[rgba(255,255,255,0.65)] text-[0.83rem] leading-relaxed">
            {currentRepair.technician_notes}
          </p>
        </div>
      )}
    </div>
  );
}
