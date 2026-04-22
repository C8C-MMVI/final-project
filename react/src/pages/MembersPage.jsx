import { useState, useEffect } from 'react';
import Panel from '../components/shared/Panel';
import styles from './OwnerDashboard.module.css';

export default function MembersPage({ setPage }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [form,    setForm]    = useState({ username: '', email: '', password: '' });
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMembers = () => {
    setLoading(true);
    fetch('/api/technicians.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setMembers(data.technicians ?? []);
        else setError(data.message);
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res  = await fetch('/api/technicians.php', {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Technician added successfully.');
        setForm({ username: '', email: '', password: '' });
        fetchMembers();
      } else {
        showToast('⚠ ' + data.message, true);
      }
    } catch {
      showToast('⚠ Cannot connect to server.', true);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (userId, username) => {
    if (!window.confirm(`Remove "${username}" from your shop?`)) return;
    try {
      const res  = await fetch('/api/technicians.php', {
        method:      'DELETE',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Technician removed.');
        fetchMembers();
      } else {
        showToast('⚠ ' + data.message, true);
      }
    } catch {
      showToast('⚠ Cannot connect to server.', true);
    }
  };

  const inp = {
    width: '100%', padding: '8px 12px', borderRadius: '7px',
    border: '1px solid rgba(26,188,156,0.15)',
    background: 'var(--navy-dark, #0a1628)',
    color: '#fff', fontSize: '0.82rem', outline: 'none',
    boxSizing: 'border-box',
  };
  const lbl = {
    display: 'block', fontSize: '0.72rem', fontWeight: 600,
    color: 'rgba(255,255,255,0.45)', marginBottom: '4px',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <div className={styles.content}>

      {/* Toast */}
      {toast && (
        <div style={{
          marginBottom: '1rem', padding: '12px 18px', borderRadius: '8px',
          background: toast.isError ? 'rgba(239,68,68,0.12)' : 'rgba(26,188,156,0.12)',
          border: `1px solid ${toast.isError ? '#ef4444' : 'var(--teal, #1abc9c)'}`,
          color: toast.isError ? '#ef4444' : 'var(--teal, #1abc9c)',
          fontSize: '0.82rem', fontWeight: 500,
        }}>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className={styles.sectionPageHeader}>
        <h2>Member Management</h2>
      </div>

      <div className={styles.twoCol}>

        {/* ── Add Technician Form ── */}
        <Panel title="Add Technician">
          <form onSubmit={handleAdd} style={{
            padding: '20px', display: 'flex',
            flexDirection: 'column', gap: '14px',
          }}>
            <div>
              <label style={lbl}>Username</label>
              <input style={inp} type="text" placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" placeholder="Enter email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <input style={inp} type="password" placeholder="Set password (min. 8 characters)"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required />
            </div>
            <button type="submit" disabled={saving} style={{
              padding: '10px', borderRadius: '8px', border: 'none',
              background: 'var(--teal, #1abc9c)', color: '#0a1628',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              opacity: saving ? 0.6 : 1, transition: 'opacity 0.2s',
              marginTop: '4px',
            }}>
              {saving ? 'Adding…' : '+ Add Technician'}
            </button>
          </form>
        </Panel>

        {/* ── Technicians List ── */}
        <Panel title="Shop Technicians" linkLabel={`${members.length} total`}>
          {loading ? (
            <div className={styles.loadingText} style={{ padding: '1rem' }}>
              Loading technicians…
            </div>
          ) : error ? (
            <div className={styles.errorText} style={{ padding: '1rem' }}>{error}</div>
          ) : members.length === 0 ? (
            <div className={styles.emptyText} style={{ padding: '1rem' }}>
              No technicians in your shop yet.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Jobs Done</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m.user_id ?? i}>
                    <td className={styles.boldCol}>{m.username}</td>
                    <td className={styles.mutedCol}>{m.email ?? '—'}</td>
                    <td className={styles.idCol}>{m.jobs_done ?? 0}</td>
                    <td style={{
                      color: Number(m.active_jobs) > 0 ? '#facc15' : 'rgba(255,255,255,0.45)',
                      fontWeight: 600,
                    }}>
                      {m.active_jobs ?? 0}
                    </td>
                    <td>
                      <button
                        onClick={() => handleRemove(m.user_id, m.username)}
                        style={{
                          padding: '4px 12px', borderRadius: '6px',
                          border: '1px solid rgba(239,68,68,0.4)',
                          background: 'rgba(239,68,68,0.1)',
                          color: '#ef4444', fontSize: '0.75rem',
                          fontWeight: 600, cursor: 'pointer',
                        }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

      </div>
    </div>
  );
}