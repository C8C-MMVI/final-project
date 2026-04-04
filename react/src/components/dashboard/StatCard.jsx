// src/components/dashboard/StatCard.jsx
import Icon from '../shared/Icon';
import styles from './StatCard.module.css';

const iconMap = {
  orange: 'wrench',
  teal:   'check',
  blue:   'users',
  purple: 'peso',
};

export default function StatCard({ label, value, sub, subHighlight, color }) {
  const renderSub = () => {
    if (!subHighlight || !sub.includes(subHighlight)) return <>{sub}</>;
    const [before, after] = sub.split(subHighlight);
    return <>{before}<span className={styles.highlight}>{subHighlight}</span>{after}</>;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div className={`${styles.icon} ${styles[color]}`}>
          <Icon name={iconMap[color] ?? 'grid'} size={16} />
        </div>
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.sub}>{renderSub()}</div>
    </div>
  );
}
