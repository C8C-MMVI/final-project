import { useState } from 'react';

const STATUS_STEPS = ['Pending', 'In Progress', 'Completed'];

export default function TrackRepair() {
  const [requestId, setRequestId] = useState('');
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  async function handleTrack(e) {
    e.preventDefault();
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

  return (
    <section id="track-repair" className="relative w-full py-32">

      {/* Section top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-transparent to-teal" />

      {/* Centered container */}
      <div className="w-full max-w-[1280px] mx-auto px-8 flex flex-col items-center">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 w-full">
          <span className="font-koho text-teal text-[0.78rem] tracking-[4px] uppercase mb-3">
            Real-Time Updates
          </span>
          <h2 className="font-koho font-bold text-white leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Track Your <span className="text-teal">Repair</span>
          </h2>
          <p className="font-koho text-[rgba(255,255,255,0.5)] text-[1rem] mt-4 leading-relaxed max-w-[460px]">
            Enter your repair request ID to get a live update on your device's status.
          </p>
        </div>

        {/* Search card — constrained width, centered */}
        <div
          className="w-full max-w-[720px] p-8 rounded-[20px]"
          style={{
            background:    'rgba(10,22,44,0.7)',
            border:        '1px solid rgba(26,188,156,0.18)',
            backdropFilter: 'blur(20px)',
            boxShadow:     '0 24px 60px rgba(0,0,0,0.4)',
          }}
        >
          <form onSubmit={handleTrack} className="flex gap-3 w-full" noValidate>
            <input
              type="text"
              placeholder="Enter Repair ID (e.g. 1042)…"
              value={requestId}
              onChange={e => { setRequestId(e.target.value); setError(''); }}
              className="flex-1 py-[13px] px-[16px] rounded-[10px] text-white text-[0.91rem] font-koho outline-none transition-all duration-200 placeholder:text-[rgba(255,255,255,0.28)] focus:shadow-[0_0_0_3px_rgba(26,188,156,0.25)]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: error ? '1px solid #ff4f4f' : '1px solid rgba(255,255,255,0.15)',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="font-rajdhani font-bold tracking-[2px] uppercase text-white px-6 py-[13px] rounded-[10px] border-none cursor-pointer transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(26,188,156,0.45)] disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, #0ea882, #1abc9c)', minWidth: '120px' }}
            >
              {loading
                ? <span className="inline-block w-5 h-5 border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full" style={{ animation: 'spin 0.7s linear infinite' }} />
                : 'TRACK'
              }
            </button>
          </form>

          {/* Error */}
          {error && (
            <p className="mt-3 text-[0.8rem] text-[#ff4f4f] font-koho flex items-center gap-2">⚠ {error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="mt-8 w-full" style={{ animation: 'fadeUp 0.4s ease both' }}>
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-[rgba(26,188,156,0.12)]">
                <div>
                  <p className="font-koho text-[rgba(255,255,255,0.5)] text-[0.75rem] tracking-widest uppercase mb-1">Device</p>
                  <p className="font-koho text-white font-bold text-[1.1rem]">{result.device_type}</p>
                  <p className="font-koho text-[rgba(255,255,255,0.5)] text-[0.85rem] mt-1">{result.issue_description}</p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-[0.75rem] font-koho font-semibold tracking-wide flex-shrink-0 ml-4"
                  style={{
                    background: result.status === 'Completed' ? 'rgba(26,188,156,0.15)' : result.status === 'In Progress' ? 'rgba(241,196,15,0.15)' : 'rgba(255,255,255,0.08)',
                    color: result.status === 'Completed' ? '#1abc9c' : result.status === 'In Progress' ? '#f1c40f' : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${result.status === 'Completed' ? 'rgba(26,188,156,0.3)' : result.status === 'In Progress' ? 'rgba(241,196,15,0.3)' : 'rgba(255,255,255,0.15)'}`,
                  }}
                >
                  {result.status}
                </div>
              </div>

              {/* Stepper */}
              <div className="flex items-center w-full">
                {STATUS_STEPS.map((step, i) => {
                  const done    = i <= stepIndex;
                  const current = i === stepIndex;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-bold transition-all duration-300"
                          style={{
                            background: done ? 'linear-gradient(135deg, #0ea882, #1abc9c)' : 'rgba(255,255,255,0.07)',
                            border:     current ? '2px solid #1abc9c' : done ? 'none' : '2px solid rgba(255,255,255,0.15)',
                            boxShadow:  current ? '0 0 16px rgba(26,188,156,0.5)' : 'none',
                            color:      done ? 'white' : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {done ? '✓' : i + 1}
                        </div>
                        <span className="font-koho text-[0.72rem] tracking-wide text-center" style={{ color: done ? '#1abc9c' : 'rgba(255,255,255,0.4)' }}>
                          {step}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className="flex-1 h-[2px] mx-2 mb-5 rounded-full transition-all duration-500"
                          style={{ background: i < stepIndex ? 'linear-gradient(90deg, #0ea882, #1abc9c)' : 'rgba(255,255,255,0.1)' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {result.technician_notes && (
                <div className="mt-6 p-4 rounded-[10px] border-l-4" style={{ background: 'rgba(26,188,156,0.06)', borderColor: '#1abc9c' }}>
                  <p className="font-koho text-[0.75rem] text-teal tracking-widest uppercase mb-1">Technician Notes</p>
                  <p className="font-koho text-[rgba(255,255,255,0.7)] text-[0.88rem] leading-relaxed">{result.technician_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}