// src/components/shared/AlertItem.jsx
import Icon from './Icon';
import styles from './AlertItem.module.css';

export default function AlertItem({ title, sub, type, time }) {
  const iconMap = { danger: 'alertCircle', warn: 'alertTri', info: 'infoCircle' };
  return (
    <div className={styles.item}>
      <div className={`${styles.icon} ${styles[type]}`}>
        <Icon name={iconMap[type] ?? 'infoCircle'} size={14} />
      </div>
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        <div className={styles.sub}>{sub}</div>
      </div>
      {time && <span className={styles.time}>{time}</span>}
    </div>
  );
}
