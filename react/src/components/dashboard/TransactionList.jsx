function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatAmount(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP',
  }).format(amount);
}

export default function TransactionList({ transactions = [] }) {
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
          Transactions
        </h3>
        <span className="font-koho text-[rgba(255,255,255,0.4)] text-[0.78rem]">
          Last {transactions.length}
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="px-6 py-10 text-center font-koho text-[rgba(255,255,255,0.35)] text-[0.88rem]">
          No transactions yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,188,156,0.08)' }}>
                {['#', 'Amount', 'Payment Method', 'Date'].map(h => (
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
              {transactions.map((t) => (
                <tr
                  key={t.transaction_id}
                  className="transition-colors duration-150 hover:bg-[rgba(26,188,156,0.03)]"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="px-6 py-4 font-koho text-[rgba(255,255,255,0.35)] text-[0.82rem]">
                    #{t.transaction_id}
                  </td>
                  <td className="px-6 py-4 font-koho text-teal font-semibold text-[0.9rem]">
                    {formatAmount(t.total_amount)}
                  </td>
                  <td className="px-6 py-4 font-koho text-[rgba(255,255,255,0.55)] text-[0.85rem] capitalize">
                    {t.payment_method ?? '—'}
                  </td>
                  <td className="px-6 py-4 font-koho text-[rgba(255,255,255,0.4)] text-[0.82rem]">
                    {formatDate(t.transaction_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
