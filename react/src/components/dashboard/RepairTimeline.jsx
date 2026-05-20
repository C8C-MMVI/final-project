import { useEffect, useState, useRef } from 'react';

const STATUS_META = {
  'Pending':       { label: 'Pending',       step: 0 },
  'In Progress':   { label: 'In Progress',   step: 1 },
  'Waiting Parts': { label: 'Waiting Parts', step: 2 },
  'Completed':     { label: 'Completed',     step: 3 },
  'Cancelled':     { label: 'Cancelled',     step: 4 },
  'pending':       { label: 'Pending',       step: 0 },
  'accepted':      { label: 'Pending',       step: 0 },
  'in_progress':   { label: 'In Progress',   step: 1 },
  'waiting_parts': { label: 'Waiting Parts', step: 2 },
  'completed':     { label: 'Completed',     step: 3 },
  'cancelled':     { label: 'Cancelled',     step: 4 },
  'rejected':      { label: 'Cancelled',     step: 4 },
};

const STEP_ORDER = ['Pending', 'In Progress', 'Waiting Parts', 'Completed'];

const STATUS_COLORS = {
  'Pending':       { color: '#b45309',  bg: 'rgba(245,158,11,0.1)'  },
  'In Progress':   { color: '#2563eb',  bg: 'rgba(59,130,246,0.1)'  },
  'Waiting Parts': { color: '#ea580c',  bg: 'rgba(234,88,12,0.1)'   },
  'Completed':     { color: '#0e8f6a',  bg: 'rgba(26,188,156,0.1)'  },
  'Cancelled':     { color: '#ef4444',  bg: 'rgba(239,68,68,0.1)'   },
};

function buildStepperFromEvents(events = []) {
  if (!events.length) return STEP_ORDER.map(label => ({ label, done: false, active: false }));
  const latestRaw   = events[0]?.status ?? 'Pending';
  const latestMeta  = STATUS_META[latestRaw] ?? { label: latestRaw, step: 0 };
  const currentStep = latestMeta.step;
  const currentLabel = latestMeta.label;
  const eventByLabel = {};
  [...events].reverse().forEach(ev => {
    const meta = STATUS_META[ev.status];
    if (meta) eventByLabel[meta.label] = ev;
  });
  if (currentLabel === 'Cancelled') {
    return [
      ...STEP_ORDER.map(label => ({ label, done: false, active: false })),
      { label: 'Cancelled', done: true, active: true, timestamp: events[0]?.createdAt, note: events[0]?.note, changedByUsername: events[0]?.changedByUsername },
    ];
  }
  return STEP_ORDER.map((label, idx) => {
    const ev = eventByLabel[label];
    return {
      label,
      done: idx < currentStep,
      active: idx === currentStep,
      timestamp: ev?.createdAt ?? null,
      note: ev?.note ?? null,
      changedByUsername: ev?.changedByUsername ?? null,
    };
  });
}

