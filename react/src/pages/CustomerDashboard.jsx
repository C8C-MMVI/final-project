// src/pages/CustomerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import s from './CustomerDashboard.module.css';

// ── CSS Variables are declared in dashboard.css globally ──────────────────
// (--teal, --navy, --navy-mid, --navy-border, --muted, --white, etc.)

// ── Status normaliser (handles any casing/spacing from either API) ────────
function normStatus(raw = '') {
  const key = raw.toLowerCase().replace(/[\s_]+/g, '_');
  return { pending: 'pending', in_progress: 'progress', completed: 'done', cancelled: 'cancelled' }[key] ?? 'pending';
}

function statusLabel(raw = '') {
  const key = raw.toLowerCase().replace(/[\s_]+/g, '_');
  return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' }[key] ?? raw;
}

// ── Field helpers — handles both PHP API shapes ───────────────────────────
const repairId   = r => r.repair_id   ?? r.request_id;
const deviceName = r => r.device      ?? r.device_type;
const issueText  = r => r.issue       ?? r.issue_description;

// ── Date formatter ────────────────────────────────────────────────────────
const fmtDate = d =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

// ── Timeline builder ──────────────────────────────────────────────────────
function buildTimeline(repair) {
  if (!repair) return [];
  const created = fmtDate(repair.created_at);
  const base = [
    { label: 'Request Submitted',  sub: created,    status: 'done'    },
    { label: 'Assessed by Tech',   sub: 'Waiting…', status: 'pending' },
    { label: 'Repair In Progress', sub: 'Waiting…', status: 'pending' },
    { label: 'Ready for Pickup',   sub: 'Waiting…', status: 'pending' },
    { label: 'Completed',          sub: 'Waiting…', status: 'pending' },
  ];
  const st = (repair.status ?? '').toLowerCase().replace(/[\s_]+/g, '_');
  if (st === 'pending')     { base[1].status = 'active'; }
  else if (st === 'in_progress') { base[1].status = 'done'; base[2].status = 'active'; }
  else if (st === 'completed')   { base.forEach(b => (b.status = 'done')); base[4].sub = created; }
  return base;
}

// ── Icons ─────────────────────────────────────────────────────────────────
const IconTool = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconPeso = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconCheckSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconDot = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

// ── Badge ─────────────────────────────────────────────────────────────────
function Badge({ status, label }) {
  const cls = {
    pending:   s.badgePending,
    progress:  s.badgeProgress,
    done:      s.badgeDone,
    cancelled: s.badgeCancelled,
  }[status] ?? s.badgePending;
  return <span className={`${s.badge} ${cls}`}>{label}</span>;
}

