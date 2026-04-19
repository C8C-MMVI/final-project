const STATUS_STYLE = {
  Pending:       { color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)' },
  'In Progress': { color: '#f1c40f',               bg: 'rgba(241,196,15,0.1)',   border: 'rgba(241,196,15,0.3)'  },
  Completed:     { color: '#1abc9c',               bg: 'rgba(26,188,156,0.1)',   border: 'rgba(26,188,156,0.3)'  },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function RepairList({ repairs = [] }) {
  return (
    <div
      className="flex flex-col rounded-[16px] overflow-hidden mb-6"
      style={{
        background: 'rgba(10,22,44,0.6)',
        border: '1px solid rgba(26,188,156,0.12)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(26,188,156,0.1)]">
        <h3 className="font-koho font-bold text-white text-[1rem] tracking-wide">
          Repair Requests
        </h3>
        <span className="font-koho text-[rgba(255,255,255,0.4)] text-[0.78rem]">
          {repairs.length} total
        </span>
      </div>

      {/* Table */}
      {repairs.length === 0 ? (
        <div className="px-6 py-10 text-center font-koho text-[rgba(255,255,255,0.35)] text-[0.88rem]">
          No repair requests yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,188,156,0.08)' }}>
                {['#', 'Device', 'Issue', 'Technician', 'Status', 'Date'].map(h => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left font-koho text-[0.72rem] tracking-widest uppercase"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repairs.map((r, i) => {
                const s = STATUS_STYLE[r.status] ?? STATUS_STYLE['Pending'];
                return (
                  <tr
                    key={r.request_id}
                    className="transition-colors duration-150 hover:bg-[rgba(26,188,156,0.03)]"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-6 py-4 font-koho text-[rgba(255,255,255,0.35)] text-[0.82rem]">
                      #{r.request_id}
                    </td>
                    <td className="px-6 py-4 font-koho text-white text-[0.88rem] font-medium">
                      {r.device_type}
                    </td>
                    <td className="px-6 py-4 font-koho text-[rgba(255,255,255,0.55)] text-[0.85rem] max-w-[200px] truncate">
                      {r.issue_description}
                    </td>
                    <td className="px-6 py-4 font-koho text-[rgba(255,255,255,0.55)] text-[0.85rem]">
                      {r.technician_name ?? '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-[0.72rem] font-koho font-semibold tracking-wide"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-koho text-[rgba(255,255,255,0.4)] text-[0.82rem]">
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
