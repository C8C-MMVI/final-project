// src/components/layout/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import Icon from '../shared/Icon';
import styles from './Topbar.module.css';

const titleMap = {
  owner:      { title: 'Dashboard',       sub: 'TechnoLogs / Dashboard'  },
  admin:      { title: 'Admin Dashboard', sub: 'TechnoLogs / Admin'       },
  customer:   { title: 'My Dashboard',    sub: 'TechnoLogs / My Account'  },
  technician: { title: 'My Repairs',      sub: 'TechnoLogs / Technician'  },
};

// Maps each role to the pages it can navigate to
const roleNavLinks = {
  owner: [
    { label: 'Dashboard',           page: 'dashboard' },
    { label: 'Repairs / Job Orders',page: 'repairs'   },
    { label: 'Inventory',           page: 'inventory' },
    { label: 'Customers',           page: 'members'   },
  ],
  admin: [
    { label: 'Dashboard',           page: 'dashboard' },
    { label: 'Repairs / Job Orders',page: 'repairs'   },
    { label: 'Inventory',           page: 'inventory' },
    { label: 'Members',             page: 'members'   },
  ],
  technician: [
    { label: 'Dashboard',           page: 'dashboard' },
    { label: 'Repairs / Job Orders',page: 'repairs'   },
    { label: 'Inventory',           page: 'inventory' },
  ],
  customer: [
    { label: 'My Dashboard',        page: 'dashboard' },
    { label: 'My Repairs',          page: 'repairs'   },
  ],
};

const initialNotifications = [
  { id: 1, icon: 'wrench',  title: 'New repair job assigned',  desc: 'Job Order #1042 – iPhone 14 Screen', time: '2 min ago',  unread: true  },
  { id: 2, icon: 'package', title: 'Low stock alert',          desc: 'Samsung A54 Battery – only 2 left',  time: '20 min ago', unread: true  },
  { id: 3, icon: 'check',   title: 'Job order completed',      desc: 'Job Order #1038 marked as done',     time: '1 hr ago',   unread: false },
  { id: 4, icon: 'user',    title: 'New customer registered',  desc: 'Maria Santos added to customers',    time: '3 hr ago',   unread: false },
];