// ── Panel ─────────────────────────────────────────────────────────────────
function Panel({ title, metaLabel, onMeta, children }) {
  return (
    <div className={s.panel}>
      <div className={s.panelHeader}>
        <span className={s.panelTitle}>{title}</span>
        {metaLabel && (
          onMeta
            ? <button className={s.panelMeta} onClick={onMeta}>{metaLabel}</button>
            : <span className={s.panelMeta}>{metaLabel}</span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Repair Form ───────────────────────────────────────────────────────────
function RepairRequestForm({ onSuccess }) {
  const [form,   setForm]   = useState({ device: '', issue: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.device.trim() || !form.issue) {
      showToast('Please fill in device type and issue.', true);
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch('/api/repairs.php', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Repair request submitted successfully!');
        setForm({ device: '', issue: '', description: '' });
        onSuccess?.();
      } else {
        showToast(data.message || 'Failed to submit.', true);
      }
    } catch {
      showToast('Cannot connect to server.', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={s.repairForm}>
      {toast && (
        <div className={`${s.toast} ${toast.isError ? s.toastError : s.toastSuccess}`}>
          {toast.msg}
        </div>
      )}

      <div className={s.formRow}>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Device Type</label>
          <input
            type="text"
            className={s.formInput}
            placeholder="e.g. iPhone 14, Samsung A54…"
            value={form.device}
            onChange={e => setForm(f => ({ ...f, device: e.target.value }))}
          />
        </div>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Issue Type</label>
          <select
            className={s.formSelect}
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

      <div className={s.formGroup}>
        <label className={s.formLabel}>Description</label>
        <textarea
          className={s.formTextarea}
          placeholder="Describe the issue in detail…"
          rows={4}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>

      <button type="submit" className={s.formSubmit} disabled={saving}>
        {saving ? 'Submitting…' : 'Submit Request'}
      </button>
    </form>
  );
}

// ── Repair Timeline ───────────────────────────────────────────────────────
function RepairTimeline({ repair }) {
  const timeline = buildTimeline(repair);
  return (
    <Panel
      title={repair ? `Track Repair – #${repairId(repair)}` : 'Track Repair'}
      metaLabel={repair ? statusLabel(repair.status) : null}
    >
      {repair ? (
        <div className={s.timeline}>
          {timeline.map((t, i) => (
            <div key={i} className={s.timelineItem}>
              <div className={`${s.timelineDot} ${s['dot_' + t.status]}`}>
                {t.status === 'done' ? <IconCheckSm /> : <IconDot />}
              </div>
              <div className={s.timelineContent}>
                <div className={s.timelineTitle}>{t.label}</div>
                <div className={s.timelineSub}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={s.emptyState}>
          <IconEmpty />
          <p>No repair requests yet. Submit one to get started.</p>
        </div>
      )}
    </Panel>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function CustomerDashboard({ username = 'Customer', setPage }) {
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
          setRepairs(data.repairs ?? []);
          setTransactions(data.transactions ?? []);
          setLatestRepair(
            data.latest_repair ??
            (data.repairs?.length ? data.repairs[0] : null)
          );
        } else {
          setError(data.message || 'Failed to load dashboard.');
        }
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div className={s.loadingState}>Loading dashboard…</div>
  );
  if (error) return (
    <div className={s.errorState}>{error}</div>
  );

  const activeCount    = stats?.active_repairs    ?? 0;
  const completedCount = stats?.completed_repairs ?? 0;
  const totalSpent     = stats?.total_spent       ?? 0;

  return (
    <>
      {/* ── Greeting header ── */}
      <div className={s.welcomeHeader}>
        <div className={s.welcomeGreeting}>
          Welcome back, <span>{username}</span>
        </div>
        <div className={s.welcomeSub}>
          Here's a summary of your repair requests and transactions.
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className={s.statsRow}>
        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.iconOrange}`}><IconTool /></div>
          <div className={s.statInfo}>
            <span className={s.statValue}>{activeCount}</span>
            <span className={s.statLabel}>Active Repairs</span>
          </div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.iconTeal}`}><IconCheck /></div>
          <div className={s.statInfo}>
            <span className={s.statValue}>{completedCount}</span>
            <span className={s.statLabel}>Completed Repairs</span>
          </div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statIcon} ${s.iconBlue}`}><IconPeso /></div>
          <div className={s.statInfo}>
            <span className={s.statValue}>
              ₱{Number(totalSpent).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
            </span>
            <span className={s.statLabel}>Total Spent</span>
          </div>
        </div>
      </div>

      {/* ── Form + Timeline ── */}
      <div className={s.twoCol}>
        <Panel title="Submit Repair Request">
          <RepairRequestForm onSuccess={loadData} />
        </Panel>
        <RepairTimeline repair={latestRepair} />
      </div>

      {/* ── My Repair Requests ── */}
      <div className={s.tableSection}>
        <Panel
          title="My Repair Requests"
          metaLabel={`${repairs.length} total`}
          onMeta={setPage ? () => setPage('My Repairs') : null}
        >
          {repairs.length === 0 ? (
            <div className={s.emptyState}>
              <IconEmpty /><p>No repair requests found.</p>
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Job #</th><th>Device</th><th>Issue</th>
                  <th>Shop</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map(r => (
                  <tr key={repairId(r)}>
                    <td className={s.idCol}>#{repairId(r)}</td>
                    <td className={s.bold}>{deviceName(r)}</td>
                    <td>{issueText(r)}</td>
                    <td>{r.shop_name}</td>
                    <td className={s.muted}>{fmtDate(r.created_at)}</td>
                    <td>
                      <Badge status={normStatus(r.status)} label={statusLabel(r.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      {/* ── Transaction History ── */}
      <div className={s.tableSection}>
        <Panel
          title="Transaction History"
          metaLabel={`${transactions.length} records`}
          onMeta={setPage ? () => setPage('My Transactions') : null}
        >
          {transactions.length === 0 ? (
            <div className={s.emptyState}>
              <IconEmpty /><p>No transactions found.</p>
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Reference</th><th>Item / Service</th>
                  <th>Amount</th><th>Method</th><th>Date</th><th>Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const amount  = t.total_amount  ?? t.amount;
                  const method  = t.payment_method ?? t.type ?? '—';
                  const dateStr = t.transaction_date ?? t.created_at;
                  const item    = t.shop_name
                    ? t.shop_name
                    : `${t.device ?? ''} – ${t.issue ?? ''}`.replace(/^–\s*|–\s*$/, '');

                  return (
                    <tr key={t.transaction_id}>
                      <td className={s.idCol}>
                        TXN-{String(t.transaction_id).padStart(4, '0')}
                      </td>
                      <td>{item}</td>
                      <td className={s.bold}>
                        ₱{Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td>{method}</td>
                      <td className={s.muted}>{fmtDate(dateStr)}</td>
                      <td>
                        <Badge
                          status={method === 'payment' ? 'done' : 'pending'}
                          label={method.charAt(0).toUpperCase() + method.slice(1)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    </>
  );
}