// src/pages/AdminDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import Panel from "../components/shared/Panel";
import AlertItem from "../components/shared/AlertItem";
import Badge from "../components/shared/Badge";
import styles from "./AdminDashboard.module.css";

const DASHBOARD_INTERVAL = 60_000;
const ALERTS_INTERVAL    = 60_000;
const SECTION_INTERVAL   = 30_000;

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  const iconMap = {
    teal: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    blue: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
    orange: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>),
    purple: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>),
  };
  return (
    <div className={styles.statCard}>
      <div className={styles.statHeader}>
        <span className={styles.statLabel}>{label}</span>
        <div className={`${styles.statIcon} ${styles[`icon_${color}`]}`}>{iconMap[color]}</div>
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function TableSkeleton({ cols = 4, rows = 5 }) {
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

function AlertSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className={styles.skeletonCell} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "technician" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.username || !form.password) { setError("Username and password are required."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/users.php", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); } else setError(data.message);
    } catch { setError("Server error."); } finally { setLoading(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Add New Member</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          {error && <div className={styles.formError}>{error}</div>}
          <div className={styles.formGroup}><label className={styles.formLabel}>Username *</label><input className={styles.formInput} value={form.username} onChange={(e) => set("username", e.target.value)} /></div>
          <div className={styles.formGroup}><label className={styles.formLabel}>Email</label><input className={styles.formInput} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div className={styles.formGroup}><label className={styles.formLabel}>Password *</label><input className={styles.formInput} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} /></div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Role</label>
            <select className={styles.formSelect} value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="technician">Technician</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>{loading ? "Adding…" : "Add Member"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Shop Detail Modal ─────────────────────────────────────────────────────────
const DOCS = [
  { field: 'dti_permit',      label: 'DTI Permit'      },
  { field: 'nc3_certificate', label: 'NC3 Certificate'  },
  { field: 'bir_permit',      label: 'BIR Permit'       },
  { field: 'dit_permit',      label: 'DIT Permit'       },
  { field: 'ntc_permit',      label: 'NTC Permit'       },
];

// Converts the stored relative path "uploads/shop_docs/filename.pdf"
// → "/api/serve_doc.php?file=filename.pdf"
// Files are served securely behind session auth by php/api/serve_doc.php.
function getDocUrl(path) {
  if (!path) return null;
  // path stored in DB is e.g. "uploads/shop_docs/1716000000_abc_dti_permit.pdf"
  const filename = path.split('/').pop();
  return `/api/serve_doc.php?file=${encodeURIComponent(filename)}`;
}

function getExt(path) {
  if (!path) return '';
  return path.split('.').pop().toLowerCase();
}

function DocIcon({ ext }) {
  const isPdf = ext === 'pdf';
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={isPdf ? '#ef4444' : '#3b82f6'}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      {isPdf
        ? <text x="6" y="18" fontSize="5" fill="#ef4444" stroke="none" fontWeight="bold">PDF</text>
        : <><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></>
      }
    </svg>
  );
}

function ShopDetailModal({ shop, onClose, onApprove, onReject, approvingId }) {
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  const isPending = shop.status?.toLowerCase() === 'pending';

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,28,22,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16,
          width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          border: '1px solid rgba(26,188,156,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid rgba(13,31,26,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0a1c16' }}>
              {shop.shop_name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(13,31,26,0.45)', marginTop: 2 }}>
              Shop Registration Details
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(13,31,26,0.06)', border: 'none',
              borderRadius: 8, width: 32, height: 32,
              cursor: 'pointer', fontSize: '1rem', color: 'rgba(13,31,26,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Shop Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(13,31,26,0.35)' }}>
              Shop Information
            </div>
            {[
              { label: 'Owner',       value: shop.owner_name      },
              { label: 'Email',       value: shop.email           },
              { label: 'Address',     value: shop.address         },
              { label: 'Contact',     value: shop.contact_number  },
              { label: 'Description', value: shop.description || '—' },
              { label: 'Submitted',   value: formatDate(shop.created_at)  },
              { label: 'Reviewed At', value: formatDate(shop.reviewed_at) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 12, fontSize: '0.83rem' }}>
                <span style={{ width: 100, flexShrink: 0, color: 'rgba(13,31,26,0.45)', fontWeight: 600 }}>{label}</span>
                <span style={{ color: '#0a1c16', flex: 1, wordBreak: 'break-word' }}>{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(13,31,26,0.35)' }}>
              Submitted Documents
            </div>
            {DOCS.map(({ field, label }) => {
              const path = shop[field];
              const url  = getDocUrl(path);
              const ext  = getExt(path);
              return (
                <div key={field} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 9,
                  border: path
                    ? '1px solid rgba(26,188,156,0.25)'
                    : '1px dashed rgba(13,31,26,0.12)',
                  background: path ? 'rgba(26,188,156,0.03)' : 'rgba(13,31,26,0.02)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {path ? <DocIcon ext={ext} /> : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(13,31,26,0.25)" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    )}
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: path ? '#0a1c16' : 'rgba(13,31,26,0.35)' }}>
                      {label}
                    </span>
                  </div>
                  {url ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* View — opens in new tab */}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.74rem', fontWeight: 700,
                          color: '#1abc9c', textDecoration: 'none',
                          padding: '4px 10px', borderRadius: 6,
                          border: '1px solid rgba(26,188,156,0.3)',
                          background: 'rgba(26,188,156,0.06)',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,188,156,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(26,188,156,0.06)'}
                      >
                        View
                      </a>
                      {/* Download — triggers attachment download */}
                      <a
                        href={`${url}&download`}
                        download
                        style={{
                          fontSize: '0.74rem', fontWeight: 700,
                          color: '#6366f1', textDecoration: 'none',
                          padding: '4px 10px', borderRadius: 6,
                          border: '1px solid rgba(99,102,241,0.3)',
                          background: 'rgba(99,102,241,0.06)',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'rgba(13,31,26,0.3)' }}>Not uploaded</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer — approve/reject if pending */}
        {isPending && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid rgba(13,31,26,0.08)',
            display: 'flex', gap: 10, justifyContent: 'flex-end',
          }}>
            <button
              onClick={() => { onReject(shop.shop_id); onClose(); }}
              disabled={approvingId === shop.shop_id}
              style={{
                padding: '9px 20px', borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.07)', color: '#ef4444',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              Reject
            </button>
            <button
              onClick={() => { onApprove(shop.shop_id); onClose(); }}
              disabled={approvingId === shop.shop_id}
              style={{
                padding: '9px 20px', borderRadius: 8, border: 'none',
                background: '#1abc9c', color: '#fff',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(26,188,156,0.3)',
              }}
            >
              {approvingId === shop.shop_id ? 'Processing…' : 'Approve'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Badge variant maps ────────────────────────────────────────────────────────
const shopBadge   = { approved: "completed", pending: "pending", rejected: "cancelled" };
const logBadge    = { danger: "cancelled", warn: "pending", info: "completed" };
const repairBadge = { Pending: "pending", "In Progress": "progress", Completed: "completed" };
const statusLabel = { Pending: "Submitted repair request", "In Progress": "Repair in progress", Completed: "Completed job" };
const REPAIR_STATUSES = ["All", "Pending", "In Progress", "Completed"];

const navItems = [
  { label: "Dashboard",       key: "dashboard" },
  { label: "Repairs",         key: "repairs" },
  { label: "User Management", key: "userManagement" },
  { label: "Shop Requests",   key: "shopRequests" },
  { label: "System Logs",     key: "systemLogs" },
];

// ════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard({ setPage, activeSection = "dashboard", setActiveSection }) {
  const [stats, setStats]               = useState(null);
  const [activity, setActivity]         = useState([]);
  const [alerts, setAlerts]             = useState([]);
  const [users, setUsers]               = useState([]);
  const [shopRequests, setShopRequests] = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [repairs, setRepairs]           = useState([]);

  const [loadingDash, setLoadingDash]       = useState(true);
  const [loadingAlerts, setLoadingAlerts]   = useState(true);
  const [loadingUsers, setLoadingUsers]     = useState(false);
  const [loadingShops, setLoadingShops]     = useState(false);
  const [loadingLogs, setLoadingLogs]       = useState(false);
  const [loadingRepairs, setLoadingRepairs] = useState(false);
  const [dashError, setDashError]           = useState("");
  const [alertsError, setAlertsError]       = useState("");

  const [showAddUser, setShowAddUser] = useState(false);
  const [deletingId, setDeletingId]   = useState(null);
  const [updatingId, setUpdatingId]   = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [updateError, setUpdateError] = useState("");
  const [selectedShop, setSelectedShop] = useState(null);

  const [repairSearch, setRepairSearch] = useState("");
  const [repairStatus, setRepairStatus] = useState("All");

  const filteredRepairs = useMemo(() => {
    const q = repairSearch.trim().toLowerCase();
    return repairs.filter((r) => {
      const matchStatus = repairStatus === "All" || r.status === repairStatus;
      const matchSearch = !q || (r.customer_name ?? "").toLowerCase().includes(q) || (r.technician_name ?? "").toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [repairs, repairSearch, repairStatus]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchDashboard = useCallback((signal) => {
    fetch("/api/dashboard.php", { credentials: "include", signal })
      .then((r) => r.json())
      .then((d) => { if (d.success) { setStats(d.stats); setActivity(d.activity ?? []); } else setDashError(d.message); })
      .catch((err) => { if (err.name !== "AbortError") setDashError("Cannot connect to server."); })
      .finally(() => setLoadingDash(false));
  }, []);

  const fetchAlerts = useCallback((signal) => {
    fetch("/api/notifications.php", { credentials: "include", signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.notifications)) {
          const mapped = d.notifications.map((n) => {
            const msg = (n.message ?? "").toLowerCase();
            let type = "info";
            if (msg.includes("login") || msg.includes("fail") || msg.includes("error") || msg.includes("danger")) type = "danger";
            else if (msg.includes("pending") || msg.includes("request") || msg.includes("warn")) type = "warn";
            const diff  = Date.now() - new Date(n.created_at).getTime();
            const mins  = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days  = Math.floor(diff / 86400000);
            let time = "just now";
            if (days >= 1) time = `${days}d ago`;
            else if (hours >= 1) time = `${hours}h ago`;
            else if (mins >= 1) time = `${mins}m ago`;
            return { notification_id: n.notification_id, title: n.message, sub: n.is_read ? "Read" : "Unread", type, time, is_read: n.is_read };
          });
          setAlerts(mapped);
        } else setAlertsError(d.message ?? "Failed to load alerts.");
      })
      .catch((err) => { if (err.name !== "AbortError") setAlertsError("Cannot load alerts."); })
      .finally(() => setLoadingAlerts(false));
  }, []);

  const fetchRepairs = useCallback((signal) => {
    setLoadingRepairs(true);
    fetch("/api/repairs.php", { credentials: "include", signal })
      .then((r) => r.json())
      .then((d) => { if (d.success) setRepairs(d.repairs ?? []); })
      .catch(() => {})
      .finally(() => setLoadingRepairs(false));
  }, []);

  const fetchUsers = useCallback((signal) => {
    setLoadingUsers(true);
    fetch("/api/users.php", { credentials: "include", signal })
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsers(d.users ?? []); })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const fetchShops = useCallback((signal) => {
    setLoadingShops(true);
    fetch("/api/shop_requests.php", { credentials: "include", signal })
      .then((r) => r.json())
      .then((d) => { if (d.success) setShopRequests(d.requests ?? []); })
      .catch(() => {})
      .finally(() => setLoadingShops(false));
  }, []);

  const fetchLogs = useCallback((signal) => {
    setLoadingLogs(true);
    fetch("/api/system_logs.php", { credentials: "include", signal })
      .then((r) => r.json())
      .then((d) => { if (d.success) setLogs(d.logs ?? []); })
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  }, []);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    fetchDashboard(ctrl.signal);
    const id = setInterval(() => fetchDashboard(ctrl.signal), DASHBOARD_INTERVAL);
    return () => { ctrl.abort(); clearInterval(id); };
  }, [fetchDashboard]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchAlerts(ctrl.signal);
    const id = setInterval(() => fetchAlerts(ctrl.signal), ALERTS_INTERVAL);
    return () => { ctrl.abort(); clearInterval(id); };
  }, [fetchAlerts]);

  useEffect(() => {
    const ctrl = new AbortController();
    let id;
    if (activeSection === "repairs")             { fetchRepairs(ctrl.signal); id = setInterval(() => fetchRepairs(ctrl.signal), SECTION_INTERVAL); }
    else if (activeSection === "userManagement") { fetchUsers(ctrl.signal);   id = setInterval(() => fetchUsers(ctrl.signal),   SECTION_INTERVAL); }
    else if (activeSection === "shopRequests")   { fetchShops(ctrl.signal);   id = setInterval(() => fetchShops(ctrl.signal),   SECTION_INTERVAL); }
    else if (activeSection === "systemLogs")     { fetchLogs(ctrl.signal);    id = setInterval(() => fetchLogs(ctrl.signal),    SECTION_INTERVAL); }
    return () => { ctrl.abort(); if (id) clearInterval(id); };
  }, [activeSection, fetchRepairs, fetchUsers, fetchShops, fetchLogs]);

  useEffect(() => { if (activeSection !== "userManagement") setUpdateError(""); }, [activeSection]);
  useEffect(() => { if (activeSection !== "repairs") { setRepairSearch(""); setRepairStatus("All"); } }, [activeSection]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSection = (key) => { if (setActiveSection) setActiveSection(key); };

  const handleMarkRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications.php?action=read&id=${notificationId}`, { method: "PATCH", credentials: "include" });
      setAlerts((prev) => prev.map((a) => a.notification_id === notificationId ? { ...a, is_read: true, sub: "Read" } : a));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications.php?action=read_all", { method: "PATCH", credentials: "include" });
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true, sub: "Read" })));
    } catch {}
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(userId);
    try {
      const res = await fetch("/api/users.php", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId }) });
      const data = await res.json();
      if (data.success) setUsers((u) => u.filter((x) => x.user_id !== userId));
    } catch {} finally { setDeletingId(null); }
  };

  const handleUpdate = async (userId, action, value) => {
    setUpdateError(""); setUpdatingId(userId);
    try {
      const res = await fetch("/api/update_user.php", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, action, value }) });
      const data = await res.json();
      if (data.success) setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, [action]: value } : u));
      else setUpdateError(data.message || "Failed to update user.");
    } catch { setUpdateError("Server error. Please try again."); } finally { setUpdatingId(null); }
  };

  const handleShopAction = async (shopId, action) => {
    setApprovingId(shopId);
    try {
      const res = await fetch("/api/shop_requests.php", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shop_id: shopId, action }) });
      const data = await res.json();
      if (data.success) {
        setShopRequests((prev) => prev.map((s) => s.shop_id === shopId ? { ...s, status: data.status } : s));
        // Keep the modal in sync if it's still open for this shop
        setSelectedShop((prev) => prev?.shop_id === shopId ? { ...prev, status: data.status } : prev);
      }
    } catch {} finally { setApprovingId(null); }
  };

  const statCards = stats ? [
    { label: "Total Users",   value: stats.total_users.toString(),                       sub: "Registered accounts",    color: "teal"   },
    { label: "Active Shops",  value: stats.active_shops.toString(),                      sub: "Shops in system",        color: "blue"   },
    { label: "Open Repairs",  value: stats.open_repairs.toString(),                      sub: "Pending or in progress", color: "orange" },
    { label: "Total Revenue", value: `₱${Number(stats.total_revenue).toLocaleString()}`, sub: "All time",               color: "purple" },
  ] : [];

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className={styles.wrapper}>

      {/* ── Shop Detail Modal ── */}
      {selectedShop && (
        <ShopDetailModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onApprove={(id) => handleShopAction(id, 'approve')}
          onReject={(id) => handleShopAction(id, 'reject')}
          approvingId={approvingId}
        />
      )}

      {/* Tabs */}
      <nav className={styles.tabs}>
        {navItems.map((n) => (
          <button key={n.key} className={`${styles.tab} ${activeSection === n.key ? styles.tabActive : ""}`} onClick={() => handleSection(n.key)}>
            {n.label}
          </button>
        ))}
      </nav>

      {/* ═══ DASHBOARD ═══ */}
      {activeSection === "dashboard" && (
        <div className={styles.section}>
          {loadingDash ? (
            <div className={styles.cardsGrid}>{[1,2,3,4].map((i) => <div key={i} className={`${styles.statCard} ${styles.skeletonCard}`} />)}</div>
          ) : dashError ? (
            <div className={styles.errorMsg}>{dashError}</div>
          ) : (
            <div className={styles.cardsGrid}>{statCards.map((s, i) => <StatCard key={i} {...s} />)}</div>
          )}
          <div className={styles.twoCol}>
            <Panel title="Recent Activity" linkLabel="View all →" onLink={() => handleSection("repairs")}>
              {loadingDash ? <TableSkeleton cols={4} rows={5} /> : activity.length === 0 ? (
                <div className={styles.empty}>No recent activity.</div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead><tr><th>User</th><th>Action</th><th>Shop</th><th>Date</th></tr></thead>
                    <tbody>
                      {activity.map((a, i) => (
                        <tr key={i}>
                          <td className={styles.bold}>{a.username}</td>
                          <td>{statusLabel[a.status] ?? a.status} — {a.device_type}</td>
                          <td>{a.shop_name}</td>
                          <td className={styles.muted}>{new Date(a.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
            <Panel
              title={`Alerts${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              linkLabel={unreadCount > 0 ? "Mark all read" : undefined}
              onLink={unreadCount > 0 ? handleMarkAllRead : undefined}
            >
              {loadingAlerts ? <AlertSkeleton /> : alertsError ? (
                <div className={styles.errorMsg}>{alertsError}</div>
              ) : alerts.length === 0 ? (
                <div className={styles.empty}>No alerts.</div>
              ) : (
                <div className={styles.alertList}>
                  {alerts.map((al) => (
                    <div key={al.notification_id} onClick={() => !al.is_read && handleMarkRead(al.notification_id)} style={{ cursor: al.is_read ? "default" : "pointer", opacity: al.is_read ? 0.6 : 1 }}>
                      <AlertItem title={al.title} sub={al.sub} type={al.type} time={al.time} />
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {/* ═══ REPAIRS ═══ */}
      {activeSection === "repairs" && (
        <div className={styles.section}>
          <div className={styles.filterBar}>
            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className={styles.searchInput} type="text" placeholder="Search customer or technician…" value={repairSearch} onChange={(e) => setRepairSearch(e.target.value)} />
              {repairSearch && <button className={styles.searchClear} onClick={() => setRepairSearch("")}>✕</button>}
            </div>
            <div className={styles.statusPills}>
              {REPAIR_STATUSES.map((s) => (
                <button key={s} className={`${styles.pill} ${repairStatus === s ? styles.pillActive : ""}`} onClick={() => setRepairStatus(s)}>{s}</button>
              ))}
            </div>
            <span className={styles.muted} style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}>{filteredRepairs.length} of {repairs.length}</span>
          </div>
          <Panel title="Repair Requests">
            {loadingRepairs ? <TableSkeleton cols={8} rows={6} /> : repairs.length === 0 ? (
              <div className={styles.empty}>No repair requests found.</div>
            ) : filteredRepairs.length === 0 ? (
              <div className={styles.empty}>No repairs match your filters.</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>#</th><th>Customer</th><th>Technician</th><th>Shop</th><th>Device</th><th>Issue</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredRepairs.map((r) => (
                      <tr key={r.request_id}>
                        <td className={styles.muted}>#{r.request_id}</td>
                        <td className={styles.bold}>{r.customer_name}</td>
                        <td className={styles.teal}>{r.technician_name ?? "—"}</td>
                        <td>{r.shop_name}</td>
                        <td>{r.device_type}</td>
                        <td className={styles.muted} style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.issue_description}</td>
                        <td className={styles.muted}>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td><Badge variant={repairBadge[r.status] ?? "pending"}>{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ═══ USER MANAGEMENT ═══ */}
      {activeSection === "userManagement" && (
        <div className={styles.section}>
          <div className={styles.sectionPageHeader}>
            <button className={styles.btnPrimary} onClick={() => setShowAddUser(true)}>+ Add Member</button>
          </div>
          <Panel title="All Users" linkLabel={`${users.length} total`}>
            {updateError && <div className={styles.errorMsg} style={{ marginBottom: "0.75rem" }}>{updateError}</div>}
            {loadingUsers ? <TableSkeleton cols={6} rows={5} /> : users.length === 0 ? (
              <div className={styles.empty}>No users found.</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id}>
                        <td className={styles.bold}>{u.username}</td>
                        <td className={styles.muted}>{u.email ?? "—"}</td>
                        <td>
                          <select className={styles.inlineSelect} value={u.role} disabled={updatingId === u.user_id} onChange={(e) => handleUpdate(u.user_id, "role", e.target.value)}>
                            <option value="admin">Admin</option><option value="owner">Owner</option><option value="technician">Technician</option><option value="customer">Customer</option>
                          </select>
                        </td>
                        <td>
                          <select className={`${styles.inlineSelect} ${u.status === "active" ? styles.selectActive : styles.selectInactive}`} value={u.status} disabled={updatingId === u.user_id} onChange={(e) => handleUpdate(u.user_id, "status", e.target.value)}>
                            <option value="active">Active</option><option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className={styles.muted}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td><button className={styles.btnDanger} disabled={deletingId === u.user_id} onClick={() => handleDelete(u.user_id)}>{deletingId === u.user_id ? "…" : "Delete"}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ═══ SHOP REQUESTS ═══ */}
      {activeSection === "shopRequests" && (
        <div className={styles.section}>
          <div className={styles.sectionPageHeader}>
            <span className={styles.pendingBadge}>{shopRequests.filter((s) => s.status === "pending").length} pending</span>
          </div>
          <Panel title="All Shop Registrations">
            {loadingShops ? <TableSkeleton cols={7} rows={4} /> : shopRequests.length === 0 ? (
              <div className={styles.empty}>No shop requests found.</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Shop Name</th><th>Owner</th><th>Email</th>
                      <th>Address</th><th>Submitted</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopRequests.map((sr) => (
                      <tr key={sr.shop_id}>
                        <td className={styles.bold}>{sr.shop_name}</td>
                        <td>{sr.owner_name}</td>
                        <td className={styles.muted}>{sr.email}</td>
                        <td>{sr.address ?? "—"}</td>
                        <td className={styles.muted}>{new Date(sr.created_at).toLocaleDateString()}</td>
                        <td>
                          <Badge variant={shopBadge[sr.status?.toLowerCase()] ?? "pending"}>
                            {sr.status ? sr.status.charAt(0).toUpperCase() + sr.status.slice(1) : "—"}
                          </Badge>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            {/* Details — always visible */}
                            <button
                              className={styles.btnSecondary}
                              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                              onClick={() => setSelectedShop(sr)}
                            >
                              Details
                            </button>
                            {/* Approve / Reject — pending only */}
                            {sr.status?.toLowerCase() === "pending" && (
                              <>
                                <button className={styles.btnApprove} disabled={approvingId === sr.shop_id} onClick={() => handleShopAction(sr.shop_id, "approve")}>
                                  {approvingId === sr.shop_id ? "…" : "Approve"}
                                </button>
                                <button className={styles.btnDanger} disabled={approvingId === sr.shop_id} onClick={() => handleShopAction(sr.shop_id, "reject")}>
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ═══ SYSTEM LOGS ═══ */}
      {activeSection === "systemLogs" && (
        <div className={styles.section}>
          <div className={styles.sectionPageHeader}>
            <span className={styles.muted} style={{ fontSize: "0.78rem" }}>{logs.length} entries</span>
          </div>
          <Panel title="Recent Activity Logs">
            {loadingLogs ? <TableSkeleton cols={5} rows={5} /> : logs.length === 0 ? (
              <div className={styles.empty}>No logs yet.</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>IP Address</th><th>Type</th></tr></thead>
                  <tbody>
                    {logs.map((l, i) => (
                      <tr key={i}>
                        <td className={`${styles.muted} ${styles.small}`}>{new Date(l.created_at).toLocaleString()}</td>
                        <td className={styles.teal}>{l.username ?? "system"}</td>
                        <td>{l.action}</td>
                        <td className={`${styles.muted} ${styles.small}`}>{l.ip_address ?? "—"}</td>
                        <td><Badge variant={logBadge[l.log_type] ?? "completed"}>{l.log_type}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onSuccess={() => fetchUsers()} />}
    </div>
  );
}