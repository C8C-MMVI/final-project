// src/pages/OwnerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/dashboard/StatCard';
import Panel    from '../components/shared/Panel';
import Badge    from '../components/shared/Badge';
import styles   from './OwnerDashboard.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const repairBadge = {
  'In Progress': 'progress',
  'Pending':     'pending',
  'Completed':   'done',
};
const membBadge = { active: 'done', inactive: 'cancelled' };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

// ── Assign Technician Dropdown ────────────────────────────────────────────────
function AssignCell({ repair, technicians, onAssigned }) {
  const [selected, setSelected] = useState(repair.technician_id ?? '');
  const [saving,   setSaving]   = useState(false);

  const handleAssign = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res  = await fetch('/api/repairs.php', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: repair.request_id, technician_id: Number(selected) }),
      });
      const data = await res.json();
      if (data.success) onAssigned?.();
    } catch {}
    finally { setSaving(false); }
  };

  // Only show for Pending / In Progress repairs
  if (repair.status === 'Completed') {
    return <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{repair.technician_name ?? '—'}</span>;
  }

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        style={{
          background: 'var(--navy-mid, #0d1f38)',
          border: '1px solid var(--navy-border, rgba(26,188,156,0.14))',
          color: 'var(--white, #fff)',
          fontSize: '0.76rem',
          padding: '4px 8px',
          borderRadius: 7,
          outline: 'none',
          cursor: 'pointer',
          minWidth: 130,
        }}
      >
        <option value="">— Assign —</option>
        {technicians.map(t => (
          <option key={t.user_id} value={t.user_id}>{t.username}</option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={saving || !selected || Number(selected) === Number(repair.technician_id)}
        style={{
          background: 'var(--teal, #1abc9c)',
          color: '#0a1628',
          border: 'none',
          fontSize: '0.73rem',
          fontWeight: 700,
          padding: '4px 11px',
          borderRadius: 7,
          cursor: 'pointer',
          opacity: saving ? 0.55 : 1,
          whiteSpace: 'nowrap',
          transition: 'opacity 0.2s',
        }}
      >
        {saving ? '…' : 'Save'}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function OwnerDashboard({ setPage, activeSection = 'dashboard', setActiveSection }) {
  const [repairs,      setRepairs]      = useState([]);
  const [technicians,  setTechnicians]  = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchRepairs = useCallback(async () => {
    try {
      const res  = await fetch('/api/repairs.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setRepairs(data.repairs ?? []);
    } catch {}
  }, []);

  const fetchTechnicians = useCallback(async () => {
    try {
      const res  = await fetch('/api/technicians.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setTechnicians(data.technicians ?? []);
    } catch {}
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res  = await fetch('/api/dashboard.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTransactions(data.transactions ?? []);
      }
    } catch {}
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchRepairs(), fetchTechnicians(), fetchDashboard()]);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [fetchRepairs, fetchTechnicians, fetchDashboard]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // After assigning a technician, refresh repairs silently
  const handleAssigned = () => {
    showToast('Technician assigned successfully.');
    fetchRepairs();
  };

  const handleTab = (sectionKey) => {
    if (setActiveSection) setActiveSection(sectionKey);
  };

  // ── Derived stats ───────────────────────────────────────────────────────────
  const statCards = stats ? [
    { label: 'Active Repairs',   value: stats.active_repairs,  sub: '',          icon_class: 'orange' },
    { label: 'Completed Today',  value: stats.completed_today, sub: '',          icon_class: 'teal'   },
    { label: 'Total Customers',  value: stats.total_customers, sub: '',          icon_class: 'blue'   },
    { label: "Today's Revenue",  value: `₱${Number(stats.today_revenue ?? 0).toLocaleString('en-PH')}`, sub: '', icon_class: 'purple' },
  ] : [];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard'            },
    { id: 'repairs',   label: 'Repairs / Job Orders' },
    { id: 'members',   label: 'Member Management'    },
    { id: 'reports',   label: 'Reports / Analytics'  },
  ];

  return (
    <div className={styles.root}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: 'var(--navy-mid, #0d1f38)',
          border: `1px solid ${toast.isError ? '#ef4444' : 'var(--teal, #1abc9c)'}`,
          color: toast.isError ? '#ef4444' : 'var(--white, #fff)',
          padding: '12px 20px', borderRadius: 10, fontSize: '0.82rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Sub-nav tabs */}
      <nav className={styles.subNav}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.subNavBtn} ${activeSection === tab.id ? styles.subNavBtnActive : ''}`}
            onClick={() => handleTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>

        {/* ── DASHBOARD ──────────────────────────────────────────────────────── */}
        {activeSection === 'dashboard' && (
          <>
            {loading ? (
              <div className={styles.loadingText}>Loading dashboard…</div>
            ) : error ? (
              <div className={styles.errorText}>{error}</div>
            ) : (
              <div className={styles.cardsGrid}>
                {statCards.map((s, i) => <StatCard key={i} {...s} />)}
              </div>
            )}

            <Panel title="Recent Repair Jobs" linkLabel="View all" onLink={() => handleTab('repairs')}>
              {loading ? <Loader /> : repairs.length === 0 ? <Empty msg="No repairs found." /> : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Job #</th><th>Customer</th><th>Device</th>
                      <th>Issue</th><th>Technician</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.slice(0, 5).map((r, i) => (
                      <tr key={r.request_id ?? i}>
                        <td className={styles.idCol}>#{r.request_id}</td>
                        <td>{r.customer_name}</td>
                        <td>{r.device_type}</td>
                        <td className={styles.mutedCol}>{r.issue_description}</td>
                        <td style={{ color: r.technician_name ? 'var(--teal)' : 'var(--muted)', fontSize: '0.8rem' }}>
                          {r.technician_name ?? 'Unassigned'}
                        </td>
                        <td><Badge status={repairBadge[r.status] ?? 'pending'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            <Panel title="Recent Transactions">
              {loading ? <Loader /> : transactions.length === 0 ? <Empty msg="No transactions yet." /> : (
                <table className={styles.table}>
                  <thead>
                    <tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Method</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => (
                      <tr key={t.transaction_id ?? i}>
                        <td className={styles.idCol}>TXN-{String(t.transaction_id).padStart(4, '0')}</td>
                        <td>{t.customer_name ?? '—'}</td>
                        <td className={styles.amountCol}>₱{Number(t.total_amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td>{t.payment_method ?? '—'}</td>
                        <td className={styles.mutedCol}>{fmtDate(t.transaction_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* ── REPAIRS ────────────────────────────────────────────────────────── */}
        {activeSection === 'repairs' && (
          <>
            <SectionHeader title="Repairs / Job Orders" />

            {/* Quick stats strip */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Total',       value: repairs.length,                                          color: 'var(--teal)'  },
                { label: 'Pending',     value: repairs.filter(r => r.status === 'Pending').length,      color: '#fb923c'      },
                { label: 'In Progress', value: repairs.filter(r => r.status === 'In Progress').length,  color: '#facc15'      },
                { label: 'Completed',   value: repairs.filter(r => r.status === 'Completed').length,    color: '#4ade80'      },
                { label: 'Unassigned',  value: repairs.filter(r => !r.technician_id).length,            color: '#f87171'      },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--navy-mid, #0d1f38)',
                  border: '1px solid var(--navy-border)',
                  borderRadius: 10, padding: '10px 18px', textAlign: 'center', minWidth: 90,
                }}>
                  <div style={{ color: s.color, fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Rajdhani, sans-serif' }}>{s.value}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.7rem', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Panel title="All Repair Jobs" linkLabel={`${repairs.length} total`}>
              {loading ? <Loader /> : repairs.length === 0 ? <Empty msg="No repairs found." /> : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Job #</th><th>Customer</th><th>Device</th><th>Issue</th>
                      <th>Date</th><th>Status</th><th>Assign Technician</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.map((r, i) => (
                      <tr key={r.request_id ?? i}>
                        <td className={styles.idCol}>#{r.request_id}</td>
                        <td className={styles.boldCol}>{r.customer_name}</td>
                        <td>{r.device_type}</td>
                        <td className={styles.mutedCol}>{r.issue_description}</td>
                        <td className={styles.mutedCol}>{fmtDate(r.created_at)}</td>
                        <td><Badge status={repairBadge[r.status] ?? 'pending'} /></td>
                        <td>
                          <AssignCell
                            repair={r}
                            technicians={technicians}
                            onAssigned={handleAssigned}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* ── MEMBERS ────────────────────────────────────────────────────────── */}
        {activeSection === 'members' && (
          <>
            <SectionHeader title="Member Management" />
            <Panel title="Shop Technicians" linkLabel={`${technicians.length} members`}>
              {loading ? <Loader /> : technicians.length === 0 ? (
                <Empty msg="No technicians assigned to your shop yet." />
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Shop</th>
                      <th>Jobs Done</th><th>Active Jobs</th><th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicians.map((t, i) => (
                      <tr key={t.user_id ?? i}>
                        <td className={styles.boldCol}>{t.username}</td>
                        <td className={styles.mutedCol}>{t.email}</td>
                        <td>{t.shop_name}</td>
                        <td className={styles.boldCol}>{t.jobs_done}</td>
                        <td style={{ color: t.active_jobs > 0 ? '#facc15' : 'var(--muted)' }}>
                          {t.active_jobs}
                        </td>
                        <td className={styles.mutedCol}>{fmtDate(t.appointed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* ── REPORTS ────────────────────────────────────────────────────────── */}
        {activeSection === 'reports' && (
          <>
            <SectionHeader title="Reports / Analytics" />
            <div className={styles.twoCol}>
              <Panel title="Revenue This Month"><EmptyChart label="Charts coming soon" icon="bar" /></Panel>
              <Panel title="Repairs by Status"><EmptyChart label="Charts coming soon" icon="pie" /></Panel>
            </div>
            <Panel title="Recent Transactions">
              {transactions.length === 0 ? <Empty msg="No transactions yet." /> : (
                <table className={styles.table}>
                  <thead>
                    <tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Method</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => (
                      <tr key={t.transaction_id ?? i}>
                        <td className={styles.idCol}>TXN-{String(t.transaction_id).padStart(4, '0')}</td>
                        <td>{t.customer_name ?? '—'}</td>
                        <td className={styles.amountCol}>₱{Number(t.total_amount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td>{t.payment_method ?? '—'}</td>
                        <td className={styles.mutedCol}>{fmtDate(t.transaction_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

      </main>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function SectionHeader({ title }) {
  return <div className={styles.sectionPageHeader}><h2>{title}</h2></div>;
}
function Loader() {
  return <div className={styles.loadingText} style={{ padding: '1rem' }}>Loading…</div>;
}
function Empty({ msg }) {
  return <div className={styles.emptyText} style={{ padding: '1rem' }}>{msg}</div>;
}
function EmptyChart({ label, icon }) {
  return (
    <div className={styles.emptyChart}>
      {icon === 'bar' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
      )}
      <div>{label}</div>
    </div>
  );
}