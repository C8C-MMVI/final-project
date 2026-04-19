// src/pages/TechnicianDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import Panel  from '../components/shared/Panel';
import Badge  from '../components/shared/Badge';
import styles from '../components/layout/DashboardLayout.module.css';
import tStyles from './TechnicianDashboard.module.css';

const STATUSES = ['Pending', 'In Progress', 'Completed'];

const statusNext = {
  'Pending':     'In Progress',
  'In Progress': 'Completed',
  'Completed':   null,
};

const statusBadge = {
  'Pending':     'pending',
  'In Progress': 'progress',
  'Completed':   'done',
};

export default function TechnicianDashboard({ setPage }) {
  const [repairs,  setRepairs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);

  // ── Fetch repairs ─────────────────────────────────────────────────────────
  const fetchRepairs = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/repairs.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setRepairs(data.repairs);
      else setError(data.message);
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRepairs(); }, [fetchRepairs]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openModal = (repair) => {
    setSelected(repair);
    setNotes(repair.technician_notes ?? '');
  };

  const closeModal = () => {
    setSelected(null);
    setNotes('');
  };

  // ── Save update ───────────────────────────────────────────────────────────
  const saveUpdate = async (newStatus) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res  = await fetch('/api/repairs.php', {
        method:      'PATCH',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          request_id:       selected.request_id,
          status:           newStatus ?? selected.status,
          technician_notes: notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Repair updated successfully.');
        closeModal();
        fetchRepairs();
      } else {
        showToast('⚠ ' + data.message, true);
      }
    } catch {
      showToast('⚠ Cannot connect to server.', true);
    } finally {
      setSaving(false);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const total      = repairs.length;
  const inProgress = repairs.filter(r => r.status === 'In Progress').length;
  const pending    = repairs.filter(r => r.status === 'Pending').length;
  const completed  = repairs.filter(r => r.status === 'Completed').length;

  return (
    <main className={styles.content}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`${tStyles.toast} ${toast.isError ? tStyles.toastError : tStyles.toastSuccess}`}>
          {toast.message}
        </div>
      )}

      {/* ── Stat strip ── */}
      <div className={tStyles.statStrip}>
        {[
          { label: 'Total Assigned', value: total,      color: 'var(--color-teal)'   },
          { label: 'In Progress',    value: inProgress, color: '#facc15'             },
          { label: 'Pending',        value: pending,    color: '#fb923c'             },
          { label: 'Completed',      value: completed,  color: '#4ade80'             },
        ].map(s => (
          <div key={s.label} className={tStyles.statCard}>
            <div className={tStyles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={tStyles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Repairs table ── */}
      <Panel title="My Assigned Repairs" onLink={() => setPage('inventory')} linkLabel="Inventory Summary →">
        {loading ? (
          <div className={tStyles.center}>Loading repairs…</div>
        ) : error ? (
          <div className={tStyles.centerError}>{error}</div>
        ) : repairs.length === 0 ? (
          <div className={tStyles.center}>No repairs assigned yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Device</th>
                <th>Issue</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map(r => (
                <tr key={r.request_id}>
                  <td className={styles.idCol}>#{r.request_id}</td>
                  <td className={styles.bold}>{r.customer_name}</td>
                  <td>{r.shop_name}</td>
                  <td>{r.device_type}</td>
                  <td className={tStyles.issueCell}>{r.issue_description}</td>
                  <td className={styles.muted}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td><Badge status={statusBadge[r.status] ?? 'pending'} /></td>
                  <td>
                    <button className={tStyles.reviewBtn} onClick={() => openModal(r)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* ── Modal ── */}
      {selected && (
        <div className={tStyles.overlay} onClick={closeModal}>
          <div className={tStyles.modal} onClick={e => e.stopPropagation()}>

            <div className={tStyles.modalHeader}>
              <div className={tStyles.modalTitle}>
                Repair #{selected.request_id} — {selected.device_type}
              </div>
              <button className={tStyles.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <div className={tStyles.modalBody}>

              {/* Info grid */}
              <div className={tStyles.infoGrid}>
                {[
                  { label: 'Customer', value: selected.customer_name },
                  { label: 'Shop',     value: selected.shop_name     },
                  { label: 'Device',   value: selected.device_type   },
                  { label: 'Status',   value: <Badge status={statusBadge[selected.status]} /> },
                ].map(row => (
                  <div key={row.label} className={tStyles.infoItem}>
                    <span className={tStyles.infoLabel}>{row.label}</span>
                    <span className={tStyles.infoValue}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Issue description */}
              <div className={tStyles.section}>
                <div className={tStyles.sectionLabel}>Issue Description</div>
                <div className={tStyles.issueBox}>{selected.issue_description}</div>
              </div>

              {/* Technician notes */}
              <div className={tStyles.section}>
                <div className={tStyles.sectionLabel}>Technician Notes</div>
                <textarea
                  className={tStyles.notesArea}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add your notes here…"
                  rows={4}
                />
              </div>

              {/* Status progress */}
              <div className={tStyles.section}>
                <div className={tStyles.sectionLabel}>Update Status</div>
                <div className={tStyles.statusSteps}>
                  {STATUSES.map((s, i) => (
                    <div
                      key={s}
                      className={[
                        tStyles.step,
                        selected.status === s                           ? tStyles.stepActive : '',
                        STATUSES.indexOf(selected.status) > i          ? tStyles.stepDone   : '',
                      ].join(' ')}
                    >
                      <div className={tStyles.stepDot}>{i + 1}</div>
                      <div className={tStyles.stepLabel}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className={tStyles.modalFooter}>
              <button
                className={tStyles.saveNotesBtn}
                onClick={() => saveUpdate(null)}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Notes'}
              </button>

              {statusNext[selected.status] && (
                <button
                  className={tStyles.advanceBtn}
                  onClick={() => saveUpdate(statusNext[selected.status])}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : `Mark as "${statusNext[selected.status]}"`}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </main>
  );
}