// src/pages/OwnerDashboard.jsx
import { useState } from 'react';
import StatCard  from '../components/dashboard/StatCard';
import Panel     from '../components/shared/Panel';
import Badge     from '../components/shared/Badge';
import styles    from './OwnerDashboard.module.css';

import {
  repairs      as mockRepairs,
  transactions as mockTransactions,
  statsData,
} from '../data/mockData';

const mockCustomers = [
  { name: 'Maria Santos',   email: 'maria@email.com',  phone: '09171234567', repairs: 3, last_visit: 'Mar 15, 2026', status: 'active'   },
  { name: 'Juan Dela Cruz', email: 'juan@email.com',   phone: '09281234567', repairs: 1, last_visit: 'Mar 10, 2026', status: 'active'   },
  { name: 'Ana Reyes',      email: 'ana@email.com',    phone: '09391234567', repairs: 5, last_visit: 'Mar 8, 2026',  status: 'active'   },
  { name: 'Pedro Gomez',    email: 'pedro@email.com',  phone: '09451234567', repairs: 2, last_visit: 'Feb 20, 2026', status: 'inactive' },
  { name: 'Liza Tan',       email: 'liza@email.com',   phone: '09561234567', repairs: 4, last_visit: 'Mar 14, 2026', status: 'active'   },
];

const mockMembers = [
  { name: 'Juan Dela Cruz', email: 'juan@email.com',  role: 'Technician', jobs_done: 34, rating: '4.8', status: 'active',   joined: 'Jan 10, 2026' },
  { name: 'Carlo Mendez',   email: 'carlo@email.com', role: 'Technician', jobs_done: 21, rating: '4.6', status: 'active',   joined: 'Feb 5, 2026'  },
  { name: 'Nina Reyes',     email: 'nina@email.com',  role: 'Technician', jobs_done: 8,  rating: '4.9', status: 'active',   joined: 'Mar 1, 2026'  },
  { name: 'Leo Santos',     email: 'leo@email.com',   role: 'Technician', jobs_done: 0,  rating: '—',   status: 'inactive', joined: 'Mar 15, 2026' },
];

const repairBadge = {
  progress:      'progress',
  pending:       'pending',
  completed:     'done',
  cancelled:     'cancelled',
  'In Progress': 'progress',
  'Pending':     'pending',
  'Completed':   'done',
};

const custBadge = { active: 'done', inactive: 'cancelled' };
const membBadge = { active: 'done', inactive: 'cancelled' };

const SECTIONS = {
  dashboard: 'dashboard',
  repairs:   'repairs',
  customers: 'customers',
  reports:   'reports',
  members:   'members',
};

