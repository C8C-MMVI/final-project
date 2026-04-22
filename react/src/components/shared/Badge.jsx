// src/components/shared/Badge.jsx
import styles from './Badge.module.css';

export default function Badge({ status, variant, children }) {
  const key = variant ?? status;
  const map = {
    progress:  styles.progress,
    pending:   styles.pending,
    completed: styles.completed,
    cancelled: styles.cancelled,
    paid:      styles.completed,
    ready:     styles.ready,
  };
  const cls = map[key] ?? '';
  return <span className={`${styles.badge} ${cls}`}>{children ?? key}</span>;
}