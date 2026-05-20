import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WS_URL   = '/ws/chat';
const API_BASE = '/api/chat';

export default function ChatWindow({
  repairId,
  currentUserId,
  currentUserName,
  technicianId,
  customerId,
}) {
  const [room,      setRoom]      = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [connected, setConnected] = useState(false);
  const [isTyping,  setIsTyping]  = useState(null);
  const [error,     setError]     = useState(null);

  const stompRef    = useRef(null);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);

  // ── Open / join chat room ─────────────────────────────────────────────────
  useEffect(() => {
    if (!repairId || !currentUserId) return;

    let cancelled = false;

    const resolvedCustomerId = customerId ?? currentUserId;

    fetch(`${API_BASE}/room`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        repairId,
        customerId:   resolvedCustomerId,
        technicianId,
      }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`Server responded with ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        setRoom(data.room);
        setMessages(data.messages ?? []);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Chat room error:', err);
        setError('Failed to open chat room.');
      });

    return () => { cancelled = true; };
  }, [repairId, currentUserId, technicianId, customerId]);

  // ── WebSocket / STOMP connection ──────────────────────────────────────────
  useEffect(() => {
    if (!room) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay:   5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/chat.${room.roomId}`, (frame) => {
          const payload = JSON.parse(frame.body);
          if (payload.type === 'typing') {
            if (payload.senderId !== currentUserId) {
              setIsTyping(payload.isTyping ? { senderName: payload.senderName } : null);
              clearTimeout(typingTimer.current);
              if (payload.isTyping) {
                typingTimer.current = setTimeout(() => setIsTyping(null), 3000);
              }
            }
          } else if (payload.type === 'read_receipt') {
            // ignore read receipts in message list
          } else {
            setMessages(prev => [...prev, payload]);
            if (document.visibilityState === 'visible') markRead(room.roomId);
          }
        });
        markRead(room.roomId);
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setError('Connection error. Please try again.'),
    });

    client.activate();
    stompRef.current = client;
    return () => {
      client.deactivate();
      stompRef.current = null;
    };
  }, [room]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Mark messages as read ─────────────────────────────────────────────────
  const markRead = useCallback((roomId) => {
    fetch(`${API_BASE}/read`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, userId: currentUserId }),
    }).catch(() => {});
  }, [currentUserId]);

  // ── Typing indicator ──────────────────────────────────────────────────────
  const sendTyping = useCallback((isTypingNow) => {
    if (!stompRef.current?.connected || !room) return;
    stompRef.current.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({
        roomId:     room.roomId,
        senderId:   currentUserId,
        senderName: currentUserName,
        isTyping:   isTypingNow,
      }),
    });
  }, [room, currentUserId, currentUserName]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(false), 1500);
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !stompRef.current?.connected || !room) return;

    const resolvedCustomerId = customerId ?? currentUserId;
    const role = currentUserId === resolvedCustomerId ? 'customer' : 'technician';

    stompRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        roomId:     room.roomId,
        senderId:   currentUserId,
        senderName: currentUserName,
        senderRole: role,
        message:    text,
      }),
    });
    setInput('');
    sendTyping(false);
  }, [input, room, currentUserId, currentUserName, customerId, sendTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitial = (name) => (name ?? '?').charAt(0).toUpperCase();

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: 12, background: '#fff',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: '#fff1f2', border: '1px solid #fecdd3',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
      }}>⚠️</div>
      <p style={{ color: '#e11d48', fontSize: '0.84rem', margin: 0 }}>{error}</p>
      <button
        onClick={() => { setError(null); setRoom(null); }}
        style={{
          padding: '6px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
          background: '#f8fafc', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b',
        }}
      >
        Retry
      </button>
    </div>
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!room) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: 14, background: '#fff',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #e1f5ee', borderTop: '3px solid #1abc9c',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>Opening chat…</p>
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#fff', fontFamily: 'inherit',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-5px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cmsg { animation: fadeUp 0.18s ease; }
        .cinput { border: none; background: transparent; outline: none; resize: none; font-family: inherit; }
        .cinput::placeholder { color: #cbd5e1; }
        .csend:hover:not(:disabled) { background: #17a882 !important; transform: scale(1.05); }
        .csend:disabled { opacity: 0.35; cursor: not-allowed; }
        .cinput-wrap:focus-within { border-color: #1abc9c !important; }
        .cmsg-bubble-them:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        padding: '13px 18px', background: '#fff',
        borderBottom: '1.5px solid #e2e8f0',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
            background: '#1abc9c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: 700, color: '#fff',
          }}>
            {getInitial(currentUserName)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.2 }}>
              Repair #{repairId}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
              {room?.deviceType ?? 'Device Repair'} · {currentUserName}
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', borderRadius: 20,
          background: connected ? '#e1f5ee' : '#f1f5f9',
          border: `1px solid ${connected ? '#9fe1cb' : '#e2e8f0'}`,
          transition: 'all 0.3s',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: connected ? '#1abc9c' : '#94a3b8',
            transition: 'background 0.3s',
          }} />
          <span style={{
            fontSize: '0.68rem', fontWeight: 600,
            color: connected ? '#0f6e56' : '#94a3b8',
          }}>
            {connected ? 'Live' : 'Connecting…'}
          </span>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
        background: '#f8fafc',
        display: 'flex', flexDirection: 'column', gap: 10,
        scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent',
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 10, padding: '40px 20px',
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: '#e1f5ee', border: '1px solid #9fe1cb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem',
            }}>💬</div>
            <p style={{
              color: '#94a3b8', fontSize: '0.82rem',
              margin: 0, textAlign: 'center', lineHeight: 1.6,
            }}>
              No messages yet.<br />Start the conversation!
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe     = msg.senderId === currentUserId;
          const showName = !isMe && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
          return (
            <div key={msg.messageId ?? msg.id ?? i} className="cmsg" style={{
              display: 'flex', alignItems: 'flex-end', gap: 7,
              flexDirection: isMe ? 'row-reverse' : 'row',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: isMe ? '#1abc9c' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 700,
                color: isMe ? '#fff' : '#64748b',
                marginBottom: 2,
              }}>
                {getInitial(msg.senderName)}
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '70%', gap: 3,
              }}>
                {showName && (
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 600,
                    color: '#94a3b8', paddingLeft: 3,
                  }}>
                    {msg.senderName}
                  </span>
                )}
                <div className={isMe ? '' : 'cmsg-bubble-them'} style={{
                  padding: '9px 13px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? '#1abc9c' : '#fff',
                  border: isMe ? 'none' : '1px solid #e2e8f0',
                  color: isMe ? '#fff' : '#1e293b',
                  fontSize: '0.85rem', lineHeight: 1.55, wordBreak: 'break-word',
                  transition: 'background 0.15s',
                }}>
                  {msg.message}
                </div>
                <span style={{
                  fontSize: '0.63rem', color: '#cbd5e1', paddingLeft: 3, paddingRight: 3,
                }}>
                  {formatTime(msg.sentAt)}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="cmsg" style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: '#e2e8f0', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: '#64748b',
            }}>
              {getInitial(isTyping.senderName)}
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
              background: '#fff', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#1abc9c',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{
        padding: '12px 14px 10px', background: '#fff',
        borderTop: '1px solid #e2e8f0', flexShrink: 0,
      }}>
        <div className="cinput-wrap" style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: '#f8fafc', border: '1.5px solid #e2e8f0',
          borderRadius: 12, padding: '8px 8px 8px 14px',
          transition: 'border-color 0.2s',
        }}>
          <textarea
            className="cinput"
            rows={1}
            placeholder={connected ? 'Type a message…' : 'Connecting…'}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={!connected}
            style={{
              flex: 1, fontSize: '0.87rem', color: '#1e293b',
              lineHeight: 1.5, maxHeight: 100, paddingTop: 3, paddingBottom: 3,
            }}
          />
          <button
            className="csend"
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            style={{
              width: 34, height: 34, borderRadius: 10, border: 'none',
              background: input.trim() && connected ? '#1abc9c' : '#e1f5ee',
              color: input.trim() && connected ? '#fff' : '#9fe1cb',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p style={{
          margin: '5px 0 0', fontSize: '0.63rem',
          color: '#e2e8f0', textAlign: 'center',
        }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}