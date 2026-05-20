// src/pages/TechnicianDashboard.jsx
//
// CHANGES vs original:
//  1. Imports useChatUnread hook
//  2. Chat buttons in the repairs table now show per-repair unread badge
//  3. Accepts onUnreadChatChange prop to bubble totalUnread up to Topbar

import { useState, useEffect, useCallback } from 'react';
import Panel      from '../components/shared/Panel';
import Badge      from '../components/shared/Badge';
import ChatWindow from '../components/dashboard/ChatWindow';
import { useChatUnread } from '../hooks/useChatUnread';   // ← NEW
import styles     from './TechnicianDashboard.module.css';

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

// ── Stars ─────────────────────────────────────────────────────────────────
function Stars({ rating, max = 5 }) {
  return (
    <span className={styles.stars}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} className={`${styles.star} ${i >= rating ? styles.starEmpty : ''}`} viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

// ── Reviews Section ────────────────────────────────────────────────────────
function ReviewsSection({ reviews, loading, onRefresh }) {
  if (loading) return <div className={styles.center}>Loading reviews…</div>;

  if (!reviews.length) return (
    <div className={styles.center}>
      No reviews yet.
      <button onClick={onRefresh} style={{marginLeft:12,background:'transparent',border:'1px solid rgba(26,188,156,0.3)',color:'var(--color-teal)',fontSize:'0.76rem',fontWeight:700,padding:'4px 12px',borderRadius:6,cursor:'pointer'}}>Refresh</button>
    </div>
  );

  const avg = (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1);

  return (
    <div>
      <div className={styles.sectionPageHeader}>
        <h2 className={styles.sectionTitle}>Customer Reviews</h2>
        <div className={styles.ratingOverall}>
          <span className={styles.ratingMuted}>Overall rating:</span>
          <span className={styles.ratingValue}>{avg}</span>
          <Stars rating={Math.round(avg)} />
          <span className={styles.ratingMuted}>({reviews.length} reviews)</span>
          <button onClick={onRefresh} style={{marginLeft:12,background:'transparent',border:'1px solid rgba(26,188,156,0.3)',color:'var(--color-teal)',fontSize:'0.76rem',fontWeight:700,padding:'4px 12px',borderRadius:6,cursor:'pointer'}}>Refresh</button>
        </div>
      </div>
      <Panel title="All Reviews">
        <div className={styles.reviewList}>
          {reviews.map((rv, i) => (
            <div key={rv.review_id ?? i} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div>
                  <div className={styles.reviewCustomer}>{rv.customer_name}</div>
                  <div className={styles.reviewDevice}>{rv.device_type}</div>
                </div>
                <div className={styles.reviewMeta}>
                  <Stars rating={Number(rv.rating)} />
                  <span className={styles.reviewDate}>{rv.created_at ? new Date(rv.created_at).toLocaleDateString() : ''}</span>
                </div>
              </div>
              {rv.comment && <div className={styles.reviewComment}>"{rv.comment}"</div>}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ── Chat Modal ─────────────────────────────────────────────────────────────
function ChatModal({ repair, technicianId, username, onClose }) {
  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose(); };
  return (
    <div onClick={handleBackdrop} style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',
      display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:1000,padding:'1rem',
    }}>
      <div style={{
        width:'100%',maxWidth:480,height:560,
        borderRadius:16,overflow:'hidden',
        boxShadow:'0 24px 64px rgba(0,0,0,0.5)',
        display:'flex',flexDirection:'column',position:'relative',
      }}>
        <button onClick={onClose} style={{
          position:'absolute',top:10,right:10,zIndex:10,
          background:'rgba(0,0,0,0.2)',border:'none',
          color:'#fff',width:28,height:28,borderRadius:'50%',
          cursor:'pointer',fontSize:'0.9rem',display:'flex',
          alignItems:'center',justifyContent:'center',
        }}>✕</button>
        <ChatWindow
          repairId={repair.request_id}
          currentUserId={technicianId}
          currentUserName={username}
          technicianId={technicianId}
          customerId={repair.customer_id}
        />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
//
// NEW PROP:
//   onUnreadChatChange(count)
//     — Bubble totalUnread up so the parent can pass it to <Topbar>.
//
export default function TechnicianDashboard({
  setPage,
  activeSection = 'repairs',
  setActiveSection,
  userId,
  username = 'Technician',
  onUnreadChatChange,   // ← NEW
}) {
  const [repairs,    setRepairs]    = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [revLoading, setRevLoading] = useState(false);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [notes,      setNotes]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);
  const [chatRepair, setChatRepair] = useState(null);

  // ── NEW: centralised unread chat counts ──────────────────────────────────
  const { totalUnread, perRepairUnread, clearRepair } = useChatUnread(userId, repairs);

  useEffect(() => {
    onUnreadChatChange?.(totalUnread);
  }, [totalUnread, onUnreadChatChange]);
  // ────────────────────────────────────────────────────────────────────────

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchRepairs = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch('/api/repairs.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setRepairs(data.repairs ?? []);
      else setError(data.message);
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    try {
      setRevLoading(true);
      const res  = await fetch('/api/reviews.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setReviews(data.reviews ?? []);
    } catch { }
    finally { setRevLoading(false); }
  }, []);

  useEffect(() => { fetchRepairs(); }, [fetchRepairs]);
  useEffect(() => { if (activeSection === 'reviews') fetchReviews(); }, [activeSection]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast  = (message, isError = false) => { setToast({ message, isError }); setTimeout(() => setToast(null), 3000); };
  const openModal  = (repair) => { setSelected(repair); setNotes(repair.technician_notes ?? ''); };
  const closeModal = ()       => { setSelected(null); setNotes(''); };

  const saveUpdate = async (newStatus) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res  = await fetch('/api/repairs.php', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: selected.request_id, status: newStatus ?? selected.status, technician_notes: notes }),
      });
      const data = await res.json();
      if (data.success) { showToast('✓ Repair updated successfully.'); closeModal(); fetchRepairs(); }
      else { showToast('⚠ ' + data.message, true); }
    } catch { showToast('⚠ Cannot connect to server.', true); }
    finally { setSaving(false); }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const total      = repairs.length;
  const inProgress = repairs.filter(r => r.status === 'In Progress').length;
  const pending    = repairs.filter(r => r.status === 'Pending').length;
  const completed  = repairs.filter(r => r.status === 'Completed').length;

  const statCards = [
    { label: 'Total Assigned', value: total,      color: 'var(--color-teal)' },
    { label: 'In Progress',    value: inProgress, color: '#facc15'           },
    { label: 'Pending',        value: pending,    color: '#fb923c'           },
    { label: 'Completed',      value: completed,  color: '#4ade80'           },
  ];

  // ── Repairs Table (with chat badges) ─────────────────────────────────────
  const repairsTable = (list) => (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th><th>Customer</th><th>Shop</th><th>Device</th>
            <th>Issue</th><th>Date</th><th>Status</th><th>Action</th><th>Chat</th>
          </tr>
        </thead>
        <tbody>
          {list.map(r => {
            const unread = perRepairUnread[r.request_id] ?? 0;
            return (
              <tr key={r.request_id}>
                <td className={styles.idCol}>#{r.request_id}</td>
                <td className={styles.bold}>{r.customer_name}</td>
                <td>{r.shop_name}</td>
                <td>{r.device_type}</td>
                <td className={styles.muted} style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={r.issue_description}>{r.issue_description}</td>
                <td className={styles.muted}>{new Date(r.created_at).toLocaleDateString()}</td>
                <td><Badge status={statusBadge[r.status] ?? 'pending'} /></td>
                <td><button className={styles.reviewBtn} onClick={() => openModal(r)}>Review</button></td>
                <td>
                  {/* ── Chat button with unread badge ── */}
                  <button
                    onClick={() => {
                      setChatRepair(r);
                      clearRepair?.(r.request_id);  // clear badge immediately on click
                    }}
                    style={{
                      position:'relative',
                      background:'rgba(59,130,246,0.1)',
                      border:'1px solid rgba(59,130,246,0.3)',
                      color:'#60a5fa',fontSize:'0.76rem',fontWeight:700,
                      padding:'4px 12px',borderRadius:6,cursor:'pointer',
                      whiteSpace:'nowrap',transition:'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                  >
                    💬 Chat
                    {unread > 0 && (
                      <span style={{
                        position:'absolute',top:-6,right:-6,
                        background:'#ef4444',color:'#fff',
                        fontSize:'0.6rem',fontWeight:700,
                        minWidth:16,height:16,borderRadius:'50%',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        padding:'0 3px',lineHeight:1,
                        boxShadow:'0 1px 4px rgba(239,68,68,0.4)',
                        animation:'chatBtnBadgePop 0.25s ease',
                      }}>
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  <style>{`@keyframes chatBtnBadgePop{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.isError ? styles.toastError : styles.toastSuccess}`}>
          {toast.message}
        </div>
      )}

      {/* Chat Modal */}
      {chatRepair && (
        <ChatModal repair={chatRepair} technicianId={userId} username={username} onClose={() => setChatRepair(null)} />
      )}

      {/* ── MY JOBS ── */}
      {(activeSection === 'repairs' || activeSection === 'dashboard') && (
        <>
          <div className={styles.statStrip}>
            {statCards.map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
          <Panel title="All Assigned Repairs" linkLabel={`${repairs.length} total`}>
            {loading  ? <div className={styles.center}>Loading repairs…</div>
            : error   ? <div className={styles.centerError}>{error}</div>
            : repairs.length === 0 ? <div className={styles.center}>No repairs assigned yet.</div>
            : repairsTable(repairs)}
          </Panel>
        </>
      )}

      {/* ── REVIEWS ── */}
      {activeSection === 'reviews' && (
        <ReviewsSection reviews={reviews} loading={revLoading} onRefresh={fetchReviews} />
      )}

      {/* ── Update / Notes Modal ── */}
      {selected && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Repair #{selected.request_id} — {selected.device_type}</div>
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                {[
                  { label: 'Customer', value: selected.customer_name },
                  { label: 'Shop',     value: selected.shop_name     },
                  { label: 'Device',   value: selected.device_type   },
                  { label: 'Status',   value: <Badge status={statusBadge[selected.status]} /> },
                ].map(row => (
                  <div key={row.label} className={styles.infoItem}>
                    <span className={styles.infoLabel}>{row.label}</span>
                    <span className={styles.infoValue}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className={styles.section}>
                <div className={styles.sectionLabel}>Issue Description</div>
                <div className={styles.issueBox}>{selected.issue_description}</div>
              </div>
              <div className={styles.section}>
                <div className={styles.sectionLabel}>Technician Notes</div>
                <textarea className={styles.notesArea} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add your notes here…" rows={4} />
              </div>
              <div className={styles.section}>
                <div className={styles.sectionLabel}>Update Status</div>
                <div className={styles.statusSteps}>
                  {STATUSES.map((s, i) => (
                    <div key={s} className={[styles.step, selected.status===s?styles.stepActive:'', STATUSES.indexOf(selected.status)>i?styles.stepDone:''].join(' ')}>
                      <div className={styles.stepDot}>{i + 1}</div>
                      <div className={styles.stepLabel}>{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.saveNotesBtn} onClick={() => saveUpdate(null)} disabled={saving}>{saving?'Saving…':'Save Notes'}</button>
              {statusNext[selected.status] && (
                <button className={styles.advanceBtn} onClick={() => saveUpdate(statusNext[selected.status])} disabled={saving}>{saving?'Saving…':`Mark as "${statusNext[selected.status]}"`}</button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}