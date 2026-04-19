// src/pages/CustomerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/dashboard/StatCard';
import Panel    from '../components/shared/Panel';
import Badge    from '../components/shared/Badge';
import cStyles  from './CustomerDashboard.module.css';
import styles   from '../components/layout/DashboardLayout.module.css';

// ── Status helpers ────────────────────────────────────────────────────────
const STATUS_BADGE = {
  Pending:     'pending',
  In_Progress: 'progress',
  in_progress: 'progress',
  Completed:   'done',
  Cancelled:   'cancelled',
};

const STATUS_LABEL = {
  Pending:     'Pending',
  In_Progress: 'In Progress',
  in_progress: 'In Progress',
  Completed:   'Completed',
  Cancelled:   'Cancelled',
};

// ── Timeline builder ──────────────────────────────────────────────────────
function buildTimeline(repair) {
  if (!repair) return [];

  const created = new Date(repair.created_at).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });

  const base = [
    { label: 'Request Submitted',  sub: created,    status: 'done'    },
    { label: 'Assessed by Tech',   sub: 'Waiting…', status: 'pending' },
    { label: 'Repair In Progress', sub: 'Waiting…', status: 'pending' },
    { label: 'Ready for Pickup',   sub: 'Waiting…', status: 'pending' },
    { label: 'Completed',          sub: 'Waiting…', status: 'pending' },
  ];

  const s = repair.status;
  if (s === 'Pending' || s === 'pending') {
    base[0].status = 'active';
  } else if (s === 'In Progress' || s === 'in_progress') {
    base[1].status = 'done';
    base[2].status = 'active';
  } else if (s === 'Completed' || s === 'completed') {
    base[1].status = 'done';
    base[2].status = 'done';
    base[3].status = 'done';
    base[4].status = 'done';
    base[4].sub    = created;
  }

  return base;
}