function useRepairTimeline(requestId) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true); setError(null);
    fetch(`/api/events/timeline/${requestId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setEvents(data.events ?? []);
        else setError(data.message ?? 'Failed to load timeline');
      })
      .catch(() => setError('Could not reach timeline service'))
      .finally(() => setLoading(false));
  }, [requestId]);

  return { events, loading, error };
}

function fmt(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString('en-PH', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  } catch { return null; }
}

function Connector({ done }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: 32, flexShrink: 0, margin: '2px 0' }}>
      <div style={{
        width: 2, height: 20, borderRadius: 99,
        background: done ? 'linear-gradient(180deg, #1abc9c, #0aaa86)' : 'rgba(13,31,26,0.1)',
        transition: 'background 0.5s',
      }} />
    </div>
  );
}

export default function RepairTimeline({ currentRepair }) {
  const requestId      = currentRepair?.request_id ?? currentRepair?.id ?? null;
  const { events, loading, error } = useRepairTimeline(requestId);
  const hasMongo       = events.length > 0;
  const fallbackStatus = currentRepair?.status ?? 'pending';
  const steps = hasMongo
    ? buildStepperFromEvents(events)
    : buildStepperFromEvents([{ status: fallbackStatus, createdAt: currentRepair?.created_at }]);
  const latestNote   = events.find(e => e.note)?.note ?? currentRepair?.technician_notes ?? null;
  const latestNoteBy = events.find(e => e.note)?.changedByUsername ?? null;
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={ref} style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      padding: 20, borderRadius: 14,
      background: '#fff',
      border: '1px solid rgba(26,188,156,0.14)',
      boxShadow: '0 2px 8px rgba(13,31,26,0.05)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{
          fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
          fontSize: '0.88rem', color: '#0a1c16',
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>Latest Repair Status</h3>
        {hasMongo && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 99,
            background: 'rgba(26,188,156,0.1)',
            color: '#1abc9c', fontSize: '0.65rem',
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#1abc9c', animation: 'hPulse 2s ease-in-out infinite',
            }} />
            Live
          </span>
        )}
      </div>

      {/* Device info */}
      {currentRepair ? (
        <div style={{ paddingBottom: 14, borderBottom: '1px solid rgba(26,188,156,0.1)' }}>
          <p style={{
            fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
            fontSize: '0.92rem', color: '#0a1c16', marginBottom: 3,
          }}>
            {currentRepair.device_type}
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.82rem', color: 'rgba(13,31,26,0.48)' }}>
            {currentRepair.issue_description}
          </p>
        </div>
      ) : (
        <p style={{ color: 'rgba(13,31,26,0.4)', fontSize: '0.85rem' }}>
          No active repair requests.
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid rgba(26,188,156,0.3)', borderTopColor: '#1abc9c',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'rgba(13,31,26,0.4)', fontSize: '0.8rem' }}>Loading timeline…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠ {error}</p>
      )}

      {/* Stepper */}
      {!loading && steps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
          {steps.map(({ label, done, active, timestamp, changedByUsername }, i) => {
            const colors = STATUS_COLORS[label] ?? STATUS_COLORS['Pending'];
            const isLast = i === steps.length - 1;
            return (
              <div
                key={label}
                style={{
                  display: 'flex', flexDirection: 'column',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 0.35s ease ${i * 70}ms, transform 0.35s ease ${i * 70}ms`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                  {/* Circle */}
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700,
                    background: done ? '#1abc9c' : active ? 'rgba(26,188,156,0.1)' : 'rgba(13,31,26,0.05)',
                    border: active ? '2px solid #1abc9c' : done ? 'none' : '2px solid rgba(13,31,26,0.15)',
                    boxShadow: active ? '0 0 12px rgba(26,188,156,0.35)' : 'none',
                    color: done ? '#fff' : active ? '#1abc9c' : 'rgba(13,31,26,0.3)',
                    transition: 'all 0.4s ease',
                  }}>
                    {done || active ? '✓' : i + 1}
                  </div>

                  {/* Label + timestamp */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: "'DM Sans',sans-serif", fontSize: '0.85rem',
                        fontWeight: done || active ? 600 : 400,
                        color: done || active ? colors.color : 'rgba(13,31,26,0.3)',
                      }}>{label}</span>
                      {active && (
                        <span style={{
                          padding: '2px 9px', borderRadius: 99, fontSize: '0.65rem',
                          fontWeight: 700, background: colors.bg, color: colors.color,
                          fontFamily: "'Orbitron',sans-serif",
                        }}>Current</span>
                      )}
                    </div>
                    {(done || active) && timestamp && (
                      <p style={{ fontSize: '0.68rem', color: 'rgba(13,31,26,0.35)' }}>
                        {fmt(timestamp)}
                        {changedByUsername && (
                          <span style={{ color: '#1abc9c' }}> · {changedByUsername}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                {!isLast && <Connector done={done} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Technician Notes */}
      {latestNote && (
        <div style={{
          marginTop: 8, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(26,188,156,0.05)',
          border: '1px solid rgba(26,188,156,0.15)',
          borderLeft: '3px solid #1abc9c',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{
              fontFamily: "'Orbitron',sans-serif", fontSize: '0.65rem',
              color: '#1abc9c', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 700,
            }}>
              Technician Notes
            </p>
            {latestNoteBy && (
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.65rem', color: 'rgba(26,188,156,0.6)' }}>
                — {latestNoteBy}
              </p>
            )}
          </div>
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: '0.83rem',
            color: 'rgba(13,31,26,0.6)', lineHeight: 1.6,
          }}>
            {latestNote}
          </p>
        </div>
      )}
    </div>
  );
}