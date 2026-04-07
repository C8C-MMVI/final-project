// src/components/layout/Topbar.jsx
import { useState, useRef, useEffect } from 'react';
import Icon from '../shared/Icon';
import styles from './Topbar.module.css';

const titleMap = {
  owner:    { title: 'Dashboard',       sub: 'TechnoLogs / Dashboard' },
  admin:    { title: 'Admin Dashboard', sub: 'TechnoLogs / Admin' },
  customer: { title: 'My Dashboard',   sub: 'TechnoLogs / My Account' },
};

const navLinks = [
  { label: 'Dashboard' },
  { label: 'Repairs / Job Orders' },
  { label: 'Inventory' },
  { label: 'Customers' },
  { label: 'Reports / Analytics' },
];

const notificationsData = [
  { id: 1, icon: 'wrench',  title: 'New repair job assigned',  desc: 'Job Order #1042 – iPhone 14 Screen', time: '2 min ago',  unread: true  },
  { id: 2, icon: 'package', title: 'Low stock alert',          desc: 'Samsung A54 Battery – only 2 left',  time: '20 min ago', unread: true  },
  { id: 3, icon: 'check',   title: 'Job order completed',      desc: 'Job Order #1038 marked as done',     time: '1 hr ago',   unread: false },
  { id: 4, icon: 'user',    title: 'New customer registered',  desc: 'Maria Santos added to customers',    time: '3 hr ago',   unread: false },
];

function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

function SearchDropdown({ onClose }) {
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  const filtered = navLinks.filter(l => l.label.toLowerCase().includes(query.toLowerCase()));
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
        <button key={i} className={styles.searchItem} onClick={onClose}>
          <Icon name="grid" size={13} />
          {l.label}
        </button>
      ))}
      {filtered.length === 0 && <div className={styles.noResults}>No pages found</div>}
    </div>
  );
}

function NotifDropdown({ onClose }) {
  const [notifs, setNotifs] = useState(notificationsData);
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, unread: false })));
  const unreadCount = notifs.filter(n => n.unread).length;
  return (
    <div className={`${styles.dropdown} ${styles.notifDropdown}`} ref={ref}>
      <div className={styles.dropdownHeader}>
        <span className={styles.dropdownTitle}>Notifications</span>
        {unreadCount > 0 && (
          <button className={styles.markReadBtn} onClick={markAllRead}>Mark all read</button>
        )}
      </div>
      <div className={styles.notifList}>
        {notifs.map(n => (
          <div key={n.id} className={`${styles.notifItem} ${n.unread ? styles.unread : ''}`}>
            <div className={styles.notifIcon}><Icon name={n.icon} size={15} /></div>
            <div className={styles.notifContent}>
              <div className={styles.notifTitle}>{n.title}</div>
              <div className={styles.notifDesc}>{n.desc}</div>
            </div>
            <span className={styles.notifTime}>{n.time}</span>
          </div>
        ))}
      </div>
      <div className={styles.dropdownFooter}>
        <button className={styles.footerLink} onClick={onClose}>View all notifications →</button>
      </div>
    </div>
  );
}

function ProfileDropdown({ username, initials, roleLabel, onClose }) {
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
        <button className={styles.menuItem} onClick={onClose}>
          <Icon name="user" size={14} /> My Profile
        </button>
        <div className={styles.menuDivider} />
        <button className={`${styles.menuItem} ${styles.menuDanger}`} onClick={onClose}>
          <Icon name="logout" size={14} /> Logout
        </button>
      </div>
    </div>
  );
}

const roleLabels = { owner: 'Shop Owner', admin: 'System Admin', customer: 'Customer' };

export default function Topbar({ role, username }) {
  const initials  = username.slice(0, 2).toUpperCase();
  const roleLabel = roleLabels[role] ?? 'Shop Owner';
  const { title, sub } = titleMap[role] ?? titleMap.owner;

  const [open, setOpen] = useState('');
  const toggle = (panel) => setOpen(p => p === panel ? '' : panel);
  const closeAll = () => setOpen('');

  const unreadCount = notificationsData.filter(n => n.unread).length;

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.pageTitle}>{title}</div>
        <div className={styles.breadcrumb}>{sub}</div>
      </div>

      <div className={styles.right}>

        {/* Search */}
        <div className={styles.dropdownWrapper}>
          <button className={styles.iconBtn} aria-label="Search" onClick={() => toggle('search')}>
            <Icon name="search" size={18} />
          </button>
          {open === 'search' && <SearchDropdown onClose={closeAll} />}
        </div>

        {/* Notifications */}
        <div className={styles.dropdownWrapper}>
          <button className={styles.iconBtn} aria-label="Notifications" onClick={() => toggle('notifs')}>
            <Icon name="bell" size={18} />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>
          {open === 'notifs' && <NotifDropdown onClose={closeAll} />}
        </div>

        {/* Profile */}
        <div className={styles.dropdownWrapper}>
          <button className={styles.profileBtn} aria-label="Profile" onClick={() => toggle('profile')}>
            <div className={`${styles.avatar} ${styles[role]}`}>{initials}</div>
            <div className={styles.profileMeta}>
              <span className={styles.profileName}>{username}</span>
              <span className={styles.profileRole}>{roleLabel}</span>
            </div>
            <Icon name="bar" size={12} />
          </button>
          {open === 'profile' && (
            <ProfileDropdown username={username} initials={initials} roleLabel={roleLabel} onClose={closeAll} />
          )}
        </div>

      </div>
    </header>
  );
}
