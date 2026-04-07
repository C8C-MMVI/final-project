import { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import Panel    from '../components/shared/Panel';
import Badge    from '../components/shared/Badge';
import Icon     from '../components/shared/Icon';
import styles   from './Dashboard.module.css';
import cStyles  from './CustomerDashboard.module.css';

const STATUS_STEPS = ['Pending', 'In Progress', 'Completed'];

const statusLabel = {
  'Pending':     'pending',
  'In Progress': 'progress',
  'Completed':   'done',
};

export default function CustomerDashboard({ username, setPage }) {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [form,      setForm]      = useState({ device_type: '', issue_description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = () => {
    fetch('/api/dashboard.php', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d);
        else setError(d.message);
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.device_type || !form.issue_description) return;
    setSubmitting(true);
    try {
      const res  = await fetch('/api/repairs.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(form),
      });
      const result = await res.json();
      if (result.success) {
        showToast('✓ Repair request submitted!');
        setForm({ device_type: '', issue_description: '' });
        fetchData();
      } else {
        showToast('⚠ ' + result.message, true);
      }
    } catch {
      showToast('⚠ Cannot connect to server.', true);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = data?.stats;
  const repairs = data?.repairs ?? [];
  const transactions = data?.transactions ?? [];
  const latestRepair = data?.latest_repair ?? null;
  const stepIndex = latestRepair ? STATUS_STEPS.indexOf(latestRepair.status) : -1;

  const statCards = stats ? [
    { label: 'Active Repair',     value: stats.active_repairs.toString(),                              sub: 'In progress',  color: 'orange' },
    { label: 'Completed Repairs', value: stats.completed_repairs.toString(),                           sub: 'All time',     color: 'teal'   },
    { label: 'Total Spent',       value: `₱${Number(stats.total_spent).toLocaleString()}`,             sub: 'All time',     color: 'blue'   },
  ] : [];

  return (
    <main className={styles.content}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          padding: '12px 20px', marginBottom: '1rem', borderRadius: '8px',
          background: toast.isError ? '#fee2e2' : '#dcfce7',
          color:      toast.isError ? '#dc2626' : '#16a34a',
          fontWeight: 500, fontSize: '14px',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Greeting ── */}
      <div className={cStyles.greeting}>
        <div className={cStyles.greetingTitle}>
          Welcome back, <span className={cStyles.greetingName}>{username}</span>
        </div>
        <div className={cStyles.greetingSub}>
          Here's a summary of your repair requests and transactions.
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div style={{ padding: '1rem' }}>Loading dashboard…</div>
      ) : error ? (
        <div style={{ padding: '1rem', color: '#ef4444' }}>{error}</div>
      ) : (
        <div className={styles.cardsGrid}>
          {statCards.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      <div className={styles.twoCol}>

        {/* ── Submit Repair Request ── */}
        <Panel title="Submit Repair Request">
          <form className={cStyles.form} onSubmit={handleSubmit}>
            <div className={cStyles.formGroup}>
              <label className={cStyles.label}>Device Type</label>
              <input
                type="text"
                className={cStyles.input}
                placeholder="e.g. iPhone 14, Samsung A54…"
                value={form.device_type}
                onChange={e => setForm(f => ({ ...f, device_type: e.target.value }))}
                required
              />
            </div>
            <div className={cStyles.formGroup}>
              <label className={cStyles.label}>Issue Description</label>
              <textarea
                className={cStyles.textarea}
                placeholder="Describe the issue in detail…"
                value={form.issue_description}
                onChange={e => setForm(f => ({ ...f, issue_description: e.target.value }))}
                rows={4}
                required
              />
            </div>
            <button type="submit" className={cStyles.submitBtn} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </Panel>

        {/* ── Latest Repair Timeline ── */}
        <Panel title={latestRepair ? `Tracking Repair #${latestRepair.request_id}` : 'Track Repair'}>
          {!latestRepair ? (
            <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No active repair requests.</div>
          ) : (
            <div className={cStyles.timeline}>
              <div style={{ padding: '1rem 1rem 0' }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{latestRepair.device_type}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{latestRepair.issue_description}</div>
              </div>
              {STATUS_STEPS.map((step, i) => {
                const done    = i <= stepIndex;
                const active  = i === stepIndex;
                return (
                  <div key={step} className={cStyles.timelineItem}>
                    <div className={cStyles.timelineLeft}>
                      <div className={`${cStyles.timelineDot} ${active ? cStyles.active : done ? cStyles.done : ''}`}>
                        {done ? <Icon name="checkSmall" size={12} /> : <Icon name="dot" size={10} />}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`${cStyles.timelineLine} ${done ? cStyles.lineDone : ''}`} />
                      )}
                    </div>
                    <div className={cStyles.timelineContent}>
                      <div className={`${cStyles.timelineTitle} ${!done ? cStyles.titlePending : ''}`}>{step}</div>
                      <div className={cStyles.timelineSub}>{active ? 'In progress…' : done ? 'Done' : 'Waiting…'}</div>
                    </div>
                  </div>
                );
              })}
              {latestRepair.technician_notes && (
                <div style={{ padding: '0 1rem 1rem', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <strong>Tech notes:</strong> {latestRepair.technician_notes}
                </div>
              )}
            </div>
          )}
        </Panel>

      </div>

      {/* ── My Repair Requests ── */}
      <Panel title="My Repair Requests" onLink={() => setPage('repairs')} linkLabel="View all →" style={{ marginBottom: '1rem' }}>
        {loading ? (
          <div style={{ padding: '1rem' }}>Loading…</div>
        ) : repairs.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No repair requests yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Job #</th><th>Device</th><th>Issue</th><th>Shop</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {repairs.map(r => (
                <tr key={r.request_id}>
                  <td className={styles.idCol}>#{r.request_id}</td>
                  <td>{r.device_type}</td>
                  <td>{r.issue_description}</td>
                  <td>{r.shop_name}</td>
                  <td className={styles.muted}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td><Badge status={statusLabel[r.status] ?? 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* ── My Transactions ── */}
      <Panel title="My Transactions">
        {loading ? (
          <div style={{ padding: '1rem' }}>Loading…</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No transactions yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Ref #</th><th>Shop</th><th>Amount</th><th>Method</th><th>Date</th></tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.transaction_id}>
                  <td className={styles.idCol}>TXN-{t.transaction_id}</td>
                  <td>{t.shop_name}</td>
                  <td className={styles.bold}>₱{Number(t.total_amount).toLocaleString()}</td>
                  <td>{t.payment_method ?? '—'}</td>
                  <td className={styles.muted}>{new Date(t.transaction_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

    </main>
  );
}