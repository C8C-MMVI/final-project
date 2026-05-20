// src/pages/RepairsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import Panel from '../components/shared/Panel';
import Badge from '../components/shared/Badge';
import { createSale } from '../lib/api';
import styles from '../pages/AdminDashboard.module.css';

const POLL_INTERVAL = 30_000;

const repairBadge = {
  'Pending':     'pending',
  'In Progress': 'progress',
  'Completed':   'completed',
};

function TableSkeleton({ cols = 7, rows = 6 }) {
  return (
    <div className={styles.skeletonWrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={styles.skeletonCell} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Assign Technician Modal ─────────────────────────────────────── */
function AssignModal({ repair, onClose, onAssigned }) {
  const [technicians, setTechnicians] = useState([]);
  const [selected,    setSelected]    = useState(repair.technician_id ?? '');
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);

  useEffect(() => {
    fetch('/api/technicians.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const shopTechs = (data.technicians ?? []).filter(t => t.shop_id === repair.shop_id);
          setTechnicians(shopTechs);
        } else {
          setError(data.message ?? 'Failed to load technicians.');
        }
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, [repair.shop_id]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    fetch('/api/repairs.php', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id:    repair.request_id,
        technician_id: Number(selected),
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          onAssigned(repair.request_id, Number(selected), technicians.find(t => t.user_id === Number(selected)));
          onClose();
        } else {
          setError(data.message ?? 'Failed to assign technician.');
        }
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setSaving(false));
  };

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(10,28,22,0.55)',
    backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
    animation: 'fadeIn 0.15s ease',
  };
  const modal = {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden',
    animation: 'slideUp 0.18s ease',
  };
  const header = {
    padding: '18px 20px 14px',
    borderBottom: '1px solid rgba(13,31,26,0.07)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  };
  const body   = { padding: '16px 20px' };
  const footer = {
    padding: '12px 20px 18px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(12px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
      <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={modal} role="dialog" aria-modal="true" aria-label="Assign Technician">
          <div style={header}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a1c16', lineHeight: 1.2 }}>
                Assign Technician
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(13,31,26,0.45)', marginTop: '4px' }}>
                #{repair.request_id} · {repair.customer_name} · {repair.device_type}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(13,31,26,0.35)', fontSize: '1.1rem', lineHeight: 1,
                padding: '2px 4px', borderRadius: '4px', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#0a1c16'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(13,31,26,0.35)'}
              aria-label="Close"
            >✕</button>
          </div>

          <div style={body}>
            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: '8px', marginBottom: '12px',
                background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)',
                color: '#b91c1c', fontSize: '0.78rem',
              }}>
                {error}
              </div>
            )}
            {loading ? (
              <div style={{ fontSize: '0.82rem', color: 'rgba(13,31,26,0.45)', textAlign: 'center', padding: '20px 0' }}>
                Loading technicians…
              </div>
            ) : technicians.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'rgba(13,31,26,0.45)', textAlign: 'center', padding: '20px 0' }}>
                No technicians available for this shop.
              </div>
            ) : (
              <>
                <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'rgba(13,31,26,0.5)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Select Technician
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  {technicians.map(t => {
                    const isActive = Number(selected) === t.user_id;
                    return (
                      <button
                        key={t.user_id}
                        onClick={() => setSelected(t.user_id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '9px 12px', borderRadius: '9px', textAlign: 'left',
                          border: isActive ? '1.5px solid rgba(26,188,156,0.5)' : '1.5px solid rgba(13,31,26,0.1)',
                          background: isActive ? 'rgba(26,188,156,0.06)' : 'rgba(13,31,26,0.02)',
                          cursor: 'pointer', width: '100%', fontFamily: 'inherit', transition: 'all 0.13s',
                        }}
                      >
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: isActive ? 'rgba(26,188,156,0.15)' : 'rgba(13,31,26,0.07)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem', fontWeight: 700,
                          color: isActive ? '#1abc9c' : 'rgba(13,31,26,0.4)', transition: 'all 0.13s',
                        }}>
                          {(t.username ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#0a1c16', lineHeight: 1.2 }}>
                            {t.username}
                          </div>
                          {t.active_jobs > 0 && (
                            <div style={{ fontSize: '0.72rem', color: 'rgba(13,31,26,0.4)', marginTop: '1px' }}>
                              {t.active_jobs} active job{t.active_jobs !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        {isActive && <div style={{ color: '#1abc9c', fontSize: '0.85rem', flexShrink: 0 }}>✓</div>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div style={footer}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 16px', borderRadius: '8px',
                border: '1px solid rgba(13,31,26,0.14)',
                background: 'transparent', color: 'rgba(13,31,26,0.6)',
                fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.13s',
              }}
            >Cancel</button>
            <button
              onClick={handleSave}
              disabled={!selected || saving || loading}
              style={{
                padding: '7px 18px', borderRadius: '8px', border: 'none',
                background: (!selected || saving || loading) ? 'rgba(26,188,156,0.3)' : '#1abc9c',
                color: '#fff', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'inherit',
                cursor: (!selected || saving || loading) ? 'not-allowed' : 'pointer',
                transition: 'background 0.13s',
              }}
            >{saving ? 'Saving…' : 'Assign'}</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Create Sale Modal ───────────────────────────────────────────── */
function CreateSaleModal({ repair, onClose, onCreated }) {
  const emptyItem = () => ({ description: '', quantity: 1, unitPrice: '' });
  const [items,  setItems]  = useState([emptyItem()]);
  const [method, setMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const addItem    = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const total = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0
  );

  const handleSubmit = async () => {
    setError(null);
    for (const it of items) {
      if (!it.description.trim() || !it.quantity || !it.unitPrice) {
        setError('Please fill in all item fields.'); return;
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
      if (res.ok) { onCreated?.(); onClose(); }
      else { setError(data.error ?? 'Failed to create sale.'); }
    } catch {
      setError('Cannot connect to sales server.');
    } finally {
      setSaving(false);
    }
  };

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1001,
    background: 'rgba(10,28,22,0.55)',
    backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
    animation: 'fadeIn 0.15s ease',
  };
  const modal = {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
    width: '100%', maxWidth: '560px',
    maxHeight: '90vh', overflowY: 'auto',
    animation: 'slideUp 0.18s ease',
  };
  const header = {
    padding: '18px 20px 14px',
    borderBottom: '1px solid rgba(13,31,26,0.07)',
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 8,
    position: 'sticky', top: 0, background: '#fff', zIndex: 1,
  };
  const body   = { padding: '16px 20px' };
  const footer = {
    padding: '12px 20px 18px',
    borderTop: '1px solid rgba(13,31,26,0.07)',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: '8px',
    position: 'sticky', bottom: 0, background: '#fff', zIndex: 1,
  };
  const lbl = {
    display: 'block',
    fontSize: '0.72rem', fontWeight: 700,
    color: 'rgba(13,31,26,0.45)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    marginBottom: '5px',
  };
  const inp = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 11px', borderRadius: '8px',
    border: '1px solid rgba(13,31,26,0.14)',
    background: 'rgba(13,31,26,0.02)',
    color: '#0a1c16', fontSize: '0.82rem',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(12px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
      <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={modal} role="dialog" aria-modal="true" aria-label="Create Sale">

          {/* Header */}
          <div style={header}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0a1c16', lineHeight: 1.2 }}>
                Create Sale — Repair #{repair.request_id}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(13,31,26,0.45)', marginTop: '4px' }}>
                {repair.device_type} · {repair.customer_name}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(13,31,26,0.35)', fontSize: '1.1rem', lineHeight: 1,
                padding: '2px 4px', borderRadius: '4px', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#0a1c16'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(13,31,26,0.35)'}
              aria-label="Close"
            >✕</button>
          </div>

          {/* Body */}
          <div style={body}>
            {error && (
              <div style={{
                padding: '8px 12px', borderRadius: '8px', marginBottom: '14px',
                background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)',
                color: '#b91c1c', fontSize: '0.78rem',
              }}>
                {error}
              </div>
            )}

            {/* Payment Method */}
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Payment Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                style={inp}
              >
                <option>Cash</option>
                <option>GCash</option>
                <option>Maya</option>
                <option>Bank Transfer</option>
                <option>Card</option>
              </select>
            </div>

            {/* Line Items */}
            <div>
              <label style={lbl}>Line Items</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((it, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 72px 110px 32px',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      style={inp}
                      placeholder="Description (e.g. Screen Replacement)"
                      value={it.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'rgba(26,188,156,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(13,31,26,0.14)'}
                    />
                    <input
                      style={inp}
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'rgba(26,188,156,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(13,31,26,0.14)'}
                    />
                    <input
                      style={inp}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit Price"
                      value={it.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'rgba(26,188,156,0.5)'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(13,31,26,0.14)'}
                    />
                    <button
                      onClick={() => removeItem(i)}
                      disabled={items.length === 1}
                      style={{
                        padding: '7px', borderRadius: '7px',
                        border: '1px solid rgba(13,31,26,0.14)',
                        background: 'rgba(13,31,26,0.03)',
                        color: 'rgba(13,31,26,0.4)',
                        fontSize: '0.8rem', cursor: items.length === 1 ? 'not-allowed' : 'pointer',
                        opacity: items.length === 1 ? 0.3 : 1,
                        fontFamily: 'inherit', transition: 'all 0.13s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  </div>
                ))}
              </div>

              <button
                onClick={addItem}
                style={{
                  marginTop: '10px', padding: '6px 14px',
                  borderRadius: '7px',
                  border: '1px dashed rgba(26,188,156,0.4)',
                  background: 'rgba(26,188,156,0.04)',
                  color: '#1abc9c', fontSize: '0.78rem',
                  fontWeight: 600, fontFamily: 'inherit',
                  cursor: 'pointer', transition: 'all 0.13s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,188,156,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,188,156,0.04)'}
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* Footer */}
          <div style={footer}>
            {/* Total */}
            <div style={{ fontSize: '0.82rem', color: 'rgba(13,31,26,0.5)' }}>
              Total:{' '}
              <span style={{ color: '#1abc9c', fontWeight: 800, fontSize: '1.05rem' }}>
                ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onClose}
                disabled={saving}
                style={{
                  padding: '7px 16px', borderRadius: '8px',
                  border: '1px solid rgba(13,31,26,0.14)',
                  background: 'transparent', color: 'rgba(13,31,26,0.6)',
                  fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
                  cursor: 'pointer', transition: 'all 0.13s',
                }}
              >Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  padding: '7px 20px', borderRadius: '8px', border: 'none',
                  background: saving ? 'rgba(26,188,156,0.4)' : '#1abc9c',
                  color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 3px 12px rgba(26,188,156,0.3)',
                  transition: 'all 0.13s',
                }}
              >{saving ? 'Saving…' : 'Confirm Sale'}</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

/* ── Toast Notification ──────────────────────────────────────────── */
function Toast({ message, isError, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: '#fff',
      border: `1px solid ${isError ? 'rgba(239,68,68,0.25)' : 'rgba(26,188,156,0.25)'}`,
      borderLeft: `3px solid ${isError ? '#ef4444' : '#1abc9c'}`,
      color: isError ? '#ef4444' : '#0a1c16',
      padding: '12px 20px', borderRadius: 10,
      fontSize: '0.82rem',
      boxShadow: '0 8px 24px rgba(13,31,26,0.1)',
      animation: 'slideUp 0.2s ease',
    }}>
      {message}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function RepairsPage({ setPage, role }) {
  const [repairs,      setRepairs]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('All');
  const [assignTarget, setAssignTarget] = useState(null);
  const [saleRepair,   setSaleRepair]   = useState(null);  // ← NEW
  const [toast,        setToast]        = useState(null);  // ← NEW

  const isOwner = role === 'owner';

  const fetchRepairs = useCallback((signal) => {
    setLoading(prev => prev === true ? true : false);
    fetch('/api/repairs.php', { credentials: 'include', signal })
      .then(r => r.json())
      .then(data => {
        if (data.success) setRepairs(data.repairs ?? []);
        else setError(data.message);
      })
      .catch(err => { if (err.name !== 'AbortError') setError('Cannot connect to server.'); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchRepairs(ctrl.signal);
    const id = setInterval(() => fetchRepairs(ctrl.signal), POLL_INTERVAL);
    return () => { ctrl.abort(); clearInterval(id); };
  }, [fetchRepairs]);

  const handleAssigned = useCallback((requestId, techId, techObj) => {
    setRepairs(prev => prev.map(r =>
      r.request_id === requestId
        ? {
            ...r,
            technician_id:   techId,
            technician_name: techObj?.username ?? r.technician_name,
            status: r.status === 'Pending' ? 'In Progress' : r.status,
          }
        : r
    ));
  }, []);

  // ── NEW: handle sale created ──────────────────────────────────────
  const handleSaleCreated = useCallback(() => {
    setToast({ message: 'Sale created successfully!', isError: false });
    // Re-fetch so the sale button disappears for that repair if needed
    const ctrl = new AbortController();
    fetchRepairs(ctrl.signal);
  }, [fetchRepairs]);

  const counts = {
    All:           repairs.length,
    Pending:       repairs.filter(r => r.status === 'Pending').length,
    'In Progress': repairs.filter(r => r.status === 'In Progress').length,
    Completed:     repairs.filter(r => r.status === 'Completed').length,
  };

  const visible = repairs.filter(r => {
    const matchStatus = filter === 'All' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.customer_name?.toLowerCase().includes(q)
      || r.shop_name?.toLowerCase().includes(q)
      || r.device_type?.toLowerCase().includes(q)
      || r.issue_description?.toLowerCase().includes(q)
      || r.technician_name?.toLowerCase().includes(q)
      || String(r.request_id).includes(q);
    return matchStatus && matchSearch;
  });

  // owner has 2 extra cols: Technician + Sale
  const colCount = isOwner ? 9 : 7;

  return (
    <div className={styles.section}>

      {/* Modals */}
      {assignTarget && (
        <AssignModal
          repair={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={handleAssigned}
        />
      )}
      {saleRepair && (
        <CreateSaleModal
          repair={saleRepair}
          onClose={() => setSaleRepair(null)}
          onCreated={handleSaleCreated}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          isError={toast.isError}
          onDismiss={() => setToast(null)}
        />
      )}

      <div className={styles.sectionPageHeader}>
        <span className={styles.muted} style={{ fontSize: '0.78rem', lineHeight: 1 }}>
          {repairs.length} total
        </span>
      </div>

      <Panel title="Repair Requests">

        {/* ── Toolbar ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '10px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(26,188,156,0.08)',
        }}>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'In Progress', 'Completed'].map(f => {
              const active = filter === f;
              const pillColor = {
                All:           { active: 'rgba(13,31,26,0.08)',   border: 'rgba(13,31,26,0.18)',    text: '#0a1c16' },
                Pending:       { active: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.28)',  text: '#b45309' },
                'In Progress': { active: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', text: '#2563eb' },
                Completed:     { active: 'rgba(26,188,156,0.1)',  border: 'rgba(26,188,156,0.28)', text: '#1abc9c' },
              }[f];
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '4px 12px', borderRadius: '99px',
                    border: active ? `1px solid ${pillColor.border}` : '1px solid rgba(13,31,26,0.1)',
                    background: active ? pillColor.active : 'transparent',
                    color: active ? pillColor.text : 'rgba(13,31,26,0.4)',
                    fontSize: '0.72rem', fontWeight: 600,
                    fontFamily: 'inherit', cursor: 'pointer',
                    transition: 'all 0.15s', letterSpacing: '0.03em',
                  }}
                >
                  {f}
                  <span style={{
                    marginLeft: '5px', padding: '1px 5px', borderRadius: '99px',
                    background: active ? 'rgba(13,31,26,0.08)' : 'rgba(13,31,26,0.05)',
                    fontSize: '0.67rem',
                  }}>
                    {counts[f]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search repairs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: '8px',
              border: '1px solid rgba(13,31,26,0.14)',
              background: 'rgba(13,31,26,0.03)',
              color: '#0a1c16', fontSize: '0.8rem',
              fontFamily: 'inherit', outline: 'none',
              width: '100%', maxWidth: '200px',
              boxSizing: 'border-box', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(26,188,156,0.5)'}
            onBlur={e  => e.target.style.borderColor = 'rgba(13,31,26,0.14)'}
          />
        </div>

        {/* ── Table ── */}
        {loading ? (
          <TableSkeleton cols={colCount} rows={6} />
        ) : error ? (
          <div className={styles.errorMsg}>{error}</div>
        ) : visible.length === 0 ? (
          <div className={styles.empty}>
            {repairs.length === 0 ? 'No repair requests found.' : 'No repairs match your search.'}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table className={styles.table} style={{ minWidth: isOwner ? 820 : 580 }}>
                <thead>
                  <tr>
                    <th style={{ width: '72px' }}>#</th>
                    <th>Customer</th>
                    <th>Shop</th>
                    <th>Device</th>
                    <th>Issue</th>
                    <th style={{ width: '110px' }}>Date</th>
                    <th style={{ width: '120px' }}>Status</th>
                    {isOwner && <th style={{ width: '150px' }}>Technician</th>}
                    {isOwner && <th style={{ width: '120px' }}>Sale</th>}
                  </tr>
                </thead>
                <tbody>
                  {visible.map(r => (
                    <tr key={r.request_id}>
                      <td className={styles.muted} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        #{r.request_id}
                      </td>
                      <td className={styles.bold}>{r.customer_name}</td>
                      <td>{r.shop_name}</td>
                      <td style={{ fontWeight: 500 }}>{r.device_type}</td>
                      <td
                        className={styles.muted}
                        style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={r.issue_description}
                      >
                        {r.issue_description}
                      </td>
                      <td className={styles.muted}>
                        {new Date(r.created_at).toLocaleDateString('en-PH', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td>
                        <Badge variant={repairBadge[r.status] ?? 'pending'}>
                          {r.status}
                        </Badge>
                      </td>

                      {/* Owner-only: Technician cell */}
                      {isOwner && (
                        <td>
                          {r.technician_name ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#0a1c16', lineHeight: 1.2 }}>
                                {r.technician_name}
                              </span>
                              {r.status !== 'Completed' && (
                                <button
                                  onClick={() => setAssignTarget(r)}
                                  title="Reassign technician"
                                  style={{
                                    padding: '2px 7px', borderRadius: '5px',
                                    border: '1px solid rgba(13,31,26,0.14)',
                                    background: 'rgba(13,31,26,0.04)',
                                    color: 'rgba(13,31,26,0.45)',
                                    fontSize: '0.67rem', fontWeight: 600,
                                    fontFamily: 'inherit', cursor: 'pointer',
                                    transition: 'all 0.13s', whiteSpace: 'nowrap',
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background   = 'rgba(26,188,156,0.08)';
                                    e.currentTarget.style.borderColor  = 'rgba(26,188,156,0.3)';
                                    e.currentTarget.style.color        = '#1abc9c';
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background   = 'rgba(13,31,26,0.04)';
                                    e.currentTarget.style.borderColor  = 'rgba(13,31,26,0.14)';
                                    e.currentTarget.style.color        = 'rgba(13,31,26,0.45)';
                                  }}
                                >
                                  Reassign
                                </button>
                              )}
                            </div>
                          ) : (
                            r.status === 'Completed' ? (
                              <span className={styles.muted} style={{ fontSize: '0.75rem' }}>—</span>
                            ) : (
                              <button
                                onClick={() => setAssignTarget(r)}
                                style={{
                                  padding: '4px 10px', borderRadius: '6px',
                                  border: '1px solid rgba(26,188,156,0.35)',
                                  background: 'rgba(26,188,156,0.06)',
                                  color: '#1abc9c', fontSize: '0.73rem',
                                  fontWeight: 700, fontFamily: 'inherit',
                                  cursor: 'pointer', transition: 'all 0.13s', whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background  = 'rgba(26,188,156,0.14)';
                                  e.currentTarget.style.borderColor = 'rgba(26,188,156,0.6)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background  = 'rgba(26,188,156,0.06)';
                                  e.currentTarget.style.borderColor = 'rgba(26,188,156,0.35)';
                                }}
                              >
                                + Assign
                              </button>
                            )
                          )}
                        </td>
                      )}

                      {/* Owner-only: Sale cell ── NEW */}
                      {isOwner && (
                        <td>
                          {r.status === 'Completed' && r.technician_id ? (
                            <button
                              onClick={() => setSaleRepair(r)}
                              style={{
                                padding: '4px 12px', borderRadius: '7px',
                                border: 'none',
                                background: '#1abc9c',
                                color: '#fff',
                                fontSize: '0.72rem', fontWeight: 700,
                                fontFamily: 'inherit', cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 2px 8px rgba(26,188,156,0.25)',
                                transition: 'all 0.13s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#17a589'}
                              onMouseLeave={e => e.currentTarget.style.background = '#1abc9c'}
                            >
                              Create Sale
                            </button>
                          ) : r.status === 'Completed' && !r.technician_id ? (
                            <span style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 600 }}>
                              Assign tech first
                            </span>
                          ) : (
                            <span className={styles.muted} style={{ fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 16px',
              borderTop: '1px solid rgba(13,31,26,0.05)',
              fontSize: '0.73rem', color: 'rgba(13,31,26,0.35)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 8,
            }}>
              <span>Showing {visible.length} of {repairs.length} repairs</span>
              {(search || filter !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setFilter('All'); }}
                  style={{
                    background: 'none', border: 'none',
                    color: '#1abc9c', fontSize: '0.73rem',
                    cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
                  }}
                >
                  Clear filters ✕
                </button>
              )}
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}