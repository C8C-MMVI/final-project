// src/components/layout/Sidebar.jsx
import { useState } from 'react';
import Icon from '../shared/Icon';
import { navItems } from '../../data/mockData';
import styles from './Sidebar.module.css';

const roleConfig = {
  owner:      { label: 'Shop Owner',   dot: 'owner'      },
  admin:      { label: 'System Admin', dot: 'admin'      },
  customer:   { label: 'Customer',     dot: 'customer'   },
  technician: { label: 'Technician',   dot: 'technician' },
};

// Maps every nav label → page key used by DashboardLayout / AdminDashboard
const labelToPage = {
  // ── Admin ──────────────────────────────────────
  'Dashboard':              'dashboard',
  'User Management':        'userManagement',
  'Shop Requests':          'shopRequests',
  'System Logs':            'systemLogs',

  // ── Owner ──────────────────────────────────────
  'Repairs / Job Orders':   'repairs',
  'Inventory':              'inventory',
  'Customers':              'members',
  'Reports / Analytics':    'reports',
  'Member Management':      'members',

  // ── Technician ─────────────────────────────────
  'Repair Requests':        'repairs',
  'My Jobs':                'repairs',
  'Reviews':                'reviews',

  // ── Customer ───────────────────────────────────
  'My Dashboard':           'dashboard',
  'My Repairs':             'repairs',
  'My Transactions':        'transactions',
  'Notifications':          'notifications',
  'Help & FAQs':            'help',

  // ── Shared ─────────────────────────────────────
  'Settings':               'settings',
};

// Default first active label per role
const defaultActive = {
  admin:      'Dashboard',
  owner:      'Dashboard',
  technician: 'Dashboard',
  customer:   'My Dashboard',
};

export default function Sidebar({ role, username, onNavigate, activePage, onSectionChange }) {
  const [collapsed,  setCollapsed]  = useState(false);
  const [activeLabel, setActiveLabel] = useState(defaultActive[role] ?? 'Dashboard');

  const { label, dot } = roleConfig[role] ?? roleConfig.admin;
  const items = navItems[role] ?? navItems.admin;

  const handleItemClick = (item) => {
    setActiveLabel(item.label);
    const page = labelToPage[item.label];

    // Admin uses in-page section switching via onSectionChange
    if (role === 'admin' && onSectionChange) {
      const sectionMap = {
        'Dashboard':       'Dashboard',
        'User Management': 'User Management',
        'Shop Requests':   'Shop Requests',
        'System Logs':     'System Logs',
      };
      const section = sectionMap[item.label];
      if (section) { onSectionChange(section); return; }
    }

    // All other roles use page navigation
    if (page && onNavigate) onNavigate(page);
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>

      {/* ── Logo row ── */}
      <div className={styles.logoRow}>
        {!collapsed && (
          <div className={styles.logoText}>
            <div className={styles.logoMain}>TechnoLogs</div>
            <div className={styles.logoSub}>Repair Management</div>
          </div>
        )}
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(c => !c)}
          aria-label="Toggle sidebar"
        >
          {collapsed
            ? <Icon name="grid" size={14} />
            : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            )
          }
        </button>
      </div>

      {/* ── Role badge ── */}
      {!collapsed && (
        <div className={styles.roleBadge}>
          <span className={`${styles.dot} ${styles[dot]}`} />
          <span className={styles.roleLabel}>{label}</span>
        </div>
      )}

      {/* ── Nav items ── */}
      <nav className={styles.nav}>
        {items.map((item, i) => {
          if (item.section) {
            if (collapsed) return null;
            return <div key={i} className={styles.section}>{item.section}</div>;
          }

          const isActive = item.label === activeLabel;

          return (
            <div
              key={i}
              className={[
                styles.item,
                isActive  ? styles.active       : '',
                collapsed ? styles.itemCollapsed : '',
              ].join(' ')}
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : undefined}
            >
              <Icon name={item.icon} size={15} />
              {!collapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
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
            <div className={styles.userInfo}>
              <div className={styles.userName}>{username}</div>
              <div className={styles.userRole}>{label}</div>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}