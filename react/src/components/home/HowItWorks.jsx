import { useEffect, useState } from 'react';

const STEPS = [
  {
    num: '01', title: 'Drop Off',
    desc: 'Bring your device to a certified TechnoLogs shop near you. Our staff logs your device instantly.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 7.5v9L12 21l8-4.5v-9L12 3z" stroke="#1abc9c" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M4 7.5l8 4.5 8-4.5M12 12v9" stroke="#1abc9c" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '02', title: 'Diagnosis',
    desc: 'A certified technician inspects your device, logs the issue, and gives you a repair estimate.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="6.5" stroke="#1abc9c" strokeWidth="1.4"/>
        <path d="M16 16l4 4" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M9 11h4M11 9v4" stroke="#1abc9c" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '03', title: 'Live Tracking',
    desc: 'Track every status change in real-time through your dashboard — no calls needed.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 14l5 5 5-7 4 4 4-9" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="#1abc9c" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    num: '04', title: 'Pick Up',
    desc: 'Get notified the moment your device is ready. Pay securely and collect your repaired device.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v11M7 9l5 5 5-5" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 18v2h16v-2" stroke="#1abc9c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  return (
    <section id="how-it-works" style={{
      position: 'relative', width: '100%',
      background: 'rgba(255,255,255,0.55)',
      padding: isMobile ? '0 0 60px' : '0 0 80px',
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
        <div style={{ marginBottom: isMobile ? 36 : 48, textAlign: 'left' }}>
          <span style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1abc9c',
            display: 'block', marginBottom: 10,
          }}>Simple Process</span>
          <h2 style={{
            fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
            fontSize: isMobile ? '1.7rem' : isTablet ? '2.1rem' : 'clamp(1.7rem,4vw,2.6rem)',
            lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0a1c16', margin: '0 0 12px',
          }}>
            How It{' '}
            <span style={{ background: 'linear-gradient(95deg, #1abc9c, #0aaa86)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Works</span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: isMobile ? '0.9rem' : '0.94rem',
            lineHeight: 1.8, color: 'rgba(13,31,26,0.48)', maxWidth: 400, margin: 0,
          }}>
            Get your device repaired in four clear steps — fast, transparent, and fully tracked.
          </p>
        </div>

        {/* Steps */}
        {isMobile ? (
          /* Mobile: vertical list */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32, position: 'relative' }}>
            {STEPS.map(({ num, title, desc, icon }, i) => (
              <div key={num} style={{
                display: 'flex', gap: 18,
                paddingBottom: i < STEPS.length - 1 ? 28 : 0,
                position: 'relative',
                animation: `fadeUp 0.4s ease ${0.1 * i}s both`,
              }}>
                {/* Vertical connector */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 30, top: 62, bottom: 0, width: 1,
                    background: 'linear-gradient(to bottom, rgba(26,188,156,0.3), rgba(26,188,156,0.07))',
                    zIndex: 0,
                  }} />
                )}

                {/* Left: number + circle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, zIndex: 1 }}>
                  <span style={{
                    fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
                    fontSize: '0.6rem', letterSpacing: '0.16em', color: '#1abc9c',
                    marginBottom: 10, display: 'block',
                  }}>{num}</span>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#fff', border: '1.5px solid rgba(26,188,156,0.3)',
                    boxShadow: '0 0 0 6px rgba(240,246,243,0.9), 0 4px 16px rgba(26,188,156,0.12)',
                    flexShrink: 0,
                  }}>
                    {icon}
                  </div>
                </div>

                {/* Right: text */}
                <div style={{ paddingTop: 20 }}>
                  <h3 style={{
                    fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
                    fontSize: '1rem', color: '#0a1c16', margin: '0 0 6px',
                  }}>{title}</h3>
                  <p style={{
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 400,
                    fontSize: '0.84rem', lineHeight: 1.72,
                    color: 'rgba(13,31,26,0.48)', margin: 0,
                  }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tablet / Desktop: horizontal grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: isTablet ? 'repeat(2,1fr)' : 'repeat(auto-fit, minmax(min(100%,190px),1fr))',
            gap: isTablet ? '32px 24px' : 0,
            position: 'relative',
            marginBottom: 40,
          }}>
            {STEPS.map(({ num, title, desc, icon }, i) => (
              <div key={num} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: isTablet ? '0 0 0' : '0 20px 36px',
                position: 'relative',
                animation: `fadeUp 0.4s ease ${0.1 * i}s both`,
              }}>
                {/* Connector line — desktop only */}
                {!isTablet && i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: 46,
                    left: 'calc(50% + 31px)',
                    width: 'calc(100% - 62px)',
                    height: 1,
                    background: 'linear-gradient(90deg, rgba(26,188,156,0.3), rgba(26,188,156,0.07))',
                    zIndex: 0,
                  }} />
                )}

                <span style={{
                  fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
                  fontSize: '0.6rem', letterSpacing: '0.16em', color: '#1abc9c',
                  marginBottom: 14, display: 'block',
                }}>{num}</span>

                <div style={{
                  position: 'relative', zIndex: 1,
                  width: 62, height: 62, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#fff', border: '1.5px solid rgba(26,188,156,0.3)',
                  boxShadow: '0 0 0 6px rgba(240,246,243,0.9), 0 4px 16px rgba(26,188,156,0.12)',
                  marginBottom: 20, flexShrink: 0, transition: 'all 0.28s', cursor: 'default',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 0 0 6px rgba(240,246,243,0.9), 0 8px 28px rgba(26,188,156,0.24)';
                    e.currentTarget.style.borderColor = '#1abc9c';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 0 0 6px rgba(240,246,243,0.9), 0 4px 16px rgba(26,188,156,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(26,188,156,0.3)';
                  }}
                >
                  {icon}
                </div>

                <h3 style={{
                  fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
                  fontSize: '1.02rem', color: '#0a1c16', margin: '0 0 8px',
                }}>{title}</h3>
                <p style={{
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 400,
                  fontSize: '0.84rem', lineHeight: 1.78,
                  color: 'rgba(13,31,26,0.48)', margin: 0,
                }}>{desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA strip */}
        <div style={{
          padding: isMobile ? '20px' : '24px 32px',
          borderRadius: 16, background: '#fff',
          border: '1px solid rgba(26,188,156,0.18)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 18,
          boxShadow: '0 4px 20px rgba(13,31,26,0.05)',
        }}>
          <div>
            <p style={{
              fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
              fontSize: isMobile ? '0.97rem' : '1.05rem',
              color: '#0a1c16', margin: '0 0 5px',
            }}>Ready to get your device fixed?</p>
            <p style={{
              fontFamily: "'DM Sans',sans-serif",
              fontSize: '0.85rem', color: 'rgba(13,31,26,0.46)', margin: 0,
            }}>Find a certified TechnoLogs shop near you and book a drop-off today.</p>
          </div>
          <a
            href="#track-repair"
            style={{
              fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
              fontSize: '0.83rem', letterSpacing: '0.04em',
              textDecoration: 'none', color: '#fff',
              background: '#1abc9c',
              padding: isMobile ? '12px 20px' : '12px 24px',
              borderRadius: 10, transition: 'all 0.22s',
              display: 'inline-flex', alignItems: 'center', gap: 7,
              whiteSpace: 'nowrap',
              boxShadow: '0 3px 14px rgba(26,188,156,0.28)',
              alignSelf: isMobile ? 'stretch' : 'auto',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#17a882';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(26,188,156,0.36)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1abc9c';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 3px 14px rgba(26,188,156,0.28)';
            }}
          >
            Track My Repair
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5h9M8 3.5l3 3-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}