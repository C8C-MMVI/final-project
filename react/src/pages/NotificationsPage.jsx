import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Panel from '../components/shared/Panel';
import styles from './AdminDashboard.module.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  const diff = Math.floor((Date.now() - new Date(normalized).getTime()) / 1000);
  if (diff < 5)     return 'just now';
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsPage() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifs = () => {
    setLoading(true);
    fetch('/api/notifications.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.success) setNotifs(data.notifications ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
    window.addEventListener('focus', fetchNotifs);
    return () => window.removeEventListener('focus', fetchNotifs);
  }, []);

  const markRead = async (id) => {
    setNotifs(prev => prev.map(n =>
      n.notification_id === id ? { ...n, is_read: true } : n
    ));
    await fetch(`/api/notifications.php?action=read&id=${id}`, {
      method: 'PATCH',
      credentials: 'include',
    });
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    await fetch('/api/notifications.php?action=read_all', {
      method: 'PATCH',
      credentials: 'include',
    });
  };

  const handleClick = async (n) => {
    if (!n.is_read) await markRead(n.notification_id);
    if (n.link) navigate(n.link);
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className={styles.section}>
      <Panel
        title={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        linkLabel={unread > 0 ? 'Mark all read' : undefined}
        onLink={unread > 0 ? markAllRead : undefined}
      >
        {loading ? (
          <div className={styles.empty}>Loading…</div>

        ) : notifs.length === 0 ? (
          <div className={styles.empty}>No notifications yet.</div>

        ) : (
          <div style={{ padding: '8px 0' }}>
            {notifs.map(n => (
              <div
                key={n.notification_id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(13,31,26,0.05)',
                  cursor: !n.is_read || n.link ? 'pointer' : 'default',
                  opacity: n.is_read ? 0.5 : 1,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!n.is_read || n.link)
                    e.currentTarget.style.background = 'rgba(26,188,156,0.03)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Unread dot */}
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  flexShrink: 0,
                  marginTop: 6,
                  background: n.is_read ? 'rgba(13,31,26,0.15)' : '#1abc9c',
                  boxShadow: n.is_read ? 'none' : '0 0 6px rgba(26,188,156,0.5)',
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.83rem',
                    fontWeight: n.is_read ? 400 : 500,
                    color: n.is_read ? 'rgba(13,31,26,0.4)' : '#0a1c16',
                    lineHeight: 1.5,
                  }}>
                    {n.message}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'rgba(13,31,26,0.35)',
                    marginTop: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    {timeAgo(n.created_at)}
                    {n.link && (
                      <span style={{ color: '#1abc9c' }}>· View →</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}