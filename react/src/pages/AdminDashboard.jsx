import { useState, useEffect } from 'react';
import StatCard  from '../components/dashboard/StatCard';
import Panel     from '../components/shared/Panel';
import AlertItem from '../components/shared/AlertItem';
import styles from './Dashboard.module.css';

export default function AdminDashboard({ setPage }) {
  const [stats,    setStats]    = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    fetch('/api/dashboard.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setActivity(data.activity ?? []);
        } else {
          setError(data.message);
        }
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Users',   value: stats.total_users.toString(),                                        sub: 'Registered accounts',   color: 'teal'   },
    { label: 'Active Shops',  value: stats.active_shops.toString(),                                       sub: 'Shops in system',        color: 'blue'   },
    { label: 'Open Repairs',  value: stats.open_repairs.toString(),                                       sub: 'Pending or in progress', color: 'orange' },
    { label: 'Total Revenue', value: `₱${Number(stats.total_revenue).toLocaleString()}`,                  sub: 'All time',               color: 'purple' },
  ] : [];

  const statusLabel = { 'Pending': 'Submitted request', 'In Progress': 'Repair in progress', 'Completed': 'Completed job' };

  return (
    <main className={styles.content}>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div style={{ padding: '1rem' }}>Loading dashboard…</div>
      ) : error ? (
        <div style={{ padding: '1rem', color: '#ef4444' }}>{error}</div>
      ) : (
        <div className={styles.cardsGrid}>
          {statCards.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      <div className={styles.twoCol}>

        {/* ── Recent Activity ── */}
        <Panel title="Recent Activity" onLink={() => setPage('repairs')} linkLabel="View all →">
          {loading ? (
            <div style={{ padding: '1rem' }}>Loading…</div>
          ) : activity.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No recent activity.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>User</th><th>Action</th><th>Shop</th><th>Date</th></tr>
              </thead>
              <tbody>
                {activity.map((a, i) => (
                  <tr key={i}>
                    <td className={styles.bold}>{a.username}</td>
                    <td>{statusLabel[a.status] ?? a.status} — {a.device_type}</td>
                    <td>{a.shop_name}</td>
                    <td className={styles.muted}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {/* ── Alerts ── */}
        <Panel title="Quick Links" onLink={() => setPage('members')} linkLabel="Manage Members →">
          <div className={styles.alertList}>
            {[
              { title: 'Member Management', sub: 'Add or remove staff and technicians', type: 'info' },
              { title: 'Repair Jobs',        sub: 'View and manage all repair requests',  type: 'info' },
              { title: 'Inventory',          sub: 'Check stock levels across all shops',  type: 'warn' },
              { title: 'Transactions',       sub: 'View all sales and payment records',   type: 'info' },
            ].map((al, i) => <AlertItem key={i} {...al} />)}
          </div>
        </Panel>

      </div>

      {/* ── Team Management ── */}
      <div style={{ marginTop: '1.5rem' }}>
        <Panel title="Team Management" onLink={() => setPage('members')} linkLabel="Add Member →">
          <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>
            Manage staff and technician accounts for all shops.
          </div>
        </Panel>
      </div>

    </main>
  );
}