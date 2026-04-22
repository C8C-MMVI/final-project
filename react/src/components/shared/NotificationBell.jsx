import { useEffect, useRef } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    open,
    toggleOpen,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        if (open) toggleOpen();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, toggleOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full border-none cursor-pointer transition-all duration-200"
        style={{
          background: open ? 'rgba(26,188,156,0.15)' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(26,188,156,0.2)',
        }}
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={open ? '#1abc9c' : 'rgba(255,255,255,0.6)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center rounded-full font-bold text-white"
            style={{
              background: '#e74c3c',
              fontSize: '0.6rem',
              minWidth: '16px',
              height: '16px',
              padding: '0 3px',
              boxShadow: '0 0 6px rgba(231,76,60,0.6)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 mt-2 flex flex-col rounded-xl overflow-hidden z-50"
          style={{
            width: '320px',
            background: 'rgba(10,22,44,0.98)',
            border: '1px solid rgba(26,188,156,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(26,188,156,0.12)' }}
          >
            <span className="font-koho font-semibold text-white text-[0.92rem]">
              Notifications
              {unreadCount > 0 && (
                <span
                  className="ml-2 px-[6px] py-[1px] rounded-full text-[0.65rem] font-bold"
                  style={{ background: 'rgba(26,188,156,0.2)', color: '#1abc9c' }}
                >
                  {unreadCount} new
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="font-koho text-[0.72rem] border-none cursor-pointer bg-transparent transition-colors"
                style={{ color: '#1abc9c' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = '#1abc9c'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="font-koho text-[rgba(255,255,255,0.3)] text-[0.8rem]">
                  No notifications yet
                </span>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.notification_id}
                  onClick={() => !n.is_read && markAsRead(n.notification_id)}
                  className="flex gap-3 px-4 py-3 cursor-pointer transition-all duration-150"
                  style={{
                    background: n.is_read
                      ? 'transparent'
                      : 'rgba(26,188,156,0.06)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(26,188,156,0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(26,188,156,0.06)'}
                >
                  {/* Unread dot */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: n.is_read ? 'rgba(255,255,255,0.1)' : '#1abc9c',
                        boxShadow: n.is_read ? 'none' : '0 0 6px rgba(26,188,156,0.6)',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-[3px] flex-1 min-w-0">
                    <p
                      className="font-koho text-[0.82rem] leading-snug"
                      style={{ color: n.is_read ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.88)' }}
                    >
                      {n.message}
                    </p>
                    <span
                      className="font-koho text-[0.7rem]"
                      style={{ color: 'rgba(255,255,255,0.28)' }}
                    >
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-2 text-center"
              style={{ borderTop: '1px solid rgba(26,188,156,0.12)' }}
            >
              <span className="font-koho text-[0.72rem] text-[rgba(255,255,255,0.25)]">
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}