const roleLabels = {
  owner:      'Shop Owner',
  admin:      'System Admin',
  customer:   'Customer',
  technician: 'Technician',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

// ── Search dropdown ────────────────────────────────────────────────────────

function SearchDropdown({ role, onNavigate, onClose }) {
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  const links = roleNavLinks[role] ?? roleNavLinks.admin;
  const filtered = links.filter(l =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (page) => {
    onNavigate(page);
    onClose();
  };

  return (
    <div className={styles.dropdown} ref={ref}>
      <div className={styles.searchInputWrap}>
        <Icon name="search" size={14} />
        <input
          autoFocus
          type="text"
          className={styles.searchInput}
          placeholder="Search pages…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className={styles.dropdownLabel}>Quick Links</div>
      {filtered.map((l, i) => (
        <button
          key={i}
          className={styles.searchItem}
          onClick={() => handleSelect(l.page)}
        >
          <Icon name="grid" size={13} />
          {l.label}
        </button>
      ))}
      {filtered.length === 0 && (
        <div className={styles.noResults}>No pages found</div>
      )}
    </div>
  );
}

// ── Notifications dropdown ─────────────────────────────────────────────────

function NotifDropdown({ notifs, onMarkAllRead, onDismiss, onClose }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  const unreadCount = notifs.filter(n => n.unread).length;

  return (
    <div className={`${styles.dropdown} ${styles.notifDropdown}`} ref={ref}>
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownTitle}>Notifications</span>
        {unreadCount > 0 && (
          <button className={styles.markReadBtn} onClick={onMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.notifList}>
        {notifs.length === 0 ? (
          <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '13px' }}>
            No notifications.
          </div>
        ) : (
          notifs.map(n => (
            <div
              key={n.id}
              className={`${styles.notifItem} ${n.unread ? styles.unread : ''}`}
            >
              <div className={styles.notifIcon}>
                <Icon name={n.icon} size={15} />
              </div>
              <div className={styles.notifContent}>
                <div className={styles.notifTitle}>{n.title}</div>
                <div className={styles.notifDesc}>{n.desc}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span className={styles.notifTime}>{n.time}</span>
                <button
                  onClick={() => onDismiss(n.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    padding: 0,
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.dropdownFooter}>
        <button className={styles.footerLink} onClick={onClose}>
          View all notifications →
        </button>
      </div>
    </div>
  );
}

// ── Profile dropdown ───────────────────────────────────────────────────────

function ProfileDropdown({ username, initials, roleLabel, onViewProfile, onLogout, onClose }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  return (
    <div className={`${styles.dropdown} ${styles.profileDropdown}`} ref={ref}>
      <div className={styles.profileInfo}>
        <div className={styles.avatarLg}>{initials}</div>
        <div>
          <div className={styles.profileInfoName}>{username}</div>
          <div className={styles.profileInfoRole}>{roleLabel}</div>
        </div>
      </div>
      <div className={styles.profileMenu}>
        <button
          className={styles.menuItem}
          onClick={() => { onViewProfile(); onClose(); }}
        >
          <Icon name="user" size={14} /> My Profile
        </button>
        <div className={styles.menuDivider} />
        <button
          className={`${styles.menuItem} ${styles.menuDanger}`}
          onClick={onLogout}
        >
          <Icon name="logout" size={14} /> Logout
        </button>
      </div>
    </div>
  );
}

// ── Profile modal ──────────────────────────────────────────────────────────

function ProfileModal({ username, initials, roleLabel, role, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg, #0f1f3a)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '2rem',
          width: '360px',
          maxWidth: '90vw',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text, #fff)' }}>
            My Profile
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px' }}
          >
            ✕
          </button>
        </div>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--accent, #1abc9c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '20px', color: '#fff',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text, #fff)' }}>
              {username}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Info rows */}
        {[
          { label: 'Username', value: username    },
          { label: 'Role',     value: roleLabel   },
          { label: 'Status',   value: 'Active'    },
        ].map(row => (
          <div
            key={row.label}
            style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: '13px',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
            <span style={{ color: 'var(--text, #fff)', fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}

        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem', width: '100%', padding: '10px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', color: 'var(--text, #fff)',
            cursor: 'pointer', fontSize: '14px',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Topbar ────────────────────────────────────────────────────────────

export default function Topbar({ role, username, onLogout, onNavigate }) {
  const initials  = username.slice(0, 2).toUpperCase();
  const roleLabel = roleLabels[role] ?? 'Shop Owner';
  const { title, sub } = titleMap[role] ?? titleMap.owner;

  const [open,           setOpen]           = useState('');
  const [notifs,         setNotifs]         = useState(initialNotifications);
  const [showProfile,    setShowProfile]    = useState(false);
  const [loggingOut,     setLoggingOut]     = useState(false);

  const toggle   = (panel) => setOpen(p => p === panel ? '' : panel);
  const closeAll = () => setOpen('');

  const unreadCount = notifs.filter(n => n.unread).length;

  // Notification actions
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));
  const dismissNotif = (id) => setNotifs(n => n.filter(x => x.id !== id));

  // Logout — calls PHP, then React handler
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    closeAll();
    try {
      await fetch('/api/logout.php', { method: 'POST', credentials: 'include' });
    } catch {
      // proceed regardless
    } finally {
      onLogout?.();
    }
  };

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.left}>
          <div className={styles.pageTitle}>{title}</div>
          <div className={styles.breadcrumb}>{sub}</div>
        </div>

        <div className={styles.right}>

          {/* Search */}
          <div className={styles.dropdownWrapper}>
            <button
              className={styles.iconBtn}
              aria-label="Search"
              onClick={() => toggle('search')}
            >
              <Icon name="search" size={18} />
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
              className={styles.iconBtn}
              aria-label="Notifications"
              onClick={() => toggle('notifs')}
            >
              <Icon name="bell" size={18} />
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </button>
            {open === 'notifs' && (
              <NotifDropdown
                notifs={notifs}
                onMarkAllRead={markAllRead}
                onDismiss={dismissNotif}
                onClose={closeAll}
              />
            )}
          </div>

          {/* Profile */}
          <div className={styles.dropdownWrapper}>
            <button
              className={styles.profileBtn}
              aria-label="Profile"
              onClick={() => toggle('profile')}
            >
              <div className={`${styles.avatar} ${styles[role]}`}>{initials}</div>
              <div className={styles.profileMeta}>
                <span className={styles.profileName}>{username}</span>
                <span className={styles.profileRole}>{roleLabel}</span>
              </div>
              <Icon name="bar" size={12} />
            </button>
            {open === 'profile' && (
              <ProfileDropdown
                username={username}
                initials={initials}
                roleLabel={roleLabel}
                onViewProfile={() => setShowProfile(true)}
                onLogout={handleLogout}
                onClose={closeAll}
              />
            )}
          </div>

        </div>
      </header>

      {/* Profile modal — rendered outside header to avoid z-index issues */}
      {showProfile && (
        <ProfileModal
          username={username}
          initials={initials}
          roleLabel={roleLabel}
          role={role}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}