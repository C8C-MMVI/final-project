import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = '/api/notifications.php';
const POLL_INTERVAL = 30_000; // 30 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const intervalRef                       = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch(API_URL, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch {
      // silently fail — user may not be logged in yet
    }
  }, []);

  // Poll every 30s + fetch immediately on mount
  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await fetch(`${API_URL}?action=read&id=${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
      });
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`${API_URL}?action=read_all`, {
        method: 'PATCH',
        credentials: 'include',
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return {
    notifications,
    unreadCount,
    open,
    toggleOpen,
    markAsRead,
    markAllAsRead,
  };
}