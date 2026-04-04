import StatCard   from '../components/dashboard/StatCard';
import Panel      from '../components/shared/Panel';
import AlertItem  from '../components/shared/AlertItem';
import { statsData, adminActivity, adminAlerts } from '../data/mockData';
import styles from './Dashboard.module.css';

export default function AdminDashboard({ setPage }) {
  return (
    <main className={styles.content}>
      <div className={styles.cardsGrid}>
        {statsData.admin.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className={styles.twoCol}>
        <Panel title="Recent Activity" onLink={() => setPage('dashboard')} linkLabel="View all →">
          <table className={styles.table}>
            <thead>
              <tr><th>User</th><th>Action</th><th>Shop</th><th>Time</th></tr>
            </thead>
            <tbody>
              {adminActivity.map((a, i) => (
                <tr key={i}>
                  <td className={styles.bold}>{a.user}</td>
                  <td>{a.action}</td>
                  <td>{a.shop}</td>
                  <td className={styles.muted}>{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Alerts" onLink={() => setPage('dashboard')} linkLabel="View all →">
          <div className={styles.alertList}>
            {adminAlerts.map((al, i) => <AlertItem key={i} {...al} />)}
          </div>
        </Panel>
      </div>

      {/* Add Member button */}
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