// ── Icons ─────────────────────────────────────────────────────────────────
const IconTool = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconPeso = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconCheckSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconDot = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10">
    <circle cx="12" cy="12" r="4"/>
  </svg>
);
const IconEmpty = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ── Repair Form ───────────────────────────────────────────────────────────
function RepairRequestForm({ onSuccess }) {
  const [form,   setForm]   = useState({ device: '', issue: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.device.trim() || !form.issue) {
      showToast('⚠ Please fill in device type and issue.', true);
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch('/api/repairs.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Repair request submitted!');
        setForm({ device: '', issue: '', description: '' });
        onSuccess?.();
      } else {
        showToast('⚠ ' + (data.message || 'Failed to submit.'), true);
      }
    } catch {
      showToast('⚠ Cannot connect to server.', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div className={`${cStyles.toast} ${toast.isError ? cStyles.toastError : cStyles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}
      <form onSubmit={handleSubmit} className={cStyles.repairForm}>
        <div className={cStyles.formRow}>
          <div className={cStyles.formGroup}>
            <label className={cStyles.formLabel}>Device Type</label>
            <input
              type="text"
              className={cStyles.formInput}
              placeholder="e.g. iPhone 14, Samsung A54…"
              value={form.device}
              onChange={e => setForm(f => ({ ...f, device: e.target.value }))}
            />
          </div>
          <div className={cStyles.formGroup}>
            <label className={cStyles.formLabel}>Issue Type</label>
            <select
              className={cStyles.formSelect}
              value={form.issue}
              onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}
            >
              <option value="">Select an issue…</option>
              <option>Screen Damage</option>
              <option>Battery Issue</option>
              <option>Charging Port</option>
              <option>Water Damage</option>
              <option>Camera Problem</option>
              <option>Speaker / Mic Issue</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className={cStyles.formGroup}>
          <label className={cStyles.formLabel}>Description</label>
          <textarea
            className={cStyles.formTextarea}
            placeholder="Describe the issue in detail…"
            rows={4}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
        <button type="submit" className={cStyles.formSubmit} disabled={saving}>
          {saving ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}

// ── Repair Timeline ───────────────────────────────────────────────────────
function RepairTimeline({ repair }) {
  const timeline = buildTimeline(repair);
  const badgeKey = repair?.status?.replace(' ', '_') ?? 'pending';

  return (
    <Panel
      title={repair ? `Track Repair – #${repair.request_id}` : 'Track Repair'}
      extra={repair ? <Badge status={STATUS_BADGE[badgeKey] ?? 'pending'} /> : null}
    >
      {repair ? (
        <div className={cStyles.timeline}>
          {timeline.map((t, i) => (
            <div key={i} className={cStyles.timelineItem}>
              <div className={`${cStyles.timelineDot} ${cStyles['dot_' + t.status]}`}>
                {t.status === 'done' ? <IconCheckSm /> : <IconDot />}
              </div>
              <div className={cStyles.timelineContent}>
                <div className={cStyles.timelineTitle}>{t.label}</div>
                <div className={cStyles.timelineSub}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={cStyles.emptyState}>
          <IconEmpty />
          <p>No repair requests yet. Submit one to get started.</p>
        </div>
      )}
    </Panel>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function CustomerDashboard({ setPage }) {
  const [stats,        setStats]        = useState(null);
  const [repairs,      setRepairs]      = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [latestRepair, setLatestRepair] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    fetch('/api/dashboard.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setRepairs(data.repairs           ?? []);
          setTransactions(data.transactions ?? []);
          setLatestRepair(data.latest_repair ?? null);
        } else {
          setError(data.message || 'Failed to load dashboard.');
        }
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const statCards = stats ? [
    { label: 'Active Repairs',    value: stats.active_repairs.toString(),    sub: 'Pending or in progress', color: 'orange', icon: <IconTool />  },
    { label: 'Completed Repairs', value: stats.completed_repairs.toString(), sub: 'Finished jobs',           color: 'teal',   icon: <IconCheck /> },
    { label: 'Total Spent',       value: `₱${Number(stats.total_spent).toLocaleString()}`, sub: 'All time', color: 'blue',   icon: <IconPeso />  },
  ] : [];

  if (loading) return (
    <main className={styles.content}>
      <div style={{ padding: '2rem' }}>Loading dashboard…</div>
    </main>
  );

  if (error) return (
    <main className={styles.content}>
      <div style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>
    </main>
  );

  return (
    <main className={styles.content}>

      {/* ── Stat Cards ── */}
      <div className={styles.cardsGrid}>
        {statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Form + Timeline ── */}
      <div className={styles.twoCol}>
        <Panel title="Submit Repair Request">
          <RepairRequestForm onSuccess={loadData} />
        </Panel>
        <RepairTimeline repair={latestRepair} />
      </div>

      {/* ── My Repair Requests ── */}
      <div style={{ marginTop: '1.5rem' }}>
        <Panel
          title="My Repair Requests"
          onLink={() => {}}
          linkLabel={`${repairs.length} total`}
        >
          {repairs.length === 0 ? (
            <div className={cStyles.emptyState}>
              <IconEmpty />
              <p>No repair requests found.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job #</th>
                  <th>Device</th>
                  <th>Issue</th>
                  <th>Shop</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map(r => {
                  const key = (r.status ?? '').replace(' ', '_');
                  return (
                    <tr key={r.request_id}>
                      <td className={styles.idCol}>#{r.request_id}</td>
                      <td className={styles.bold}>{r.device_type}</td>
                      <td>{r.issue_description}</td>
                      <td>{r.shop_name}</td>
                      <td className={styles.muted}>
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: '2-digit', year: 'numeric',
                        })}
                      </td>
                      <td><Badge status={STATUS_BADGE[key] ?? 'pending'} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      {/* ── Transaction History ── */}
      <div style={{ marginTop: '1.5rem' }}>
        <Panel
          title="Transaction History"
          onLink={() => {}}
          linkLabel={`${transactions.length} records`}
        >
          {transactions.length === 0 ? (
            <div className={cStyles.emptyState}>
              <IconEmpty />
              <p>No transactions found.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Shop</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.transaction_id}>
                    <td className={styles.idCol}>
                      TXN-{String(t.transaction_id).padStart(4, '0')}
                    </td>
                    <td>{t.shop_name}</td>
                    <td className={styles.bold}>
                      ₱{Number(t.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td>{t.payment_method}</td>
                    <td className={styles.muted}>
                      {new Date(t.transaction_date).toLocaleDateString('en-US', {
                        month: 'short', day: '2-digit', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

    </main>
  );
}