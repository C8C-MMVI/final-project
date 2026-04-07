import { useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import Panel    from '../components/shared/Panel';
import Badge    from '../components/shared/Badge';
import Icon     from '../components/shared/Icon';
import { statsData, myRepairs, myTransactions, repairTimeline } from '../data/mockData';
import styles  from './Dashboard.module.css';
import cStyles from './CustomerDashboard.module.css';

export default function CustomerDashboard({ username, setPage }) {
  const [form, setForm]           = useState({ device: '', issue: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ device: '', issue: '', description: '' });
  };

  return (
    <main className={styles.content}>

      <div className={cStyles.greeting}>
        <div className={cStyles.greetingTitle}>
          Welcome back, <span className={cStyles.greetingName}>{username}</span>
        </div>
        <div className={cStyles.greetingSub}>
          Here's a summary of your repair requests and transactions.
        </div>
      </div>

      <div className={styles.cardsGrid}>
        {statsData.customer.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className={styles.twoCol}>
        <Panel title="Submit Repair Request">
          {submitted ? (
            <div className={cStyles.successMsg}>
              <Icon name="check" size={18} />
              <span>Request submitted! We'll be in touch soon.</span>
            </div>
          ) : (
            <form className={cStyles.form} onSubmit={handleSubmit}>
              <div className={cStyles.formRow}>
                <div className={cStyles.formGroup}>
                  <label className={cStyles.label}>Device Type</label>
                  <input
                    type="text"
                    className={cStyles.input}
                    placeholder="e.g. iPhone 14, Samsung A54…"
                    value={form.device}
                    onChange={e => setForm(f => ({ ...f, device: e.target.value }))}
                    required
                  />
                </div>
                <div className={cStyles.formGroup}>
                  <label className={cStyles.label}>Issue Type</label>
                  <select
                    className={cStyles.select}
                    value={form.issue}
                    onChange={e => setForm(f => ({ ...f, issue: e.target.value }))}
                    required
                  >
                    <option value="">Select an issue…</option>
                    <option>Screen Damage</option>
                    <option>Battery Issue</option>
                    <option>Charging Port</option>
                    <option>Water Damage</option>
                    <option>Camera Problem</option>
                    <option>Speaker / Mic Issue</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className={cStyles.formGroup}>
                <label className={cStyles.label}>Description</label>
                <textarea
                  className={cStyles.textarea}
                  placeholder="Describe the issue in detail…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                />
              </div>
              <button type="submit" className={cStyles.submitBtn}>Submit Request</button>
            </form>
          )}
        </Panel>

        <Panel title={`Track Repair – ${myRepairs[0].id}`} linkLabel={<Badge status="progress" />}>
          <div className={cStyles.timeline}>
            {repairTimeline.map((step, i) => (
              <div key={i} className={cStyles.timelineItem}>
                <div className={cStyles.timelineLeft}>
                  <div className={`${cStyles.timelineDot} ${cStyles[step.status]}`}>
                    {step.status === 'done'    && <Icon name="checkSmall" size={12} />}
                    {step.status === 'active'  && <Icon name="dot"        size={10} />}
                    {step.status === 'pending' && <Icon name="dot"        size={10} />}
                  </div>
                  {i < repairTimeline.length - 1 && (
                    <div className={`${cStyles.timelineLine} ${step.status === 'done' ? cStyles.lineDone : ''}`} />
                  )}
                </div>
                <div className={cStyles.timelineContent}>
                  <div className={`${cStyles.timelineTitle} ${step.status === 'pending' ? cStyles.titlePending : ''}`}>
                    {step.label}
                  </div>
                  <div className={cStyles.timelineSub}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="My Repair Requests" onLink={() => setPage('repairs')} linkLabel="View all →" className={styles.mb16}>
        <table className={styles.table}>
          <thead>
            <tr><th>Job #</th><th>Device</th><th>Issue</th><th>Shop</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {myRepairs.map(r => (
              <tr key={r.id}>
                <td className={styles.idCol}>{r.id}</td>
                <td>{r.device}</td>
                <td>{r.issue}</td>
                <td>{r.shop}</td>
                <td className={styles.muted}>{r.date}</td>
                <td><Badge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="My Transactions" onLink={() => setPage('dashboard')} linkLabel="View all →">
        <table className={styles.table}>
          <thead>
            <tr><th>Reference</th><th>Item / Service</th><th>Amount</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            {myTransactions.map(t => (
              <tr key={t.ref}>
                <td className={styles.idCol}>{t.ref}</td>
                <td>{t.item}</td>
                <td className={styles.bold}>{t.amount}</td>
                <td className={styles.muted}>{t.date}</td>
                <td><Badge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

    </main>
  );
}