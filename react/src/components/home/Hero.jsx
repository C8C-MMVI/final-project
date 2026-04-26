import { Link } from 'react-router-dom';

const STATS = [
  { value: '500+', label: 'Repairs Done'   },
  { value: '98%',  label: 'Satisfaction'   },
  { value: '24h',  label: 'Avg Turnaround' },
];

export default function Hero() {
  return (
    <section id="home" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '140px 24px 100px',
    }}>

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `
          linear-gradient(rgba(26,188,156,0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,188,156,0.055) 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
        maskImage: 'radial-gradient(ellipse 80% 75% at 50% 50%, black 20%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at 50% 50%, black 20%, transparent 80%)',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 700, borderRadius: '50%', pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(circle, rgba(26,188,156,0.09) 0%, transparent 65%)',
        animation: 'blobPulse 9s ease-in-out infinite',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 800,
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          marginBottom: 24, padding: '6px 16px', borderRadius: 999,
          border: '1px solid rgba(26,188,156,0.28)', background: 'rgba(26,188,156,0.07)',
          fontFamily: "'Syne', sans-serif", fontSize: '0.7rem', fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1abc9c',
          animation: 'fadeUp 0.5s ease both',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#1abc9c', boxShadow: '0 0 7px #1abc9c', flexShrink: 0,
          }} />
          Cellphone Repair Management
        </div>

        {/* Headline — kept on 2 lines, tighter font size */}
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(2rem, 4vw, 3.4rem)',
          lineHeight: 1.12,
          letterSpacing: '-0.02em', color: '#fff',
          marginBottom: 18, marginTop: 0,
          animation: 'fadeUp 0.5s ease 0.08s both',
        }}>
          Your Repair,{' '}
          <span style={{
            background: 'linear-gradient(95deg, #1abc9c, #0fd4a0)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Tracked.
          </span>
          <br />
          Our Expertise, Delivered.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
          fontSize: '1rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.52)',
          marginBottom: 32, marginTop: 0, maxWidth: 480,
          animation: 'fadeUp 0.5s ease 0.16s both',
        }}>
          Drop off your device and follow every step of the repair in real-time.
          Transparent, fast, and reliable service — all in one place.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, flexWrap: 'wrap', marginBottom: 44,
          animation: 'fadeUp 0.5s ease 0.24s both',
        }}>
          <Link to="/register" style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none', color: '#07111f', background: '#1abc9c',
            padding: '13px 28px', borderRadius: 10, transition: 'all 0.2s', display: 'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,188,156,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Get Started Free
          </Link>
          <a href="#track-repair" style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase',
            textDecoration: 'none', color: '#1abc9c',
            border: '1px solid rgba(26,188,156,0.35)',
            padding: '13px 28px', borderRadius: 10, transition: 'all 0.2s', display: 'inline-block',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,188,156,0.08)'; e.currentTarget.style.borderColor = '#1abc9c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(26,188,156,0.35)'; }}
          >
            Track My Repair
          </a>
        </div>

        {/* Stats bar — solid dark background so it's always visible against the bg image */}
        <div style={{
          display: 'flex', alignItems: 'stretch',
          border: '1px solid rgba(26,188,156,0.22)',
          borderRadius: 14,
          background: 'rgba(7,17,31,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          overflow: 'hidden',
          animation: 'fadeUp 0.5s ease 0.32s both',
          width: '100%', maxWidth: 460,
        }}>
          {STATS.map(({ value, label }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, padding: '18px 0', flex: 1,
              }}>
                <span style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: '1.6rem', color: '#1abc9c', lineHeight: 1,
                }}>
                  {value}
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '0.63rem',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.38)',
                }}>
                  {label}
                </span>
              </div>
              {i < STATS.length - 1 && (
                <div style={{ width: 1, height: 32, background: 'rgba(26,188,156,0.15)', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        animation: 'fadeUp 0.5s ease 0.5s both',
      }}>
        <span style={{
          fontFamily: "'Syne', sans-serif", fontSize: '0.6rem',
          letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
        }}>
          Scroll
        </span>
        <div style={{
          width: 1, height: 32,
          background: 'linear-gradient(to bottom, #1abc9c, transparent)',
          animation: 'scrollPulse 2s ease-in-out infinite',
        }} />
      </div>
    </section>
  );
}