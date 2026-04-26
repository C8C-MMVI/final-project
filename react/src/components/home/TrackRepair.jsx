import { useState } from 'react';

const STATUS_STEPS = ['Pending', 'In Progress', 'Completed'];

const statusColors = {
  'Completed':   { bg: 'rgba(26,188,156,0.12)', color: '#1abc9c',                border: 'rgba(26,188,156,0.3)' },
  'In Progress': { bg: 'rgba(241,196,15,0.12)',  color: '#f1c40f',                border: 'rgba(241,196,15,0.3)' },
  'Pending':     { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.15)' },
};

export default function TrackRepair() {
  const [requestId, setRequestId] = useState('');
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [focused,   setFocused]   = useState(false);

  async function handleTrack() {
    if (!requestId.trim()) { setError('Please enter a repair request ID.'); return; }
    setError(''); setResult(null); setLoading(true);
    try {
      const res  = await fetch(`/api/repair/track?id=${encodeURIComponent(requestId.trim())}`);
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) setResult(data);
      else setError(data.message || 'No repair request found with that ID.');
    } catch {
      setLoading(false);
      setError('Cannot connect to server. Please try again.');
    }
  }

  const stepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;
  const sc = result ? (statusColors[result.status] || statusColors['Pending']) : null;

  return (
    <section id="track-repair" style={{ position: 'relative', width: '100%', padding: '0 0 80px' }}>

      {/* Top divider */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 1, height: 56, background: 'linear-gradient(to bottom, transparent, rgba(26,188,156,0.25))' }} />
        <div style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: 'rgba(26,188,156,0.35)' }} />
      </div>

      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '56px 40px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', marginBottom: 48, width: '100%',
        }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: '0.7rem', fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1abc9c', marginBottom: 12,
          }}>
            Real-Time Updates
          </span>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', lineHeight: 1.08,
            letterSpacing: '-0.02em', color: '#fff', marginBottom: 16, marginTop: 0,
          }}>
            Track Your{' '}
            <span style={{
              background: 'linear-gradient(95deg, #1abc9c, #0fd4a0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Repair
            </span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.48)',
            maxWidth: 440, margin: 0,
          }}>
            Enter your repair request ID to get a live update on your device's status.
          </p>
        </div>

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 680,
          padding: '32px 36px', borderRadius: 20,
          background: 'rgba(7,17,31,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(26,188,156,0.18)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>

          {/* Input row */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <input
              type="text"
              placeholder="Enter Repair ID (e.g. 1042)…"
              value={requestId}
              onChange={e => { setRequestId(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleTrack()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                fontFamily: "'DM Sans', sans-serif", flex: 1,
                padding: '13px 16px', borderRadius: 10,
                fontSize: '0.88rem', color: '#fff',
                background: 'rgba(255,255,255,0.07)',
                border: error
                  ? '1px solid #ff6b6b'
                  : focused
                  ? '1px solid rgba(26,188,156,0.5)'
                  : '1px solid rgba(255,255,255,0.14)',
                outline: 'none', transition: 'border 0.2s',
                caretColor: '#1abc9c',
              }}
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#07111f', background: '#1abc9c',
                padding: '13px 24px', borderRadius: 10,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
                opacity: loading ? 0.55 : 1, minWidth: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,188,156,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {loading ? (
                <span style={{
                  display: 'inline-block', width: 18, height: 18, borderRadius: '50%',
                  border: '2px solid rgba(7,17,31,0.3)', borderTopColor: '#07111f',
                  animation: 'spin 0.7s linear infinite',
                }} />
              ) : 'Track'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif", marginTop: 12, marginBottom: 0,
              fontSize: '0.78rem', color: '#ff6b6b',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ⚠ {error}
            </p>
          )}

          {/* Result */}
          {result && (
            <div style={{ marginTop: 28, animation: 'fadeUp 0.35s ease both' }}>

              {/* Device row */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                paddingBottom: 20, borderBottom: '1px solid rgba(26,188,156,0.1)', marginBottom: 24,
              }}>
                <div>
                  <p style={{
                    fontFamily: "'Syne', sans-serif", fontSize: '0.67rem',
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)', marginBottom: 4, marginTop: 0,
                  }}>
                    Device
                  </p>
                  <p style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: '1.05rem', color: '#fff', marginBottom: 4, marginTop: 0,
                  }}>
                    {result.device_type}
                  </p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                    fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', margin: 0,
                  }}>
                    {result.issue_description}
                  </p>
                </div>
                <span style={{
                  fontFamily: "'Syne', sans-serif", fontSize: '0.7rem', fontWeight: 600,
                  letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 999,
                  flexShrink: 0, marginLeft: 16,
                  background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                }}>
                  {result.status}
                </span>
              </div>

              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {STATUS_STEPS.map((step, i) => {
                  const done    = i <= stepIndex;
                  const current = i === stepIndex;
                  return (
                    <div key={step} style={{
                      display: 'flex', alignItems: 'center',
                      flex: i < STATUS_STEPS.length - 1 ? 1 : 'none',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', fontWeight: 700,
                          transition: 'all 0.3s',
                          background: done ? '#1abc9c' : 'rgba(255,255,255,0.06)',
                          border: current ? '2px solid #1abc9c' : done ? 'none' : '2px solid rgba(255,255,255,0.12)',
                          boxShadow: current ? '0 0 14px rgba(26,188,156,0.5)' : 'none',
                          color: done ? '#07111f' : 'rgba(255,255,255,0.38)',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '0.68rem',
                          letterSpacing: '0.1em', textAlign: 'center',
                          color: done ? '#1abc9c' : 'rgba(255,255,255,0.35)',
                        }}>
                          {step}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{
                          flex: 1, height: 2, margin: '0 8px', marginBottom: 20,
                          borderRadius: 999, transition: 'background 0.5s',
                          background: i < stepIndex
                            ? 'linear-gradient(90deg, #1abc9c, #0fd4a0)'
                            : 'rgba(255,255,255,0.08)',
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Technician notes */}
              {result.technician_notes && (
                <div style={{
                  marginTop: 20, padding: '16px 20px',
                  background: 'rgba(26,188,156,0.06)',
                  borderLeft: '3px solid #1abc9c',
                  borderRadius: '0 10px 10px 0',
                }}>
                  <p style={{
                    fontFamily: "'Syne', sans-serif", fontSize: '0.68rem',
                    letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: '#1abc9c', marginBottom: 8, marginTop: 0,
                  }}>
                    Technician Notes
                  </p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                    fontSize: '0.85rem', lineHeight: 1.68,
                    color: 'rgba(255,255,255,0.65)', margin: 0,
                  }}>
                    {result.technician_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}