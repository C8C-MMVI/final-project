import Icon from '../shared/Icon';
import styles from './QuickActions.module.css';

const actionMap = {
  owner: [
    { label: 'Home / Overview',   icon: 'home',    page: 'dashboard' },
    { label: 'Inventory Summary', icon: 'package', page: 'inventory' },
  ],
  admin: [
    { label: 'Home / Overview',   icon: 'home',    page: 'dashboard' },
    { label: 'Add Member',        icon: 'users',   page: 'members'   },
  ],
  customer: [
    { label: 'My Dashboard',      icon: 'home',    page: 'dashboard' },
    { label: 'My Repairs',        icon: 'wrench',  page: 'repairs'   },
  ],
  technician: [
    { label: 'My Dashboard',      icon: 'home',    page: 'dashboard' },
    { label: 'Inventory Summary', icon: 'package', page: 'inventory' },
  ],
};

export default function QuickActions({ role, activePage, setPage }) {
  const actions = actionMap[role] ?? actionMap.owner;
  return (
    <div className={styles.bar}>
      {actions.map((a, i) => (
        <button
          key={i}
          className={`${styles.btn} ${activePage === a.page ? styles.active : ''}`}
          onClick={() => setPage(a.page)}
        >
          <Icon name={a.icon} size={14} />
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}