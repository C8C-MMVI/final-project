// src/components/layout/Sidebar.jsx
import { useState } from 'react';
import styles from './Sidebar.module.css';

const roleConfig = {
  admin:      { label: 'System Admin', dot: 'admin'      },
  owner:      { label: 'Shop Owner',   dot: 'owner'      },
  technician: { label: 'Technician',   dot: 'technician' },
  customer:   { label: 'Customer',     dot: 'customer'   },
};

// Sidebar label → section key (must match SECTION_MAP in DashboardLayout)
const LABEL_TO_SECTION = {
  // admin
  'Dashboard':             'dashboard',
  'User Management':       'userManagement',
  'Shop Requests':         'shopRequests',
  'System Logs':           'systemLogs',
  // owner
  'Repairs / Job Orders':  'repairs',
  'Customers':             'customers',
  'Reports / Analytics':   'reports',
  'Member Management':     'members',
  // technician
  'Repair Requests':       'repairs',
  'My Jobs':               'repairs',
  'Reviews':               'reviews',
  // customer
  'My Dashboard':          'dashboard',
  'My Repairs':            'repairs',
  'My Transactions':       'transactions',
  'Notifications':         'notifications',
  'Help & FAQs':           'help',
};

const NAV = {
  admin: [
    { section: 'Main' },
    { label: 'Dashboard',       page: 'dashboard',      icon: <IconGrid />     },
    { section: 'Platform' },
    { label: 'User Management', page: 'userManagement', icon: <IconUserPlus /> },
    { label: 'Shop Requests',   page: 'shopRequests',   icon: <IconHome />     },
    { label: 'System Logs',     page: 'systemLogs',     icon: <IconDoc />      },
  ],
  owner: [
    { section: 'Main' },
    { label: 'Dashboard',             page: 'dashboard', icon: <IconGrid />     },
    { section: 'Shop' },
    { label: 'Repairs / Job Orders',  page: 'repairs',   icon: <IconTool />    },
    { label: 'Customers',             page: 'members',   icon: <IconUsers />    },
    { section: 'Insights' },
    { label: 'Reports / Analytics',   page: 'reports',   icon: <IconChart />   },
    { section: 'Team' },
    { label: 'Member Management',     page: 'members',   icon: <IconUserPlus />},
  ],
  technician: [
    { section: 'Main' },
    { label: 'Dashboard',       page: 'dashboard', icon: <IconGrid />  },
    { section: 'Work' },
    { label: 'Repair Requests', page: 'repairs',   icon: <IconDoc />   },
    { label: 'My Jobs',         page: 'repairs',   icon: <IconTool />  },
    { label: 'Reviews',         page: 'reviews',   icon: <IconStar />  },
  ],
  customer: [
    { section: 'My Account' },
    { label: 'My Dashboard',    page: 'dashboard',     icon: <IconGrid />  },
    { label: 'My Repairs',      page: 'repairs',       icon: <IconTool />  },
    { label: 'My Transactions', page: 'transactions',  icon: <IconPeso />  },
    { section: 'Support' },
    { label: 'Notifications',   page: 'notifications', icon: <IconBell /> },
    { label: 'Help & FAQs',     page: 'help',          icon: <IconHelp /> },
  ],
};

// ── Icons ─────────────────────────────────────────────────────────────────
function IconGrid()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconTool()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>; }
function IconUserPlus() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><line x1="19" y1="8" x2="23" y2="8"/><line x1="21" y1="6" x2="21" y2="10"/></svg>; }
function IconHome()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconDoc()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>; }
function IconBox()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function IconUsers()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IconChart()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function IconStar()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function IconPeso()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function IconBell()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function IconHelp()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function IconLogout()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function IconChevronLeft() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>; }

// ── Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar({ role, username, onNavigate, onLogout, activeSection }) {
  const [collapsed, setCollapsed] = useState(false);
  const { label, dot } = roleConfig[role] ?? roleConfig.admin;
  const items           = NAV[role]        ?? NAV.admin;

  const handleItemClick = (item) => {
    if (onNavigate) onNavigate(item.page, item.label);
  };

  const handleLogout = () => {
    if (onLogout) { onLogout(); return; }
    window.location.href = '/api/logout.php';
  };

  // Match the active sidebar item against the current section from DashboardLayout
  const isActive = (item) => {
    const itemSection = LABEL_TO_SECTION[item.label];
    if (itemSection === undefined) return false;
    return itemSection === activeSection;
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`} id="sidebar">

      {/* Header */}
      <div className={styles.header}>
        <img src="/images/Logo.png" alt="TechnoLogs" className={styles.logo} />
        <button className={styles.toggleBtn} onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
          <IconChevronLeft />
        </button>
      </div>

      {/* Role badge */}
      <div className={styles.roleBadge}>
        <span className={`${styles.roleDot} ${styles[`dot_${dot}`]}`} />
        <span className={styles.roleLabel}>{label}</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {items.map((item, i) => {
          if (item.section) {
            return <span key={i} className={styles.sectionLabel}>{item.section}</span>;
          }
          return (
            <a
              key={i}
              className={`${styles.navItem} ${isActive(item) ? styles.navItemActive : ''}`}
              onClick={() => handleItemClick(item)}
              data-tooltip={item.label}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleItemClick(item)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className={styles.footer}>
        <div className={styles.divider} />
        <a
          className={`${styles.navItem} ${styles.navItemLogout}`}
          onClick={handleLogout}
          data-tooltip="Logout"
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleLogout()}
        >
          <span className={styles.navIcon}><IconLogout /></span>
          <span className={styles.navLabel}>Logout</span>
        </a>
      </div>

    </aside>
  );
}