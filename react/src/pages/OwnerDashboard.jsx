// src/pages/OwnerDashboard.jsx
import { useState, useEffect } from 'react';
import StatCard  from '../components/dashboard/StatCard';
import Panel     from '../components/shared/Panel';
import Badge     from '../components/shared/Badge';
import AlertItem from '../components/shared/AlertItem';
import styles    from '../components/layout/DashboardLayout.module.css';

const statusBadge = {
  'Pending':     'pending',
  'In Progress': 'progress',
  'Completed':   'done',
};

export default function OwnerDashboard({ setPage }) {
  const [stats,     setStats]     = useState(null);
  const [repairs,   setRepairs]   = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard.php', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/repairs.php',   { credentials: 'include' }).then(r => r.json()),
      fetch('/api/inventory.php', { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([dashData, repairData, invData]) => {
        if (dashData.success)   setStats(dashData.stats);
        else                    setError(dashData.message);
        if (repairData.success) setRepairs(repairData.repairs   ?? []);
        if (invData.success)    setInventory(invData.items      ?? []);
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Active Repairs',   value: stats.active_repairs.toString(),                      sub: 'Open jobs',  color: 'orange' },
    { label: 'Completed Today',  value: stats.completed_today.toString(),                     sub: 'Today',      color: 'teal'   },
    { label: 'Total Customers',  value: stats.total_customers.toString(),                     sub: 'All time',   color: 'blue'   },
    { label: "Today's Revenue",  value: `₱${Number(stats.today_revenue).toLocaleString()}`,   sub: 'Today',      color: 'purple' },
  ] : [];

  const lowStock = inventory.filter(i => i.quantity <= 5);

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

        {/* ── Recent Repair Jobs ── */}
        <Panel title="Recent Repair Jobs" onLink={() => setPage('repairs')} linkLabel="View all →">
          {loading ? (
            <div style={{ padding: '1rem' }}>Loading…</div>
          ) : repairs.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
              No repairs found.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job #</th>
                  <th>Customer</th>
                  <th>Device</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {repairs.slice(0, 5).map(r => (
                  <tr key={r.request_id}>
                    <td className={styles.idCol}>#{r.request_id}</td>
                    <td>{r.customer_name}</td>
                    <td>{r.device_type}</td>
                    <td><Badge status={statusBadge[r.status] ?? 'pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {/* ── Inventory Alerts ── */}
        <Panel title="Inventory Alerts" onLink={() => setPage('inventory')} linkLabel="Inventory Summary →">
          <div className={styles.alertList}>
            {loading ? (
              <div style={{ padding: '1rem' }}>Loading…</div>
            ) : lowStock.length === 0 ? (
              <div style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                All stock levels are healthy.
              </div>
            ) : (
              lowStock.map((item, i) => (
                <AlertItem
                  key={i}
                  title={item.item_name}
                  sub={`Only ${item.quantity} units left`}
                  type={item.quantity <= 2 ? 'danger' : 'warn'}
                />
              ))
            )}
          </div>
        </Panel>

      </div>
    </main>
  );
}