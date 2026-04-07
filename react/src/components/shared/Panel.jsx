// src/components/shared/Panel.jsx
import styles from './Panel.module.css';

export default function Panel({ title, linkLabel = 'View all →', onLink, children, className = '' }) {
  return (
    <div className={`${styles.panel} ${className}`}>
      {title && (
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {onLink && (
            <button className={styles.link} onClick={onLink}>
              {linkLabel}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
