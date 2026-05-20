// src/hooks/useChatUnread.js
//
// Polls the backend for unread chat message counts across all repair rooms
// the current user participates in.
//
// Usage:
//   const { totalUnread, perRepairUnread, clearRepair } = useChatUnread(userId, repairs);
//
//   totalUnread      — number  — passed to <Topbar unreadChatCount={totalUnread}>
//   perRepairUnread  — object  — { [repairId]: count } used on per-row Chat buttons
//   clearRepair(id)  — call immediately when user opens a chat modal so the
//                       badge disappears without waiting for the next poll

import { useState, useEffect, useCallback, useRef } from 'react';

const POLL_MS  = 20_000;                          // re-poll every 20 seconds
const API_BASE = '/api/chat';                     // proxied through Vite / nginx

export function useChatUnread(userId, repairs = []) {
  const [perRepairUnread, setPerRepairUnread] = useState({});
  const pollRef                               = useRef(null);

  // Build a stable dependency key from the repair IDs so we don't re-create
  // fetchAll on every render (repairs array reference changes each render).
  const repairIdsKey = repairs
    .map(r => r.repair_id ?? r.request_id)
    .filter(Boolean)
    .join(',');

  const fetchAll = useCallback(async () => {
    if (!userId || !repairIdsKey) return;

    const ids = repairIdsKey.split(',').map(Number).filter(Boolean);

    // Fire one lightweight request per repair in parallel
    const settled = await Promise.allSettled(
      ids.map(rid =>
        fetch(`${API_BASE}/unread-by-repair.php?repairId=${rid}&userId=${userId}`, {
          credentials: 'include',
        })
          .then(r => r.ok ? r.json() : { unread: 0 })
          .then(data => ({ repairId: rid, unread: Number(data.unread ?? 0) }))
      )
    );

    const counts = {};
    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value.unread > 0) {
        counts[result.value.repairId] = result.value.unread;
      }
    }

    setPerRepairUnread(counts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, repairIdsKey]);

  // Fetch immediately on mount / when userId or repairs change, then poll
  useEffect(() => {
    if (!userId) return;
    fetchAll();
    pollRef.current = setInterval(fetchAll, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [fetchAll, userId]);

  // Optimistically clear a single repair's badge when the user opens that chat
  const clearRepair = useCallback((repairId) => {
    setPerRepairUnread(prev => {
      if (!prev[repairId]) return prev;           // nothing to clear — skip re-render
      const next = { ...prev };
      delete next[repairId];
      return next;
    });
  }, []);

  const totalUnread = Object.values(perRepairUnread)
    .reduce((sum, n) => sum + n, 0);

  return { totalUnread, perRepairUnread, clearRepair, refresh: fetchAll };
}