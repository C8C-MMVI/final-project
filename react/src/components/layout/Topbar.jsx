// src/components/layout/Topbar.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './Topbar.module.css';
import SearchDropdown from './SearchDropdown';

const roleLabels = {
  admin:      'System Admin',
  owner:      'Shop Owner',
  technician: 'Technician',
  customer:   'Customer',
};

const titleMap = {
  dashboard:      { admin: 'Admin Dashboard', owner: 'Dashboard',    technician: 'My Jobs',        customer: 'My Dashboard'    },
  repairs:        { admin: 'Repair Jobs',     owner: 'Repair Jobs',  technician: 'My Jobs',        customer: 'My Repairs'      },
  userManagement: { admin: 'User Management', owner: '',             technician: '',               customer: ''               },
  shopRequests:   { admin: 'Shop Requests',   owner: '',             technician: '',               customer: ''               },
  systemLogs:     { admin: 'System Logs',     owner: '',             technician: '',               customer: ''               },
  members:        { admin: 'Members',         owner: 'Members',      technician: '',               customer: ''               },
  reports:        { admin: 'Reports',         owner: 'Analytics',    technician: '',               customer: ''               },
  transactions:   { admin: 'Transactions',    owner: 'Transactions', technician: '',               customer: 'My Transactions' },
  reviews:        { admin: '',               owner: '',             technician: 'Reviews',        customer: ''               },
  profile:        { admin: 'My Profile',      owner: 'My Profile',   technician: 'My Profile',     customer: 'My Profile'      },
  customers:      { admin: '',               owner: 'Customers',    technician: '',               customer: ''               },
  notifications:  { admin: 'Notifications',   owner: 'Notifications', technician: 'Notifications', customer: 'Notifications'   },
  help:           { admin: 'Help & FAQs',     owner: 'Help & FAQs',  technician: 'Help & FAQs',    customer: 'Help & FAQs'     },
  shop:           { admin: '',               owner: '',             technician: '',               customer: 'Register My Shop' },
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
  shop:           'TechnoLogs / Register My Shop',
};

function timeAgo(dateStr) {
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  const diff = Math.floor((Date.now() - new Date(normalized).getTime()) / 1000);
  if (diff < 5)     return 'just now';
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Avatar({ src, initials, size = 32, className = '' }) {
  const [imgErr, setImgErr] = useState(false);
  useEffect(() => { setImgErr(false); }, [src]);
  const showImg = src && !imgErr;
  const base = {
    width: size, height: size, borderRadius: '50%',
    overflow: 'hidden', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(13,31,26,0.08)',
    fontSize: size * 0.38, fontWeight: 600,
    color: 'rgba(13,31,26,0.6)',
    userSelect: 'none',
  };
  return (
    <div style={base} className={className}>
      {showImg
        ? <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} />
        : <span>{initials}</span>
      }
    </div>
  );
}

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

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

