// src/pages/OwnerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/dashboard/StatCard';
import Panel    from '../components/shared/Panel';
import Badge    from '../components/shared/Badge';
import { createSale, getSalesByShop } from '../lib/api';
import styles   from './OwnerDashboard.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const repairBadge = {
  'In Progress': 'progress',
  'Pending':     'pending',
  'Completed':   'done',
};

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
          background: 'var(--teal, #1abc9c)', color: '#0a1628', border: 'none',
          fontSize: '0.73rem', fontWeight: 700, padding: '4px 11px', borderRadius: 7,
          cursor: 'pointer', opacity: saving ? 0.55 : 1, whiteSpace: 'nowrap', transition: 'opacity 0.2s',
        }}
      >
        {saving ? '…' : 'Save'}
      </button>
    </div>
  );
}

// ── Create Sale Modal ─────────────────────────────────────────────────────────
// Opens when owner clicks "Create Sale" on a Completed repair.
// POSTs to Spring Boot POST /api/sales
function CreateSaleModal({ repair, onClose, onCreated }) {
  const emptyItem = () => ({ description: '', quantity: 1, unitPrice: '' });

  const [items,   setItems]   = useState([emptyItem()]);
  const [method,  setMethod]  = useState('Cash');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  const addItem    = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const total = items.reduce((sum, it) => {
    const qty   = Number(it.quantity)  || 0;
    const price = Number(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = async () => {
    setError(null);

    // Validate
    for (const it of items) {
      if (!it.description.trim() || !it.quantity || !it.unitPrice) {
        setError('Please fill in all item fields.');
        return;
      }
    }

    setSaving(true);
    try {
      const body = {
        requestId:     repair.request_id,
        shopId:        repair.shop_id,
        customerId:    repair.customer_id,
        staffId:       repair.technician_id,
        paymentMethod: method,
        items: items.map(it => ({
          description: it.description.trim(),
          quantity:    Number(it.quantity),
          unitPrice:   Number(it.unitPrice),
        })),
      };

      const res  = await createSale(body);
      const data = await res.json();

      if (res.ok) {
        onCreated?.();
        onClose();
      } else {
        setError(data.error ?? 'Failed to create sale.');
      }
    } catch {
      setError('Cannot connect to sales server.');
    } finally {
      setSaving(false);
    }
  };

  // Modal overlay styles (inline so no extra CSS file needed)
  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  };
  const modal = {
    background: 'var(--navy-mid, #0d1f38)',
    border: '1px solid rgba(26,188,156,0.18)',
    borderRadius: 14, padding: '28px 32px', width: '100%', maxWidth: 580,
    maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  };
  const label   = { display: 'block', color: 'var(--muted, #8090a8)', fontSize: '0.72rem', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' };
  const input   = { width: '100%', background: 'var(--navy-dark, #0a1628)', border: '1px solid rgba(26,188,156,0.15)', color: '#fff', padding: '7px 11px', borderRadius: 7, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' };
  const btnTeal = { background: 'var(--teal, #1abc9c)', color: '#0a1628', border: 'none', fontWeight: 700, padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' };
  const btnGhost= { background: 'transparent', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modal}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: 'Rajdhani, sans-serif' }}>
              Create Sale — Repair #{repair.request_id}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 2 }}>
              {repair.device_type} · {repair.customer_name}
            </div>
          </div>
          <button onClick={onClose} style={{ ...btnGhost, padding: '4px 10px' }}>✕</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 12px', borderRadius: 7, marginBottom: 14, fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {/* Payment method */}
        <div style={{ marginBottom: 16 }}>
          <label style={label}>Payment Method</label>
          <select value={method} onChange={e => setMethod(e.target.value)} style={input}>
            <option>Cash</option>
            <option>GCash</option>
            <option>Maya</option>
            <option>Bank Transfer</option>
            <option>Card</option>
          </select>
        </div>

        {/* Line items */}
        <div style={{ marginBottom: 8 }}>
          <label style={label}>Line Items</label>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 100px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input
                style={input} placeholder="Description (e.g. Screen Replacement)"
                value={it.description}
                onChange={e => updateItem(i, 'description', e.target.value)}
              />
              <input
                style={input} type="number" min="1" placeholder="Qty"
                value={it.quantity}
                onChange={e => updateItem(i, 'quantity', e.target.value)}
              />
              <input
                style={input} type="number" min="0" step="0.01" placeholder="Unit Price"
                value={it.unitPrice}
                onChange={e => updateItem(i, 'unitPrice', e.target.value)}
              />
              <button
                onClick={() => removeItem(i)} disabled={items.length === 1}
                style={{ ...btnGhost, padding: '6px 8px', opacity: items.length === 1 ? 0.3 : 1 }}
              >✕</button>
            </div>
          ))}
          <button onClick={addItem} style={{ ...btnGhost, marginTop: 4, fontSize: '0.78rem' }}>
            + Add Item
          </button>
        </div>

        {/* Total */}
        <div style={{ textAlign: 'right', color: 'var(--teal, #1abc9c)', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'Rajdhani, sans-serif', margin: '16px 0' }}>
          Total: ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={onClose} disabled={saving}>Cancel</button>
          <button style={{ ...btnTeal, opacity: saving ? 0.6 : 1 }} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Confirm Sale'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function OwnerDashboard({ setPage, activeSection = 'dashboard', setActiveSection }) {
  const [repairs,      setRepairs]      = useState([]);
  const [technicians,  setTechnicians]  = useState([]);
  const [transactions, setTransactions] = useState([]); // now from Spring Boot
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [toast,        setToast]        = useState(null);

  // Create Sale modal state
  const [saleRepair,   setSaleRepair]   = useState(null); // repair to create a sale for

  // Shop ID comes from the session — PHP dashboard returns it in stats
  const [shopId, setShopId] = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch repairs (PHP) ────────────────────────────────────────────────────
  const fetchRepairs = useCallback(async () => {
    try {
      const res  = await fetch('/api/repairs.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setRepairs(data.repairs ?? []);
    } catch {}
  }, []);

  // ── Fetch technicians (PHP) ────────────────────────────────────────────────
  const fetchTechnicians = useCallback(async () => {
    try {
      const res  = await fetch('/api/technicians.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setTechnicians(data.technicians ?? []);
    } catch {}
  }, []);

  // ── Fetch stats (PHP) ─────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const res  = await fetch('/api/dashboard.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        // Grab shop_id from stats so we can query Spring Boot
        if (data.stats?.shop_id) setShopId(data.stats.shop_id);
      }
    } catch {}
  }, []);

  // ── Fetch sales/transactions (Spring Boot) ────────────────────────────────
  const fetchSales = useCallback(async (sid) => {
    if (!sid) return;
    try {
      const res  = await getSalesByShop(sid);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data ?? []);
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

  // Once we have shopId, load sales from Spring Boot
  useEffect(() => {
    if (shopId) fetchSales(shopId);
  }, [shopId, fetchSales]);

  const handleAssigned = () => {
    showToast('Technician assigned successfully.');
    fetchRepairs();
  };

  const handleSaleCreated = () => {
    showToast('Sale created successfully!');
    if (shopId) fetchSales(shopId);
  };

  const handleTab = (sectionKey) => {
    if (setActiveSection) setActiveSection(sectionKey);
  };

  // ── Derived stats ───────────────────────────────────────────────────────────
  const statCards = stats ? [
    { label: 'Active Repairs',   value: stats.active_repairs,  icon_class: 'orange' },
    { label: 'Completed Today',  value: stats.completed_today, icon_class: 'teal'   },
    { label: 'Total Customers',  value: stats.total_customers, icon_class: 'blue'   },
    { label: "Today's Revenue",  value: `₱${Number(stats.today_revenue ?? 0).toLocaleString('en-PH')}`, icon_class: 'purple' },
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
          position: 'fixed', bottom: 28, right: 28, zIndex: 9998,
          background: 'var(--navy-mid, #0d1f38)',
          border: `1px solid ${toast.isError ? '#ef4444' : 'var(--teal, #1abc9c)'}`,
          color: toast.isError ? '#ef4444' : 'var(--white, #fff)',
          padding: '12px 20px', borderRadius: 10, fontSize: '0.82rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Create Sale Modal */}
      {saleRepair && (
        <CreateSaleModal
          repair={saleRepair}
          onClose={() => setSaleRepair(null)}
          onCreated={handleSaleCreated}
        />
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

            <Panel title="Recent Sales" linkLabel="View all" onLink={() => handleTab('reports')}>
              {transactions.length === 0 ? <Empty msg="No sales yet." /> : (
                <table className={styles.table}>
                  <thead>
                    <tr><th>Sale #</th><th>Repair #</th><th>Amount</th><th>Method</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((t, i) => (
                      <tr key={t.saleId ?? i}>
                        <td className={styles.idCol}>SALE-{String(t.saleId).padStart(4, '0')}</td>
                        <td>#{t.requestId}</td>
                        <td className={styles.amountCol}>₱{Number(t.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td>{t.paymentMethod}</td>
                        <td className={styles.mutedCol}>{fmtDate(t.soldAt)}</td>
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

            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Total',       value: repairs.length,                                         color: 'var(--teal)'  },
                { label: 'Pending',     value: repairs.filter(r => r.status === 'Pending').length,     color: '#fb923c'      },
                { label: 'In Progress', value: repairs.filter(r => r.status === 'In Progress').length, color: '#facc15'      },
                { label: 'Completed',   value: repairs.filter(r => r.status === 'Completed').length,   color: '#4ade80'      },
                { label: 'Unassigned',  value: repairs.filter(r => !r.technician_id).length,           color: '#f87171'      },
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
                      <th>Date</th><th>Status</th><th>Assign Technician</th><th>Sale</th>
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
                          <AssignCell repair={r} technicians={technicians} onAssigned={handleAssigned} />
                        </td>
                        <td>
                          {/* Only completed repairs can have a sale created */}
                          {r.status === 'Completed' ? (
                            <button
                              onClick={() => setSaleRepair(r)}
                              style={{
                                background: 'var(--teal, #1abc9c)', color: '#0a1628',
                                border: 'none', fontSize: '0.72rem', fontWeight: 700,
                                padding: '4px 12px', borderRadius: 7, cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Create Sale
                            </button>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>—</span>
                          )}
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
            <Panel title="All Sales" linkLabel={`${transactions.length} records`}>
              {transactions.length === 0 ? <Empty msg="No sales yet." /> : (
                <table className={styles.table}>
                  <thead>
                    <tr><th>Sale #</th><th>Repair #</th><th>Amount</th><th>Method</th><th>Date</th><th>Items</th></tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => (
                      <tr key={t.saleId ?? i}>
                        <td className={styles.idCol}>SALE-{String(t.saleId).padStart(4, '0')}</td>
                        <td>#{t.requestId}</td>
                        <td className={styles.amountCol}>₱{Number(t.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        <td>{t.paymentMethod}</td>
                        <td className={styles.mutedCol}>{fmtDate(t.soldAt)}</td>
                        <td className={styles.mutedCol}>{t.items?.length ?? 0} item(s)</td>
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