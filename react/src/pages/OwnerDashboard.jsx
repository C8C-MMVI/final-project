import { useState, useEffect } from 'react';
import StatCard  from '../components/dashboard/StatCard';
import Panel     from '../components/shared/Panel';
import Badge     from '../components/shared/Badge';
import AlertItem from '../components/shared/AlertItem';
import { statsData } from '../data/mockData';
import styles from './Dashboard.module.css';

export default function OwnerDashboard({ setPage }) {
  const [repairs,   setRepairs]   = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/repairs.php',   { credentials: 'include' }).then(r => r.json()),  // ← FIXED
      fetch('/api/inventory.php', { credentials: 'include' }).then(r => r.json()),  // ← FIXED
    ]).then(([repairData, invData]) => {
      if (repairData.success) setRepairs(repairData.repairs ?? []);
      if (invData.success)    setInventory(invData.items ?? []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const lowStock    = inventory.filter(i => i.quantity <= 5);
  const statusLabel = { 'Pending': 'pending', 'In Progress': 'progress', 'Completed': 'done' };

  return (
    <main className={styles.content}>
      <div className={styles.cardsGrid}>
        {statsData.owner.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className={styles.twoCol}>
        <Panel title="Recent Repair Jobs" onLink={() => setPage('repairs')} linkLabel="View all →">
          {loading ? <div style={{ padding: '1rem' }}>Loading…</div>
            : repairs.length === 0
            ? <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No repairs found.</div>
            : (
              <table className={styles.table}>
                <thead>
                  <tr><th>Job #</th><th>Customer</th><th>Device</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {repairs.slice(0, 5).map(r => (
                    <tr key={r.request_id}>
                      <td className={styles.idCol}>#{r.request_id}</td>
                      <td>{r.customer_name}</td>
                      <td>{r.device_type}</td>
                      <td><Badge status={statusLabel[r.status] ?? 'pending'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </Panel>

        <Panel title="Inventory Alerts" onLink={() => setPage('inventory')} linkLabel="Inventory Summary →">
          <div className={styles.alertList}>
            {lowStock.length === 0
              ? <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>All stock levels are healthy.</div>
              : lowStock.map((item, i) => (
                  <AlertItem
                    key={i}
                    title={item.item_name}
                    sub={`Only ${item.quantity} units left`}
                    type={item.quantity <= 2 ? 'danger' : 'warn'}
                  />
                ))
            }
          </div>
        </Panel>
      </div>
    </main>
  );
}