export default function OwnerDashboard({ setPage }) {
  const [activeTab, setActiveTab] = useState(SECTIONS.dashboard);
  const [stats]     = useState(statsData.owner);
  const [repairs]   = useState(mockRepairs);
  const [customers] = useState(mockCustomers);
  const [members]   = useState(mockMembers);
  const [txns]      = useState(mockTransactions);
  const [loading]   = useState(false);
  const [error]     = useState(null);

  // Uncomment to wire real APIs:
  // useEffect(() => {
  //   setLoading(true);
  //   Promise.all([
  //     fetch('/api/dashboard.php',    { credentials: 'include' }).then(r => r.json()),
  //     fetch('/api/repairs.php',      { credentials: 'include' }).then(r => r.json()),
  //     fetch('/api/customers.php',    { credentials: 'include' }).then(r => r.json()),
  //     fetch('/api/members.php',      { credentials: 'include' }).then(r => r.json()),
  //     fetch('/api/transactions.php', { credentials: 'include' }).then(r => r.json()),
  //   ])
  //     .then(([dash, rep, cust, mem, tx]) => {
  //       if (dash.success) setStats(dash.stats);
  //       if (rep.success)  setRepairs(rep.repairs ?? []);
  //       if (cust.success) setCustomers(cust.customers ?? []);
  //       if (mem.success)  setMembers(mem.members ?? []);
  //       if (tx.success)   setTxns(tx.transactions ?? []);
  //     })
  //     .catch(() => setError('Cannot connect to server.'))
  //     .finally(() => setLoading(false));
  // }, []);

  return (
    <div className={styles.root}>

      {/* Sub-nav tabs */}
      <nav className={styles.subNav}>
        {[
          { id: SECTIONS.dashboard, label: 'Dashboard'            },
          { id: SECTIONS.repairs,   label: 'Repairs / Job Orders' },
          { id: SECTIONS.customers, label: 'Customers'            },
          { id: SECTIONS.reports,   label: 'Reports / Analytics'  },
          { id: SECTIONS.members,   label: 'Member Management'    },
        ].map(tab => (
          <button
            key={tab.id}
            className={`${styles.subNavBtn} ${activeTab === tab.id ? styles.subNavBtnActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>

        {/* SECTION: Dashboard */}
        {activeTab === SECTIONS.dashboard && (
          <>
            {loading ? (
              <div className={styles.loadingText}>Loading dashboard...</div>
            ) : error ? (
              <div className={styles.errorText}>{error}</div>
            ) : (
              <div className={styles.cardsGrid}>
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
              </div>
            )}

            <Panel
              title="Recent Repair Jobs"
              linkLabel="View all"
              onLink={() => setActiveTab(SECTIONS.repairs)}
            >
              {loading ? <Loader /> : repairs.length === 0 ? <Empty msg="No repairs found." /> : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Job #</th><th>Customer</th><th>Device</th><th>Issue</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.slice(0, 5).map((r, i) => (
                      <tr key={r.id ?? i}>
                        <td className={styles.idCol}>{r.id}</td>
                        <td>{r.customer}</td>
                        <td>{r.device}</td>
                        <td className={styles.mutedCol}>{r.issue}</td>
                        <td><Badge status={repairBadge[r.status] ?? 'pending'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>

            <Panel title="Recent Transactions">
              {loading ? <Loader /> : txns.length === 0 ? <Empty msg="No transactions yet." /> : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Reference</th><th>Customer</th><th>Item / Service</th><th>Amount</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((t, i) => (
                      <tr key={t.ref ?? i}>
                        <td className={styles.idCol}>{t.ref}</td>
                        <td>{t.customer}</td>
                        <td>{t.item}</td>
                        <td className={styles.amountCol}>{t.amount}</td>
                        <td className={styles.mutedCol}>{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* SECTION: Repairs / Job Orders */}
        {activeTab === SECTIONS.repairs && (
          <>
            <SectionHeader title="Repairs / Job Orders" />
            <Panel title="All Repair Jobs" linkLabel={`${repairs.length} total`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Job #</th><th>Customer</th><th>Device</th><th>Issue</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((r, i) => (
                    <tr key={r.id ?? i}>
                      <td className={styles.idCol}>{r.id}</td>
                      <td>{r.customer}</td>
                      <td>{r.device}</td>
                      <td className={styles.mutedCol}>{r.issue}</td>
                      <td><Badge status={repairBadge[r.status] ?? 'pending'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </>
        )}

        {/* SECTION: Customers */}
        {activeTab === SECTIONS.customers && (
          <>
            <SectionHeader title="Customers" />
            <Panel title="All Customers" linkLabel={`${customers.length} total`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Phone</th><th>Repairs</th><th>Last Visit</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i}>
                      <td className={styles.boldCol}>{c.name}</td>
                      <td className={styles.mutedCol}>{c.email}</td>
                      <td>{c.phone}</td>
                      <td className={styles.boldCol}>{c.repairs}</td>
                      <td className={styles.mutedCol}>{c.last_visit}</td>
                      <td><Badge status={custBadge[c.status] ?? 'pending'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </>
        )}

        {/* SECTION: Reports / Analytics */}
        {activeTab === SECTIONS.reports && (
          <>
            <SectionHeader title="Reports / Analytics" />
            <div className={styles.twoCol}>
              <Panel title="Revenue This Month">
                <EmptyChart label="Charts coming soon" icon="bar" />
              </Panel>
              <Panel title="Repairs by Status">
                <EmptyChart label="Charts coming soon" icon="pie" />
              </Panel>
            </div>
            <Panel title="Recent Transactions">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reference</th><th>Customer</th><th>Item / Service</th><th>Amount</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t, i) => (
                    <tr key={t.ref ?? i}>
                      <td className={styles.idCol}>{t.ref}</td>
                      <td>{t.customer}</td>
                      <td>{t.item}</td>
                      <td className={styles.amountCol}>{t.amount}</td>
                      <td className={styles.mutedCol}>{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </>
        )}

        {/* SECTION: Member Management */}
        {activeTab === SECTIONS.members && (
          <>
            <SectionHeader title="Member Management" />
            <Panel title="Shop Members / Technicians" linkLabel={`${members.length} members`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Jobs Done</th><th>Rating</th><th>Status</th><th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr key={i}>
                      <td className={styles.boldCol}>{m.name}</td>
                      <td className={styles.mutedCol}>{m.email}</td>
                      <td><Badge status="progress" label={m.role} /></td>
                      <td className={styles.boldCol}>{m.jobs_done}</td>
                      <td className={styles.ratingCol}>{m.rating}</td>
                      <td><Badge status={membBadge[m.status] ?? 'pending'} /></td>
                      <td className={styles.mutedCol}>{m.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </>
        )}

      </main>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className={styles.sectionPageHeader}>
      <h2>{title}</h2>
    </div>
  );
}

function Loader() {
  return <div className={styles.loadingText} style={{ padding: '1rem' }}>Loading...</div>;
}

function Empty({ msg }) {
  return <div className={styles.emptyText} style={{ padding: '1rem' }}>{msg}</div>;
}

function EmptyChart({ label, icon }) {
  return (
    <div className={styles.emptyChart}>
      {icon === 'bar' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6"  y1="20" x2="6"  y2="14"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4l3 3"/>
        </svg>
      )}
      <div>{label}</div>
    </div>
  );
}