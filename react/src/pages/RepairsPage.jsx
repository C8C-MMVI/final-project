import { useState, useEffect } from 'react';
import Panel  from '../components/shared/Panel';
import Badge  from '../components/shared/Badge';
import styles from '../components/layout/DashboardLayout.module.css';

const statusLabel = { 'Pending': 'pending', 'In Progress': 'progress', 'Completed': 'done' };

export default function RepairsPage({ setPage, role }) {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch('/api/repairs.php')
      .then(r => r.json())
      .then(data => {
        if (data.success) setRepairs(data.repairs ?? []);
        else setError(data.message);
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, []);

  const title = role === 'customer' ? 'My Repair Requests' : 'All Repair Jobs';

  return (
    <main className={styles.content}>
      <Panel title={title} onLink={() => setPage('dashboard')} linkLabel="← Back to Dashboard">
        {loading ? (
          <div style={{ padding: '1.5rem' }}>Loading repairs…</div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: '#ef4444' }}>{error}</div>
        ) : repairs.length === 0 ? (
          <div style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>No repairs found.</div>
        ) : (
          <table className={cStyles.table}>
            <thead>
              <tr>
                <th>Job #</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Device</th>
                <th>Issue</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {repairs.map(r => (
                <tr key={r.request_id}>
                  <td className={cStyles.idCol}>#{r.request_id}</td>
                  <td className={cStyles.bold}>{r.customer_name}</td>
                  <td>{r.shop_name}</td>
                  <td>{r.device_type}</td>
                  <td>{r.issue_description}</td>
                  <td className={cStyles.muted}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td><Badge status={statusLabel[r.status] ?? 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </main>
  );
}