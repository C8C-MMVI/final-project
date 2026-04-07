// src/components/shared/Badge.jsx
import styles from './Badge.module.css';

export default function Badge({ status }) {
  const map = {
    progress:  { label: 'In Progress', cls: styles.progress  },
    pending:   { label: 'Pending',     cls: styles.pending   },
    completed: { label: 'Completed',   cls: styles.completed },
    cancelled: { label: 'Cancelled',   cls: styles.cancelled },
    paid:      { label: 'Paid',        cls: styles.completed },
    ready:     { label: 'Ready',       cls: styles.ready     },
  };
  const { label, cls } = map[status] ?? { label: status, cls: '' };
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}
