import { useState } from 'react';
import Icon from '../shared/Icon';
import { navItems } from '../../data/mockData';
import styles from './Sidebar.module.css';

const roleConfig = {
  owner:      { label: 'Shop Owner',   dot: 'owner'    },
  admin:      { label: 'System Admin', dot: 'admin'    },
  customer:   { label: 'Customer',     dot: 'customer' },
  technician: { label: 'Technician',   dot: 'owner'    },
};

// map sidebar labels to page keys
const labelToPage = {
  'Dashboard':  'dashboard',
  'Overview':   'dashboard',
  'Inventory':  'inventory',
  'My Repairs': 'repairs',
  'Repair Jobs':'repairs',
  'Staff':      'members',
  'Customers':  'members',
};

export default function Sidebar({ role, username, onLogout, onNavigate }) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [activePage, setActivePage] = useState(
    role === 'customer' ? 'Overview' : 'Dashboard'
  );

  const { label, dot } = roleConfig[role] ?? roleConfig.admin;
  const items = navItems[role] ?? navItems.admin;

  const handleItemClick = (item) => {
    if (item.label === 'Logout') {
      fetch('/api/logout.php', { method: 'POST' }).finally(() => onLogout?.());
      return;
    }
    setActivePage(item.label);
    const page = labelToPage[item.label];
    if (page && onNavigate) onNavigate(page);
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoRow}>
        {!collapsed && (
          <div>
            <div className={styles.logoMain}>TechnoLogs</div>
            <div className={styles.logoSub}>Repair Management</div>
          </div>
        )}
        <button className={styles.toggleBtn} onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
          {collapsed
            ? <Icon name="grid" size={14} />
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          }
        </button>
      </div>

      {!collapsed && (
        <div className={styles.roleBadge}>
          <span className={`${styles.dot} ${styles[dot]}`} />
          <span className={styles.roleLabel}>{label}</span>
        </div>
      )}

      <nav className={styles.nav}>
        {items.map((item, i) => {
          if (item.section) {
            if (collapsed) return null;
            return <div key={i} className={styles.section}>{item.section}</div>;
          }
          const isActive = item.label === activePage;
          return (
            <div
              key={i}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} size={15} />
              {!collapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {collapsed ? (
          <div className={`${styles.avatar} ${styles[dot]} ${styles.avatarCenter}`}>
            {username.slice(0, 2).toUpperCase()}
          </div>
        ) : (
          <div className={styles.userBadge}>
            <div className={`${styles.avatar} ${styles[dot]}`}>
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className={styles.userName}>{username}</div>
              <div className={styles.userRole}>{label}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}