function NotifDropdown({ notifs, loading, unreadChatCount, onMarkAllRead, onMarkOneRead, onViewAll, onClose }) {
  const systemUnread = notifs.filter(n => !n.is_read).length;
  // Total unread = system notifications + unread chat messages
  const totalUnread  = systemUnread + unreadChatCount;

  return (
    <div className={`${styles.dropdown} ${styles.notifDropdown}`}>
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownTitle}>
          Notifications
          {totalUnread > 0 && (
            <span className={styles.notifHeaderBadge}>{totalUnread} new</span>
          )}
        </span>
        {systemUnread > 0 && (
          <button className={styles.markReadBtn} onClick={onMarkAllRead}>Mark all read</button>
        )}
      </div>

      <div className={styles.notifList}>
        {loading ? (
          <div className={styles.notifEmpty}>Loading…</div>
        ) : (
          <>
            {/* ── Unread chat messages summary item ── */}
            {unreadChatCount > 0 && (
              <div
                className={`${styles.notifItem} ${styles.unread}`}
                style={{ cursor: 'pointer' }}
                onClick={() => { onClose(); }}
              >
                <div className={styles.notifIcon}>
                  <span style={{
                    display: 'block', width: 8, height: 8, borderRadius: '50%',
                    flexShrink: 0, marginTop: 4,
                    background: '#3b82f6',
                    boxShadow: '0 0 6px rgba(59,130,246,0.5)',
                  }} />
                </div>
                <div className={styles.notifContent} style={{ minWidth: 0 }}>
                  <div className={styles.notifDesc} style={{
                    color: '#0a1c16', whiteSpace: 'normal',
                    wordBreak: 'break-word', lineHeight: '1.45', fontWeight: 500,
                  }}>
                    💬 You have {unreadChatCount} unread chat message{unreadChatCount !== 1 ? 's' : ''} — go to your repairs to reply
                  </div>
                </div>
              </div>
            )}

            {/* ── System notifications ── */}
            {notifs.length === 0 && unreadChatCount === 0 ? (
              <div className={styles.notifEmpty}>No notifications yet</div>
            ) : notifs.length === 0 ? null : (
              notifs.map((n) => (
                <div
                  key={n.notification_id}
                  className={`${styles.notifItem} ${!n.is_read ? styles.unread : ''}`}
                  onClick={() => !n.is_read && onMarkOneRead(n.notification_id)}
                  style={{ cursor: n.is_read ? 'default' : 'pointer' }}
                >
                  <div className={styles.notifIcon}>
                    <span style={{
                      display: 'block', width: 8, height: 8, borderRadius: '50%',
                      flexShrink: 0, marginTop: 4,
                      background: n.is_read ? 'rgba(13,31,26,0.15)' : '#1abc9c',
                      boxShadow: n.is_read ? 'none' : '0 0 6px rgba(26,188,156,0.5)',
                    }} />
                  </div>
                  <div className={styles.notifContent} style={{ minWidth: 0 }}>
                    <div className={styles.notifDesc} style={{
                      color: n.is_read ? 'rgba(13,31,26,0.4)' : '#0a1c16',
                      whiteSpace: 'normal', wordBreak: 'break-word',
                      lineHeight: '1.45', fontWeight: n.is_read ? 400 : 500,
                    }}>
                      {n.message}
                    </div>
                    <div className={styles.notifTime} style={{ marginTop: 3 }}>
                      {timeAgo(n.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      <div className={styles.dropdownFooter}>
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

function ProfileDropdown({ username, initials, avatar, roleLabel, onLogout, onNavigate, onClose }) {
  const handleProfile = () => { onNavigate?.('profile'); onClose(); };
  return (
    <div className={`${styles.dropdown} ${styles.profileDropdown}`}>
      <div className={styles.profileInfo}>
        <Avatar src={avatar} initials={initials} size={48} className={styles.avatarLg} />
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

const POLL_MS = 30_000;

export default function Topbar({
  role,
  username,
  avatar,
  currentPage = 'dashboard',
  onLogout,
  onNavigate,
  onMenuToggle,
  unreadChatCount = 0,   // passed from DashboardLayout → useChatUnread
}) {
  const initials   = (username ?? '??').slice(0, 2).toUpperCase();
  const roleLabel  = roleLabels[role] ?? 'User';
  const pageTitle  = titleMap[currentPage]?.[role]  ?? '';
  const breadcrumb = breadcrumbMap[currentPage]      ?? 'TechnoLogs';

  const [open,    setOpen]    = useState('');
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  const rightRef = useRef(null);
  const pollRef  = useRef(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch('/api/notifications.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setNotifs(data.notifications ?? []);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchNotifs();
    pollRef.current = setInterval(fetchNotifs, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchNotifs]);

  const markOneRead = useCallback(async (id) => {
    setNotifs(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    try {
      await fetch(`/api/notifications.php?action=read&id=${id}`, { method: 'PATCH', credentials: 'include' });
    } catch { }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await fetch('/api/notifications.php?action=read_all', { method: 'PATCH', credentials: 'include' });
    } catch { }
  }, []);

  const handleViewAll = useCallback(() => { onNavigate?.('notifications'); }, [onNavigate]);
  const closeAll      = useCallback(() => setOpen(''), []);

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

  // Bell badge = unread system notifications + unread chat messages
  const systemUnread = notifs.filter(n => !n.is_read).length;
  const bellCount    = systemUnread + unreadChatCount;

  const handleLogout = async () => {
    closeAll();
    try {
      await fetch('/api/logout.php', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    if (typeof onLogout === 'function') onLogout();
    else window.location.href = '/login';
  };

  return (
    <header className={styles.topbar}>

      {/* Left */}
      <div className={styles.left}>
        <button className={styles.hamburger} onClick={onMenuToggle} aria-label="Open menu">
          <IconMenu />
        </button>
        <div className={styles.leftText}>
          <span className={styles.pageTitle}>{pageTitle}</span>
          <span className={styles.breadcrumb}>{breadcrumb}</span>
        </div>
      </div>

      {/* Right */}
      <div className={styles.right} ref={rightRef}>

        {/* Search */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.iconBtn} ${open === 'search' ? styles.iconBtnActive : ''}`}
            aria-label="Search" aria-expanded={open === 'search'}
            onClick={() => toggle('search')}
          >
            <IconSearch />
          </button>
          {open === 'search' && (
            <SearchDropdown role={role} onNavigate={onNavigate} onClose={closeAll} />
          )}
        </div>

        {/* Bell — shows system notifs + unread chat count combined */}
        <div className={styles.dropdownWrapper}>
          <button
            className={`${styles.iconBtn} ${open === 'notifs' ? styles.iconBtnActive : ''}`}
            aria-label="Notifications" aria-expanded={open === 'notifs'}
            onClick={() => toggle('notifs')}
          >
            <IconBell />
            {bellCount > 0 && (
              <span className={styles.badge}>
                {bellCount > 99 ? '99+' : bellCount}
              </span>
            )}
          </button>
          {open === 'notifs' && (
            <NotifDropdown
              notifs={notifs}
              loading={loading}
              unreadChatCount={unreadChatCount}
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
            aria-label="Profile menu" aria-expanded={open === 'profile'}
            onClick={() => toggle('profile')}
          >
            <Avatar src={avatar} initials={initials} size={32} className={styles.avatar} />
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
              avatar={avatar}
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