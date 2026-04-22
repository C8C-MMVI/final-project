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
  customers:      { admin: '',               owner: 'Customers',     technician: '',             customer: ''               },
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
  customers:      'TechnoLogs / Customers',
  notifications:  'TechnoLogs / Notifications',
  help:           'TechnoLogs / Help & FAQs',
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
    { label: 'My Dashboard',    page: 'dashboard'    },
    { label: 'My Repairs',      page: 'repairs'      },
    { label: 'My Transactions', page: 'transactions' },
    { label: 'Notifications',   page: 'notifications'},
    { label: 'Help & FAQs',     page: 'help'         },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * timeAgo — converts a UTC timestamp string from PHP into a relative
 * "X ago" label using the browser's LOCAL timezone automatically.
 * No manual offset needed — Date.parse() handles UTC correctly.
 */
function timeAgo(dateStr) {
  // PHP returns "2024-04-22 10:00:00" without a timezone suffix.
  // Appending " UTC" tells the browser to treat it as UTC so it
  // converts correctly to local time before calculating the diff.
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  const diff = Math.floor((Date.now() - new Date(normalized).getTime()) / 1000);

  if (diff < 5)     return 'just now';
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

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
function NotifDropdown({ notifs, loading, onMarkAllRead, onMarkOneRead, onViewAll, onClose }) {
  const unread = notifs.filter(n => !n.is_read);

  return (
    <div
      className={`${styles.dropdown} ${styles.notifDropdown}`}
      // FIX: wider dropdown so long messages don't get cut off
      style={{ width: '360px' }}
    >
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownTitle}>
          Notifications
          {unread.length > 0 && (
            <span className={styles.notifHeaderBadge}>{unread.length} new</span>
          )}
        </span>
        {unread.length > 0 && (
          <button className={styles.markReadBtn} onClick={onMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.notifList}>
        {loading ? (
          <div className={styles.notifEmpty}>Loading…</div>
        ) : notifs.length === 0 ? (
          <div className={styles.notifEmpty}>No notifications yet</div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.notification_id}
              className={`${styles.notifItem} ${!n.is_read ? styles.unread : ''}`}
              onClick={() => !n.is_read && onMarkOneRead(n.notification_id)}
              style={{ cursor: n.is_read ? 'default' : 'pointer' }}
            >
              {/* Unread dot */}
              <div className={styles.notifIcon}>
                <span style={{
                  display: 'block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: '4px',
                  background: n.is_read ? 'rgba(255,255,255,0.12)' : '#1abc9c',
                  boxShadow: n.is_read ? 'none' : '0 0 6px rgba(26,188,156,0.6)',
                }} />
              </div>

              {/* FIX: white-space normal + word-break so long messages wrap */}
              <div className={styles.notifContent} style={{ minWidth: 0 }}>
                <div
                  className={styles.notifDesc}
                  style={{
                    color: n.is_read ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.88)',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    lineHeight: '1.45',
                  }}
                >
                  {n.message}
                </div>
                <div className={styles.notifTime} style={{ marginTop: '3px' }}>
                  {timeAgo(n.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.dropdownFooter}>
        {/* FIX: calls onViewAll which sets section to 'notifications' via DashboardLayout */}
        <button
          className={styles.footerLink}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => { onViewAll(); onClose(); }}
        >
          View all notifications →
        </button>
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
const POLL_MS = 30_000;

export default function Topbar({ role, username, currentPage = 'dashboard', onLogout, onNavigate }) {
  const initials   = (username ?? '??').slice(0, 2).toUpperCase();
  const roleLabel  = roleLabels[role] ?? 'User';
  const pageTitle  = titleMap[currentPage]?.[role]  ?? 'Dashboard';
  const breadcrumb = breadcrumbMap[currentPage]      ?? 'TechnoLogs / Dashboard';

  const [open,    setOpen]    = useState('');
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const rightRef = useRef(null);
  const pollRef  = useRef(null);

  // ── Fetch notifications ───────────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch('/api/notifications.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setNotifs(data.notifications ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchNotifs();
    pollRef.current = setInterval(fetchNotifs, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchNotifs]);

  // ── Mark one read ─────────────────────────────────────────────────────
  const markOneRead = useCallback(async (id) => {
    setNotifs(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    try {
      await fetch(`/api/notifications.php?action=read&id=${id}`, {
        method: 'PATCH', credentials: 'include',
      });
    } catch { /* ignore */ }
  }, []);

  // ── Mark all read ─────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await fetch('/api/notifications.php?action=read_all', {
        method: 'PATCH', credentials: 'include',
      });
    } catch { /* ignore */ }
  }, []);

  // ── FIX: "View all notifications" navigates to the notifications section
  // onNavigate in DashboardLayout accepts a pageKey — 'notifications' maps
  // to setSection('notifications') which renders the notifications view.
  const handleViewAll = useCallback(() => {
    onNavigate?.('notifications');
  }, [onNavigate]);

  // ── Outside click + Escape ────────────────────────────────────────────
  const closeAll = useCallback(() => setOpen(''), []);

  useEffect(() => {
    const handler = (e) => {
      if (rightRef.current && !rightRef.current.contains(e.target)) closeAll();
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
  const unreadCount = notifs.filter(n => !n.is_read).length;

  // ── Logout ────────────────────────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <header className={styles.topbar}>

      {/* Left */}
      <div className={styles.left}>
        <span className={styles.pageTitle}>{pageTitle}</span>
        <span className={styles.breadcrumb}>{breadcrumb}</span>
      </div>

      {/* Right */}
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
            <SearchDropdown role={role} onNavigate={onNavigate} onClose={closeAll} />
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
              <span className={styles.badge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {open === 'notifs' && (
            <NotifDropdown
              notifs={notifs}
              loading={loading}
              onMarkAllRead={markAllRead}
              onMarkOneRead={markOneRead}
              onViewAll={handleViewAll}
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