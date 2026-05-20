import { useState, useRef, useEffect } from 'react';

const STATUS_STEPS = ['Pending', 'In Progress', 'Completed'];

const STATUS_META = {
  'Pending': {
    bg: 'rgba(245,158,11,0.07)', text: '#b45309', border: 'rgba(245,158,11,0.22)',
    desc: 'Your device has been received and is waiting to be assigned to a technician.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7.5 4.5V7.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  'In Progress': {
    bg: 'rgba(59,130,246,0.06)', text: '#2563eb', border: 'rgba(59,130,246,0.2)',
    desc: 'A technician is actively working on your device right now.',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M13 7.5A5.5 5.5 0 1 1 7.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M13 2v3.5H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  'Completed': {
    bg: 'rgba(26,188,156,0.07)', text: '#0e8f6a', border: 'rgba(26,188,156,0.22)',
    desc: 'Your device is fully repaired and ready for pick-up at the shop!',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M4.5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
};

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str.replace(' ', 'T'));
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TrackRepair() {
  const [repairId, setRepairId] = useState('');
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState(false);
  const [width,    setWidth]    = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const inputRef = useRef(null);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  async function handleTrack() {
    const id = repairId.trim();
    if (!id) { setError('Please enter your Repair ID.'); inputRef.current?.focus(); return; }
    if (!/^\d+$/.test(id)) { setError('Repair ID should be numbers only (e.g. 1042).'); inputRef.current?.focus(); return; }

    setError(''); setResult(null); setLoading(true);
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_BASE}/api/track.php?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      setLoading(false);
      if (data.success) setResult(data);
      else setError(data.message || 'No repair found. Please check your ID and try again.');
    } catch {
      setLoading(false);
      setError('Unable to reach the server. Please check your connection and try again.');
    }
  }

  function handleClear() { setRepairId(''); setResult(null); setError(''); inputRef.current?.focus(); }

  const stepIndex = result ? STATUS_STEPS.indexOf(result.status) : -1;
  const meta      = result ? (STATUS_META[result.status] || STATUS_META['Pending']) : null;

  return (
    <section id="track-repair" style={{
      position: 'relative', width: '100%',
      background: '#f0f6f3',
      padding: isMobile ? '0 0 70px' : '0 0 100px',
    }}>

      {/* Section divider */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 8px' }}>
        <div style={{ width: 1, height: 52, background: 'linear-gradient(to bottom, transparent, rgba(26,188,156,0.28))' }} />
        <div style={{ width: 7, height: 7, borderRadius: 2, transform: 'rotate(45deg)', background: 'rgba(26,188,156,0.38)' }} />
      </div>

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: `48px ${isMobile ? '20px' : isTablet ? '28px' : 'clamp(20px,5vw,40px)'} 0`,
      }}>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? 28 : 40, textAlign: 'left' }}>
          <span style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1abc9c',
            display: 'block', marginBottom: 10,
          }}>Real-Time Updates</span>
          <h2 style={{
            fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
            fontSize: isMobile ? '1.7rem' : isTablet ? '2.1rem' : 'clamp(1.7rem,4vw,2.6rem)',
            lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0a1c16', margin: '0 0 12px',
          }}>
            Track Your{' '}
            <span style={{ background: 'linear-gradient(95deg, #1abc9c, #0aaa86)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Repair</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: isMobile ? '0.9rem' : '0.94rem',
            lineHeight: 1.8, color: 'rgba(13,31,26,0.48)',
            maxWidth: 420, margin: 0,
          }}>
            Enter your Repair ID from your drop-off receipt to get a live status update — no login needed.
          </p>
        </div>

        {/* Main card */}
        <div style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : 720,
          borderRadius: isMobile ? 16 : 20,
          background: '#fff',
          border: '1px solid rgba(26,188,156,0.16)',
          boxShadow: '0 8px 40px rgba(13,31,26,0.07)',
          overflow: 'hidden',
        }}>

          {/* Card header */}
          <div style={{
            padding: isMobile ? '14px 20px' : '18px 28px',
            borderBottom: '1px solid rgba(13,31,26,0.07)',
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(26,188,156,0.03)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'rgba(26,188,156,0.08)', border: '1px solid rgba(26,188,156,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="4" stroke="#1abc9c" strokeWidth="1.3"/>
                <path d="M10 10l3 3" stroke="#1abc9c" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.88rem', color: '#0a1c16', margin: 0 }}>
                Repair Status Lookup
              </p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.72rem', color: 'rgba(13,31,26,0.38)', margin: 0 }}>
                No account required — just your Repair ID
              </p>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: isMobile ? '18px 20px' : 'clamp(18px,3.5vw,28px)' }}>

            {/* Search row */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 10,
            }}>
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                  color: focused ? '#1abc9c' : 'rgba(13,31,26,0.28)',
                  transition: 'color 0.18s', pointerEvents: 'none', display: 'flex',
                }}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text" inputMode="numeric"
                  placeholder="Enter Repair ID (e.g. 1042)"
                  value={repairId}
                  onChange={e => { setRepairId(e.target.value.replace(/\D/g, '')); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    width: '100%',
                    padding: '12px 38px 12px 36px',
                    borderRadius: 10,
                    fontSize: isMobile ? '1rem' : '0.88rem', /* larger on mobile for usability */
                    color: '#0a1c16',
                    background: 'rgba(13,31,26,0.03)',
                    border: error
                      ? '1px solid rgba(239,68,68,0.45)'
                      : focused
                      ? '1px solid rgba(26,188,156,0.5)'
                      : '1px solid rgba(13,31,26,0.12)',
                    outline: 'none',
                    transition: 'border 0.2s, box-shadow 0.2s',
                    boxShadow: focused && !error ? '0 0 0 3px rgba(26,188,156,0.08)' : 'none',
                    caretColor: '#1abc9c',
                  }}
                />
                {repairId && (
                  <button
                    onClick={handleClear}
                    aria-label="Clear"
                    style={{
                      position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(13,31,26,0.06)', border: 'none', borderRadius: '50%',
                      width: 18, height: 18, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(13,31,26,0.38)', transition: 'all 0.18s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,31,26,0.06)'; e.currentTarget.style.color = 'rgba(13,31,26,0.38)'; }}
                  >
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>

              <button
                onClick={handleTrack}
                disabled={loading}
                style={{
                  fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
                  fontSize: '0.84rem', letterSpacing: '0.04em', color: '#fff',
                  background: loading ? 'rgba(26,188,156,0.5)' : '#1abc9c',
                  padding: isMobile ? '13px 0' : '12px 22px',
                  borderRadius: 10, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.22s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  minWidth: isMobile ? '100%' : 110,
                  boxShadow: loading ? 'none' : '0 3px 14px rgba(26,188,156,0.28)',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,188,156,0.4)')}
                onMouseLeave={e => !loading && (e.currentTarget.style.boxShadow = '0 3px 14px rgba(26,188,156,0.28)')}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                      display: 'inline-block', animation: 'trSpin 0.7s linear infinite',
                    }} />
                    Searching…
                  </>
                ) : (
                  <>
                    Track
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 6.5h9M8 3.5l3 3-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Helper text */}
            <p style={{
              fontFamily: "'DM Sans',sans-serif", fontSize: '0.73rem',
              color: 'rgba(13,31,26,0.33)', marginTop: 9, marginBottom: 0,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1"/>
                <path d="M6 4v2.5M6 8.5v.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              Your Repair ID is printed on your drop-off receipt or sent via SMS / email.
            </p>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 14, padding: '12px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.16)',
                display: 'flex', alignItems: 'flex-start', gap: 9,
                animation: 'trFadeUp 0.28s ease both',
              }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M7 4.5V7M7 9.5v.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </span>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.82rem', color: '#dc2626', margin: 0, lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            {/* Result */}
            {result && (
              <div style={{ marginTop: 22, animation: 'trFadeUp 0.36s ease both' }}>

                {/* Status banner */}
                <div style={{
                  padding: '13px 16px', borderRadius: 10,
                  background: meta.bg, border: `1px solid ${meta.border}`,
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                }}>
                  <span style={{ color: meta.text, flexShrink: 0 }}>{meta.icon}</span>
                  <div>
                    <p style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: '0.8rem', color: meta.text, margin: '0 0 2px' }}>
                      Status: {result.status}
                    </p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.77rem', color: 'rgba(13,31,26,0.48)', margin: 0 }}>
                      {meta.desc}
                    </p>
                  </div>
                </div>

                {/* Info grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fit, minmax(150px,1fr))',
                  gap: 10, marginBottom: 20,
                }}>
                  {[
                    { label: 'Repair ID',  value: `#${result.request_id}` },
                    { label: 'Device',     value: result.device_type },
                    { label: 'Shop',       value: result.shop_name },
                    { label: 'Submitted',  value: formatDate(result.created_at) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      padding: '12px 14px', borderRadius: 9,
                      background: 'rgba(13,31,26,0.025)', border: '1px solid rgba(13,31,26,0.08)',
                    }}>
                      <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(13,31,26,0.32)', margin: '0 0 4px' }}>{label}</p>
                      <p style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 700, fontSize: isMobile ? '0.82rem' : '0.88rem', color: '#0a1c16', margin: 0, wordBreak: 'break-word' }}>{value || '—'}</p>
                    </div>
                  ))}
                </div>

                {/* Issue */}
                <div style={{ padding: '12px 14px', borderRadius: 9, marginBottom: 20, background: 'rgba(13,31,26,0.02)', border: '1px solid rgba(13,31,26,0.08)' }}>
                  <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(13,31,26,0.32)', margin: '0 0 5px' }}>Issue Reported</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.85rem', lineHeight: 1.72, color: 'rgba(13,31,26,0.55)', margin: 0 }}>{result.issue_description}</p>
                </div>

                {/* Stepper */}
                <div style={{ marginBottom: result.technician_notes ? 20 : 0 }}>
                  <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(13,31,26,0.32)', margin: '0 0 16px' }}>Repair Progress</p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    {STATUS_STEPS.map((step, i) => {
                      const done    = i <= stepIndex;
                      const current = i === stepIndex;
                      const sm      = STATUS_META[step];
                      return (
                        <div key={step} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                            <div style={{
                              width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.36s',
                              background: done ? (current ? sm.bg : '#1abc9c') : 'rgba(13,31,26,0.05)',
                              border: done && !current ? 'none' : `1.5px solid ${done ? sm.text : 'rgba(13,31,26,0.14)'}`,
                              boxShadow: current ? `0 0 14px ${sm.text}2a` : done ? '0 4px 12px rgba(26,188,156,0.18)' : 'none',
                            }}>
                              {done
                                ? <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                    <path d="M3 7l3 3 5-5" stroke={current ? sm.text : '#fff'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                : <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.65rem', fontWeight: 700, color: 'rgba(13,31,26,0.22)' }}>{i + 1}</span>
                              }
                            </div>
                            <span style={{
                              fontFamily: "'DM Sans',sans-serif",
                              fontSize: isMobile ? '0.62rem' : '0.7rem',
                              textAlign: 'center',
                              color: done ? sm.text : 'rgba(13,31,26,0.28)', transition: 'color 0.28s',
                              whiteSpace: 'nowrap',
                            }}>{step}</span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{ flex: 1, height: 2, margin: isMobile ? '15px 5px 0' : '18px 7px 0', borderRadius: 99, overflow: 'hidden', background: 'rgba(13,31,26,0.08)' }}>
                              <div style={{
                                height: '100%', borderRadius: 99,
                                width: i < stepIndex ? '100%' : '0%',
                                background: 'linear-gradient(90deg, #1abc9c, #0aaa86)',
                                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1) 0.2s',
                              }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Technician notes */}
                {result.technician_notes && (
                  <div style={{
                    padding: '14px 18px', borderRadius: 10,
                    background: 'rgba(26,188,156,0.04)', border: '1px solid rgba(26,188,156,0.14)',
                    borderLeft: '3px solid #1abc9c',
                  }}>
                    <p style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1abc9c', margin: '0 0 7px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M1.5 2.5h8M1.5 5.5h5M1.5 8.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      Technician Notes
                    </p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.85rem', lineHeight: 1.72, color: 'rgba(13,31,26,0.55)', margin: 0 }}>{result.technician_notes}</p>
                  </div>
                )}

                <button
                  onClick={handleClear}
                  style={{
                    marginTop: 18, background: 'transparent',
                    border: '1px solid rgba(13,31,26,0.12)', borderRadius: 9,
                    padding: '9px 16px', cursor: 'pointer', color: 'rgba(13,31,26,0.4)',
                    fontFamily: "'DM Sans',sans-serif", fontSize: '0.8rem',
                    transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(26,188,156,0.3)'; e.currentTarget.style.color = '#1abc9c'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(13,31,26,0.12)'; e.currentTarget.style.color = 'rgba(13,31,26,0.4)'; }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M9.5 5.5A4 4 0 1 1 5.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M5.5 0v2.5l2-1.2-2-1.3z" fill="currentColor"/>
                  </svg>
                  Track another repair
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p style={{
          fontFamily: "'DM Sans',sans-serif", fontSize: '0.77rem',
          color: 'rgba(13,31,26,0.3)', marginTop: 18,
          display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1"/>
            <path d="M6 3v3.5M6 8.5v.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          Need help? Visit any TechnoLogs partner shop or{' '}
          <a href="/login" style={{ color: '#1abc9c', textDecoration: 'none' }}>sign in</a>{' '}
          for full repair history.
        </p>
      </div>

      <style>{`
        @keyframes trSpin   { to { transform: rotate(360deg); } }
        @keyframes trFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </section>
  );
}