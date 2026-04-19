import { useState, useEffect } from 'react';
import Panel  from '../components/shared/Panel';
import styles from '../components/layout/DashboardLayout.module.css';

export default function MembersPage({ setPage }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [form,    setForm]    = useState({ username: '', email: '', role: 'technician', password: '' });
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMembers = () => {
    setLoading(true);
    fetch('/api/users.php', {
      credentials: 'include',                         // ← FIXED: send session cookie
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setMembers(data.users ?? []);
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
      const res  = await fetch('/api/users.php', {
        method:      'POST',
        credentials: 'include',                       // ← FIXED: send session cookie
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Member added successfully.');
        setForm({ username: '', email: '', role: 'technician', password: '' });
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

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Remove member "${username}"?`)) return;
    try {
      const res  = await fetch('/api/users.php', {
        method:      'DELETE',
        credentials: 'include',                       // ← FIXED: send session cookie
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Member removed.');
        fetchMembers();
      } else {
        showToast('⚠ ' + data.message, true);
      }
    } catch {
      showToast('⚠ Cannot connect to server.', true);
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    width: '100%',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '4px',
    display: 'block',
  };

  const roleBadgeColor = {
    admin:      { bg: '#ede9fe', color: '#7c3aed' },
    owner:      { bg: '#fff7ed', color: '#c2410c' },
    technician: { bg: '#f0fdf4', color: '#15803d' },
    customer:   { bg: '#eff6ff', color: '#1d4ed8' },
  };

  return (
    <main className={styles.content}>

      {toast && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '1rem',
          borderRadius: '8px',
          background: toast.isError ? '#fee2e2' : '#dcfce7',
          color:      toast.isError ? '#dc2626' : '#16a34a',
          fontWeight: 500,
          fontSize: '14px',
        }}>
          {toast.msg}
        </div>
      )}

      <div className={cStyles.twoCol}>

        {/* ── Add Member Form ── */}
        <Panel title="Add New Member" onLink={() => setPage('dashboard')} linkLabel="← Back">
          <form onSubmit={handleAdd} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div><label style={labelStyle}>Username</label>
              <input style={inputStyle} type="text" placeholder="Enter username"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
            </div>

            <div><label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" placeholder="Enter email"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>

            <div><label style={labelStyle}>Role</label>
              <select style={inputStyle} value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="technician">Technician</option>
                <option value="owner">Shop Owner</option>
                <option value="admin">System Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            <div><label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" placeholder="Set password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>

            <button type="submit" disabled={saving} style={{
              padding: '10px', borderRadius: '8px', border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Adding…' : '+ Add Member'}
            </button>

          </form>
        </Panel>

        {/* ── Members List ── */}
        <Panel title="All Members">
          {loading ? (
            <div style={{ padding: '1rem' }}>Loading members…</div>
          ) : error ? (
            <div style={{ padding: '1rem', color: '#ef4444' }}>{error}</div>
          ) : members.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No members found.</div>
          ) : (
            <table className={cStyles.table}>
              <thead>
                <tr><th>Username</th><th>Email</th><th>Role</th><th></th></tr>
              </thead>
              <tbody>
                {members.map((m, i) => {
                  const badge = roleBadgeColor[m.role] ?? roleBadgeColor.customer;
                  return (
                    <tr key={m.user_id ?? i}>
                      <td className={cStyles.bold}>{m.username}</td>
                      <td className={cStyles.muted}>{m.email}</td>
                      <td>
                        <span style={{
                          background: badge.bg, color: badge.color,
                          padding: '2px 10px', borderRadius: '12px',
                          fontSize: '11px', fontWeight: 600,
                          textTransform: 'capitalize',
                        }}>
                          {m.role}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(m.user_id, m.username)}
                          style={{
                            padding: '4px 10px', borderRadius: '6px',
                            border: '1px solid #fca5a5', background: '#fee2e2',
                            color: '#dc2626', fontSize: '12px',
                            fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Panel>

      </div>
    </main>
  );
}