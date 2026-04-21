// src/components/layout/Topbar.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Topbar.module.css';

// ── Role config ───────────────────────────────────────────────────────────
const roleLabels = {
  admin:      'System Admin',
  owner:      'Shop Owner',
  technician: 'Technician',
  customer:   'Customer',
};

// ── Page title + breadcrumb maps ──────────────────────────────────────────
const titleMap = {
  dashboard:      { admin: 'Admin Dashboard', owner: 'Dashboard',    technician: 'My Dashboard', customer: 'My Dashboard'   },
  repairs:        { admin: 'Repair Jobs',     owner: 'Repair Jobs',  technician: 'My Jobs',      customer: 'My Repairs'     },
  userManagement: { admin: 'User Management', owner: '',             technician: '',             customer: ''               },
  shopRequests:   { admin: 'Shop Requests',   owner: '',             technician: '',             customer: ''               },
  systemLogs:     { admin: 'System Logs',     owner: '',             technician: '',             customer: ''               },
  members:        { admin: 'Members',         owner: 'Customers',    technician: '',             customer: ''               },
  reports:        { admin: 'Reports',         owner: 'Analytics',    technician: '',             customer: ''               },
  transactions:   { admin: 'Transactions',    owner: 'Transactions', technician: '',             customer: 'My Transactions' },
  reviews:        { admin: '',                owner: '',             technician: 'Reviews',      customer: ''               },
  profile:        { admin: 'My Profile',      owner: 'My Profile',   technician: 'My Profile',   customer: 'My Profile'     },
  customers: { admin: '', owner: 'Customers', technician: '', customer: '' },
  // ── FIX: added missing customer sections ─────────────────────────────
  notifications:  { admin: 'Notifications',   owner: 'Notifications', technician: 'Notifications', customer: 'Notifications' },
  help:           { admin: 'Help & FAQs',      owner: 'Help & FAQs',   technician: 'Help & FAQs',   customer: 'Help & FAQs'   },
};

const breadcrumbMap = {
  dashboard:      'TechnoLogs / Dashboard',
  repairs:        'TechnoLogs / Repairs',
  userManagement: 'TechnoLogs / User Management',
  shopRequests:   'TechnoLogs / Shop Requests',
  systemLogs:     'TechnoLogs / System Logs',
  members:        'TechnoLogs / Members',
  reports:        'TechnoLogs / Reports',
  transactions:   'TechnoLogs / Transactions',
  reviews:        'TechnoLogs / Reviews',
  profile:        'TechnoLogs / My Profile',
  // ── FIX: added missing customer sections ─────────────────────────────
  notifications:  'TechnoLogs / Notifications',
  help:           'TechnoLogs / Help & FAQs',
  customers: 'TechnoLogs / Customers',
};

// ── Quick-links per role ──────────────────────────────────────────────────
const roleNavLinks = {
  admin: [
    { label: 'Dashboard',       page: 'dashboard'      },
    { label: 'User Management', page: 'userManagement' },
    { label: 'Shop Requests',   page: 'shopRequests'   },
    { label: 'System Logs',     page: 'systemLogs'     },
  ],
  owner: [
    { label: 'Dashboard',            page: 'dashboard' },
    { label: 'Repairs / Job Orders', page: 'repairs'   },
    { label: 'Customers',            page: 'members'   },
    { label: 'Reports / Analytics',  page: 'reports'   },
  ],
  technician: [
    { label: 'Dashboard',       page: 'dashboard' },
    { label: 'Repair Requests', page: 'repairs'   },
    { label: 'My Jobs',         page: 'repairs'   },
  ],
  customer: [
    { label: 'My Dashboard',    page: 'dashboard'     },
    { label: 'My Repairs',      page: 'repairs'       },
    { label: 'My Transactions', page: 'transactions'  },
    { label: 'Notifications',   page: 'notifications' },
    { label: 'Help & FAQs',     page: 'help'          },
  ],
};

// ── SVG Icons ─────────────────────────────────────────────────────────────
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconTool = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const notifIconMap = {
  repair: <IconTool />,
  done:   <IconCheck />,
  stock:  <IconBox />,
  user:   <IconUser />,
};

