// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import Panel     from '../components/shared/Panel';
import AlertItem from '../components/shared/AlertItem';
import Badge     from '../components/shared/Badge';
import styles    from './AdminDashboard.module.css';

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  const iconMap = {
    teal:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    blue:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    orange: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    purple: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
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

// ── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess }) {
  const [form,    setForm]    = useState({ username: '', email: '', password: '', role: 'technician' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.username || !form.password) { setError('Username and password are required.'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/users.php', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
      else setError(data.message);
    } catch { setError('Server error.'); }
    finally  { setLoading(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>Add New Member</span>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          {error && <div className={styles.formError}>{error}</div>}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Username *</label>
            <input className={styles.formInput} value={form.username}
              onChange={e => set('username', e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input className={styles.formInput} type="email" value={form.email}
              onChange={e => set('email', e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password *</label>
            <input className={styles.formInput} type="password" value={form.password}
              onChange={e => set('password', e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Role</label>
            <select className={styles.formSelect} value={form.role}
              onChange={e => set('role', e.target.value)}>
              <option value="technician">Technician</option>
              <option value="owner">Owner</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Badge variant maps ────────────────────────────────────────────────────────
const roleBadge = { owner: 'progress', technician: 'pending', customer: 'completed', admin: 'cancelled' };
const shopBadge = { approved: 'completed', pending: 'pending', rejected: 'cancelled' };
const logBadge  = { danger: 'cancelled', warn: 'pending', info: 'completed' };

const statusLabel = {
  'Pending':     'Submitted repair request',
  'In Progress': 'Repair in progress',
  'Completed':   'Completed job',
};

// ════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard({ setPage }) {
  const [activeSection, setActiveSection] = useState('Dashboard');

  // data
  const [stats,        setStats]        = useState(null);
  const [activity,     setActivity]     = useState([]);
  const [users,        setUsers]        = useState([]);
  const [shopRequests, setShopRequests] = useState([]);
  const [logs,         setLogs]         = useState([]);

  // loading
  const [loadingDash,  setLoadingDash]  = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingLogs,  setLoadingLogs]  = useState(false);
  const [dashError,    setDashError]    = useState('');

  // action state
  const [showAddUser, setShowAddUser] = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);
  const [updatingId,  setUpdatingId]  = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  // ── Dashboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
  
    fetch('/api/dashboard.php', { credentials: 'include', signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setStats(d.stats); setActivity(d.activity ?? []); }
        else setDashError(d.message);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setDashError('Cannot connect to server.');
      })
      .finally(() => setLoadingDash(false));
  
    return () => controller.abort();
  }, []);

  // ── Users ──────────────────────────────────────────────────────────────────
  const fetchUsers = () => {
    setLoadingUsers(true);
    fetch('/api/users.php', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setUsers(d.users ?? []); })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  };

  // ── Shop requests ──────────────────────────────────────────────────────────
  const fetchShops = () => {
    setLoadingShops(true);
    fetch('/api/shop_requests.php', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setShopRequests(d.requests ?? []); })
      .catch(() => {})
      .finally(() => setLoadingShops(false));
  };

  // ── Logs ───────────────────────────────────────────────────────────────────
  const fetchLogs = () => {
    setLoadingLogs(true);
    fetch('/api/system_logs.php', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setLogs(d.logs ?? []); })
      .catch(() => {})
      .finally(() => setLoadingLogs(false));
  };

  // ── Section switch — lazy load ─────────────────────────────────────────────
  const handleSection = (s) => {
    setActiveSection(s);
    if (s === 'User Management' && users.length === 0)        fetchUsers();
    if (s === 'Shop Requests'   && shopRequests.length === 0) fetchShops();
    if (s === 'System Logs'     && logs.length === 0)         fetchLogs();
  };

  // ── User actions ───────────────────────────────────────────────────────────
  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setDeletingId(userId);
    try {
      const res  = await fetch('/api/users.php', {
        method: 'DELETE', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (data.success) setUsers(u => u.filter(x => x.user_id !== userId));
    } catch {}
    finally { setDeletingId(null); }
  };

  const handleUpdate = async (userId, action, value) => {
    setUpdatingId(userId);
    try {
      const res  = await fetch('/api/update_user.php', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action, value }),
      });
      const data = await res.json();
      if (data.success)
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, [action]: value } : u));
    } catch {}
    finally { setUpdatingId(null); }
  };

  // ── Shop approval ──────────────────────────────────────────────────────────
  const handleShopAction = async (shopId, action) => {
    setApprovingId(shopId);
    try {
      const res  = await fetch('/api/shop_requests.php', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id: shopId, action }),
      });
      const data = await res.json();
      if (data.success)
        setShopRequests(prev => prev.map(s =>
          s.shop_id === shopId ? { ...s, status: data.status } : s
        ));
    } catch {}
    finally { setApprovingId(null); }
  };

  const statCards = stats ? [
    { label: 'Total Users',   value: stats.total_users.toString(),                       sub: 'Registered accounts',   color: 'teal'   },
    { label: 'Active Shops',  value: stats.active_shops.toString(),                      sub: 'Shops in system',        color: 'blue'   },
    { label: 'Open Repairs',  value: stats.open_repairs.toString(),                      sub: 'Pending or in progress', color: 'orange' },
    { label: 'Total Revenue', value: `₱${Number(stats.total_revenue).toLocaleString()}`, sub: 'All time',               color: 'purple' },
  ] : [];

  const navItems = ['Dashboard', 'User Management', 'Shop Requests', 'System Logs'];

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className={styles.wrapper}>

      {/* Tabs */}
      <nav className={styles.tabs}>
        {navItems.map(n => (
          <button key={n}
            className={`${styles.tab} ${activeSection === n ? styles.tabActive : ''}`}
            onClick={() => handleSection(n)}>
            {n}
          </button>
        ))}
      </nav>

      {/* ═══ DASHBOARD ═══ */}
      {activeSection === 'Dashboard' && (
        <div className={styles.section}>
          {loadingDash ? (
            <div className={styles.cardsGrid}>
              {[1,2,3,4].map(i => <div key={i} className={`${styles.statCard} ${styles.skeletonCard}`} />)}
            </div>
          ) : dashError ? (
            <div className={styles.errorMsg}>{dashError}</div>
          ) : (
            <div className={styles.cardsGrid}>
              {statCards.map((s, i) => <StatCard key={i} {...s} />)}
            </div>
          )}

          <div className={styles.twoCol}>
            <Panel title="Recent Activity" linkLabel="View all →"
              onLink={() => handleSection('User Management')}>
              {loadingDash ? <TableSkeleton cols={4} rows={5} /> :
               activity.length === 0 ? <div className={styles.empty}>No recent activity.</div> : (
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
              )}
            </Panel>

            <Panel title="Alerts">
              <div className={styles.alertList}>
                {[
                  { title: 'Shop pending approval',   sub: 'Check Shop Requests for new submissions', type: 'warn',   time: 'now'    },
                  { title: 'Unusual login detected',  sub: 'Review System Logs for details',          type: 'danger', time: '5h ago' },
                  { title: 'System backup completed', sub: 'Daily backup at 2:00 AM',                 type: 'info',   time: '6h ago' },
                  { title: 'New technician added',    sub: 'Check User Management',                   type: 'info',   time: '1d ago' },
                ].map((al, i) => <AlertItem key={i} {...al} />)}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* ═══ USER MANAGEMENT ═══ */}
      {activeSection === 'User Management' && (
        <div className={styles.section}>
          <div className={styles.sectionPageHeader}>
            <h2 className={styles.sectionTitle}>User Management</h2>
            <button className={styles.btnPrimary} onClick={() => setShowAddUser(true)}>
              + Add Member
            </button>
          </div>

          <Panel title="All Users" linkLabel={`${users.length} total`}>
            {loadingUsers ? <TableSkeleton cols={6} rows={5} /> :
             users.length === 0 ? <div className={styles.empty}>No users found.</div> : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th>
                    <th>Status</th><th>Joined</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.user_id}>
                      <td className={styles.bold}>{u.username}</td>
                      <td className={styles.muted}>{u.email ?? '—'}</td>
                      <td>
                        <select className={styles.inlineSelect}
                          value={u.role} disabled={updatingId === u.user_id}
                          onChange={e => handleUpdate(u.user_id, 'role', e.target.value)}>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                          <option value="technician">Technician</option>
                          <option value="customer">Customer</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className={`${styles.inlineSelect} ${u.status === 'active' ? styles.selectActive : styles.selectInactive}`}
                          value={u.status} disabled={updatingId === u.user_id}
                          onChange={e => handleUpdate(u.user_id, 'status', e.target.value)}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className={styles.muted}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className={styles.btnDanger}
                          disabled={deletingId === u.user_id}
                          onClick={() => handleDelete(u.user_id)}>
                          {deletingId === u.user_id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}

      {/* ═══ SHOP REQUESTS ═══ */}
      {activeSection === 'Shop Requests' && (
        <div className={styles.section}>
          <div className={styles.sectionPageHeader}>
            <h2 className={styles.sectionTitle}>Shop Requests</h2>
            <span className={styles.pendingBadge}>
              {shopRequests.filter(s => s.status === 'pending').length} pending
            </span>
          </div>

          <Panel title="All Shop Registrations">
            {loadingShops ? <TableSkeleton cols={7} rows={4} /> :
             shopRequests.length === 0 ? <div className={styles.empty}>No shop requests found.</div> : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Shop Name</th><th>Owner</th><th>Email</th>
                    <th>Address</th><th>Submitted</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shopRequests.map(sr => (
                    <tr key={sr.shop_id}>
                      <td className={styles.bold}>{sr.shop_name}</td>
                      <td>{sr.owner_name}</td>
                      <td className={styles.muted}>{sr.email}</td>
                      <td>{sr.address ?? '—'}</td>
                      <td className={styles.muted}>{new Date(sr.created_at).toLocaleDateString()}</td>
                      <td><Badge variant={shopBadge[sr.status] ?? 'pending'}>{sr.status}</Badge></td>
                      <td>
                        {sr.status === 'pending' ? (
                          <div className={styles.actionBtns}>
                            <button className={styles.btnApprove}
                              disabled={approvingId === sr.shop_id}
                              onClick={() => handleShopAction(sr.shop_id, 'approve')}>
                              {approvingId === sr.shop_id ? '…' : 'Approve'}
                            </button>
                            <button className={styles.btnDanger}
                              disabled={approvingId === sr.shop_id}
                              onClick={() => handleShopAction(sr.shop_id, 'reject')}>
                              Reject
                            </button>
                          </div>
                        ) : <span className={styles.muted}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}

      {/* ═══ SYSTEM LOGS ═══ */}
      {activeSection === 'System Logs' && (
        <div className={styles.section}>
          <div className={styles.sectionPageHeader}>
            <h2 className={styles.sectionTitle}>System Logs</h2>
            <span className={styles.muted} style={{ fontSize: '0.78rem' }}>{logs.length} entries</span>
          </div>

          <Panel title="Recent Activity Logs">
            {loadingLogs ? <TableSkeleton cols={5} rows={5} /> :
             logs.length === 0 ? <div className={styles.empty}>No logs yet.</div> : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Timestamp</th><th>User</th><th>Action</th><th>IP Address</th><th>Type</th></tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => (
                    <tr key={i}>
                      <td className={`${styles.muted} ${styles.small}`}>
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                      <td className={styles.teal}>{l.username ?? 'system'}</td>
                      <td>{l.action}</td>
                      <td className={`${styles.muted} ${styles.small}`}>{l.ip_address ?? '—'}</td>
                      <td><Badge variant={logBadge[l.log_type] ?? 'completed'}>{l.log_type}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal onClose={() => setShowAddUser(false)} onSuccess={fetchUsers} />
      )}

    </div>
  );
}