// ── Search Dropdown ───────────────────────────────────────────────────────
function SearchDropdown({ role, onNavigate, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef          = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  const links    = roleNavLinks[role] ?? roleNavLinks.admin;
  const filtered = query.trim()
    ? links.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))
    : links;

  const handleSelect = (page) => {
    onNavigate?.(page);
    onClose();
  };

  return (
    <div className={`${styles.dropdown} ${styles.searchDropdown}`}>
      <div className={styles.searchInputWrap}>
        <span className={styles.searchIcon}><IconSearch /></span>
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Search pages…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className={styles.dropdownLabel}>Quick Links</div>
      <div>
        {filtered.length === 0 ? (
          <div className={styles.noResults}>No results found</div>
        ) : (
          filtered.map((l, i) => (
            <button key={i} className={styles.searchItem} onClick={() => handleSelect(l.page)}>
              <span className={styles.searchItemIcon}><IconChevronRight /></span>
              {l.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ── Notifications Dropdown ────────────────────────────────────────────────
function NotifDropdown({ notifs, onMarkAllRead, onClose }) {
  return (
    <div className={`${styles.dropdown} ${styles.notifDropdown}`}>
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownTitle}>Notifications</span>
        <button className={styles.markReadBtn} onClick={onMarkAllRead}>
          Mark all read
        </button>
      </div>
      <div className={styles.notifList}>
        {notifs.length === 0 ? (
          <div className={styles.notifEmpty}>No notifications</div>
        ) : (
          notifs.map((n, i) => (
            <div key={n.id ?? i} className={`${styles.notifItem} ${n.unread ? styles.unread : ''}`}>
              <div className={styles.notifIcon}>
                {notifIconMap[n.icon] ?? <IconTool />}
              </div>
              <div className={styles.notifContent}>
                <div className={styles.notifTitle}>{n.title}</div>
                <div className={styles.notifDesc}>{n.desc}</div>
              </div>
              <span className={styles.notifTime}>{n.time}</span>
            </div>
          ))
        )}
      </div>
      <div className={styles.dropdownFooter}>
        <a
          href="#"
          className={styles.footerLink}
          onClick={e => { e.preventDefault(); onClose(); }}
        >
          View all notifications →
        </a>
      </div>
    </div>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────
function ProfileDropdown({ username, initials, roleLabel, onLogout, onNavigate, onClose }) {
  const handleProfile = () => {
    onNavigate?.('profile');
    onClose();
  };

  return (
    <div className={`${styles.dropdown} ${styles.profileDropdown}`}>
      <div className={styles.profileInfo}>
        <div className={`${styles.avatar} ${styles.avatarLg}`}>{initials}</div>
        <div>
          <div className={styles.profileInfoName}>{username}</div>
          <div className={styles.profileInfoRole}>{roleLabel}</div>
        </div>
      </div>
      <div className={styles.profileMenu}>
        <button className={styles.menuItem} onClick={handleProfile}>
          <span className={styles.menuIcon}><IconUser /></span>
          My Profile
        </button>
        <div className={styles.menuDivider} />
        <button className={`${styles.menuItem} ${styles.menuDanger}`} onClick={onLogout}>
          <span className={styles.menuIcon}><IconLogout /></span>
          Logout
        </button>
      </div>
    </div>
  );
}

// ── Main Topbar ───────────────────────────────────────────────────────────
export default function Topbar({ role, username, currentPage = 'dashboard', onLogout, onNavigate }) {
  const initials   = (username ?? '??').slice(0, 2).toUpperCase();
  const roleLabel  = roleLabels[role] ?? 'User';
  const pageTitle  = titleMap[currentPage]?.[role]  ?? 'Dashboard';
  const breadcrumb = breadcrumbMap[currentPage]      ?? 'TechnoLogs / Dashboard';

  const [open,   setOpen]   = useState('');
  const [notifs, setNotifs] = useState([]);

  const rightRef = useRef(null);

  useEffect(() => {
    fetch('/api/topbar.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.notifications) setNotifs(data.notifications); })
      .catch(() => {});
  }, []);

  const closeAll = useCallback(() => setOpen(''), []);

  useEffect(() => {
    const handler = (e) => {
      if (rightRef.current && !rightRef.current.contains(e.target)) {
        closeAll();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeAll]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeAll]);

  const toggle = (panel) => setOpen(prev => prev === panel ? '' : panel);

  const unreadCount = notifs.filter(n => n.unread).length;
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));

  const handleLogout = async () => {
    closeAll();
    try {
      const res  = await fetch('/api/logout.php', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!data.success) console.warn('Logout API returned success: false');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <header className={styles.topbar}>

      {/* ── Left ── */}
      <div className={styles.left}>
        <span className={styles.pageTitle}>{pageTitle}</span>
        <span className={styles.breadcrumb}>{breadcrumb}</span>
      </div>

      {/* ── Right — ref wraps ALL buttons + dropdowns ── */}
      <div className={styles.right} ref={rightRef}>

        {/* Search */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.iconBtn} ${open === 'search' ? styles.iconBtnActive : ''}`}
            aria-label="Search"
            aria-expanded={open === 'search'}
            onClick={() => toggle('search')}
          >
            <IconSearch />
          </button>
          {open === 'search' && (
            <SearchDropdown
              role={role}
              onNavigate={onNavigate}
              onClose={closeAll}
            />
          )}
        </div>

        {/* Notifications */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.iconBtn} ${open === 'notifs' ? styles.iconBtnActive : ''}`}
            aria-label="Notifications"
            aria-expanded={open === 'notifs'}
            onClick={() => toggle('notifs')}
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>
          {open === 'notifs' && (
            <NotifDropdown
              notifs={notifs}
              onMarkAllRead={markAllRead}
              onClose={closeAll}
            />
          )}
        </div>

        {/* Profile */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.profileBtn} ${open === 'profile' ? styles.profileBtnActive : ''}`}
            aria-label="Profile menu"
            aria-expanded={open === 'profile'}
            onClick={() => toggle('profile')}
          >
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileMeta}>
              <span className={styles.profileName}>{username}</span>
              <span className={styles.profileRole}>{roleLabel}</span>
            </div>
            <span className={`${styles.profileChevron} ${open === 'profile' ? styles.profileChevronOpen : ''}`}>
              <IconChevronDown />
            </span>
          </button>
          {open === 'profile' && (
            <ProfileDropdown
              username={username}
              initials={initials}
              roleLabel={roleLabel}
              onLogout={handleLogout}
              onNavigate={onNavigate}
              onClose={closeAll}
            />
          )}
        </div>

      </div>
    </header>
  );
}