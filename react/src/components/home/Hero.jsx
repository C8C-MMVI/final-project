import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const TRUST_BADGES = [
  { text: 'Certified Technicians' },
  { text: 'Real-Time Tracking' },
  { text: 'Transparent Pricing' },
];

export default function Hero() {
  const canvasRef = useRef(null);
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [stats, setStats] = useState([
    { display: '—', label: 'Repairs Done' },
    { display: '—', label: 'Satisfaction' },
    { display: '—', label: 'Active Repairs' },
    { display: '—', label: 'Partner Shops' },
  ]);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetch('/api/stats.php')
      .then(r => r.json())
      .then(data => {
        if (!data.success) return;
        setStats([
          { display: data.repairs_done   ? `${data.repairs_done}+`  : '0',  label: 'Repairs Done' },
          { display: data.avg_rating     ?? '4.8★',                          label: 'Satisfaction' },
          { display: data.active_repairs ? `${data.active_repairs}` : '0',  label: 'Active Repairs' },
          { display: data.partner_shops  ? `${data.partner_shops}+` : '0',  label: 'Partner Shops' },
        ]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({ length: 48 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.12 + 0.04,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26,188,156,${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 95) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(26,188,156,${0.07 * (1 - d / 95)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <section id="home" style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: '#f0f6f3',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: isMobile
        ? '100px 0 60px'
        : isTablet
        ? '110px 0 70px'
        : 'clamp(100px,13vw,145px) 0 clamp(60px,8vw,90px)',
    }}>
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Glow accents */}
      <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 'min(680px,80vw)', height: 'min(680px,80vw)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1, background: 'radial-gradient(circle, rgba(26,188,156,0.1) 0%, transparent 62%)' }} />
      <div style={{ position: 'absolute', bottom: '-12%', left: '-6%', width: 'min(380px,48vw)', height: 'min(380px,48vw)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1, background: 'radial-gradient(circle, rgba(26,188,156,0.06) 0%, transparent 65%)' }} />
      {/* Dot grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: 'radial-gradient(circle, rgba(26,188,156,0.13) 1px, transparent 1px)', backgroundSize: '30px 30px', maskImage: 'radial-gradient(ellipse 60% 55% at 72% 38%, black 0%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 72% 38%, black 0%, transparent 80%)', opacity: 0.45 }} />

      <div style={{
        position: 'relative',
        zIndex: 3,
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '0 20px' : isTablet ? '0 28px' : '0 clamp(20px,5vw,40px)',
        width: '100%',
      }}>
        <div style={{
          maxWidth: isMobile ? '100%' : isTablet ? 560 : 580,
          marginLeft: 0,
        }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: isMobile ? 18 : 24,
            padding: '6px 16px', borderRadius: 99,
            border: '1px solid rgba(26,188,156,0.28)',
            background: 'rgba(26,188,156,0.07)',
            animation: 'fadeUp 0.5s ease 0.05s both',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#1abc9c', boxShadow: '0 0 0 3px rgba(26,188,156,0.22)',
              flexShrink: 0, animation: 'heroPulse 2.2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: "'Orbitron',sans-serif",
              fontSize: isMobile ? '0.6rem' : '0.67rem',
              fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#0e8f6a',
            }}>Device Repair Management Platform</span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
            fontSize: isMobile ? '2rem' : isTablet ? '2.4rem' : 'clamp(2.1rem,4.6vw,3.4rem)',
            lineHeight: 1.07, letterSpacing: '-0.027em', color: '#0a1c16',
            margin: `0 0 ${isMobile ? 16 : 20}px`,
            animation: 'fadeUp 0.55s ease 0.1s both',
          }}>
            Fast Repairs,{' '}
            <span style={{
              display: 'block',
              background: 'linear-gradient(100deg, #1abc9c 0%, #0aaa86 55%, #09967a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Full Transparency.
            </span>
          </h1>

          {/* Body */}
          <p style={{
            fontFamily: "'DM Sans',sans-serif", fontWeight: 400,
            fontSize: isMobile ? '0.92rem' : '1.07rem',
            lineHeight: 1.82, color: '#4e7268',
            margin: `0 0 ${isMobile ? 22 : 28}px`,
            maxWidth: 470,
            animation: 'fadeUp 0.55s ease 0.15s both',
          }}>
            Drop off your phone or laptop at a certified TechnoLogs shop and track every step of your repair in real-time — no guesswork, no waiting.
          </p>

          {/* Trust badges */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: isMobile ? 14 : 'clamp(14px,2.6vw,26px)',
            flexWrap: 'wrap',
            marginBottom: isMobile ? 24 : 30,
            animation: 'fadeUp 0.55s ease 0.18s both',
          }}>
            {TRUST_BADGES.map(({ text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L2 4v4.5c0 3.5 2.4 6.8 6 7.5 3.6-.7 6-4 6-7.5V4L8 1.5z" stroke="#1abc9c" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M5 8l2 2 4-4" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: isMobile ? '0.76rem' : '0.8rem',
                  color: 'rgba(13,31,26,0.5)', whiteSpace: 'nowrap',
                }}>{text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 10, flexWrap: 'wrap',
            marginBottom: isMobile ? 36 : 44,
            animation: 'fadeUp 0.55s ease 0.22s both',
          }}>
            <Link
              to="/register"
              style={{
                fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
                fontSize: isMobile ? '0.84rem' : '0.88rem',
                letterSpacing: '0.04em', textDecoration: 'none', color: '#fff',
                background: '#1abc9c',
                padding: isMobile ? '12px 22px' : '13px 28px',
                borderRadius: 11, transition: 'all 0.22s',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(26,188,156,0.34)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#17a882';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,188,156,0.44)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#1abc9c';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,188,156,0.34)';
              }}
            >
              Book a Repair
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="#track-repair"
              style={{
                fontFamily: "'Orbitron',sans-serif", fontWeight: 600,
                fontSize: isMobile ? '0.84rem' : '0.88rem',
                letterSpacing: '0.03em', textDecoration: 'none', color: '#2e6b58',
                border: '1px solid rgba(26,188,156,0.3)',
                padding: isMobile ? '12px 20px' : '13px 26px',
                borderRadius: 11, transition: 'all 0.22s',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.75)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#1abc9c';
                e.currentTarget.style.color = '#1abc9c';
                e.currentTarget.style.background = 'rgba(26,188,156,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(26,188,156,0.3)';
                e.currentTarget.style.color = '#2e6b58';
                e.currentTarget.style.background = 'rgba(255,255,255,0.75)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 4V7l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Track My Repair
            </a>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            maxWidth: isMobile ? '100%' : 500,
            border: '1px solid rgba(26,188,156,0.18)',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            overflow: 'hidden',
            animation: 'fadeUp 0.55s ease 0.3s both',
            boxShadow: '0 4px 28px rgba(13,31,26,0.07)',
          }}>
            {stats.map(({ display, label }, i) => {
              // On mobile (2-col grid), add bottom border to top row items
              const isTopRow   = isMobile && i < 2;
              const isLeftCol  = isMobile && i % 2 === 0;
              return (
                <div key={label} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center',
                  padding: isMobile ? '16px 8px' : 'clamp(14px,2vw,20px) 8px',
                  gap: 4,
                  borderRight: isMobile
                    ? isLeftCol ? '1px solid rgba(26,188,156,0.12)' : 'none'
                    : i < stats.length - 1 ? '1px solid rgba(26,188,156,0.12)' : 'none',
                  borderBottom: isTopRow ? '1px solid rgba(26,188,156,0.12)' : 'none',
                }}>
                  <span style={{
                    fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
                    fontSize: isMobile ? '1.1rem' : 'clamp(1.05rem,2.3vw,1.5rem)',
                    color: '#1abc9c', lineHeight: 1,
                  }}>{display}</span>
                  <span style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: isMobile ? '0.55rem' : 'clamp(0.51rem,0.83vw,0.61rem)',
                    letterSpacing: '0.09em', textTransform: 'uppercase',
                    color: 'rgba(13,31,26,0.36)', textAlign: 'center', lineHeight: 1.3,
                  }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator — hidden on mobile to save space */}
      {!isMobile && (
        <div style={{
          position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)',
          zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
          animation: 'fadeUp 0.5s ease 0.65s both',
        }}>
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '0.53rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(13,31,26,0.2)' }}>Scroll</span>
          <div style={{ width: 22, height: 36, borderRadius: 99, border: '1.5px solid rgba(13,31,26,0.13)', display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
            <div style={{ width: 3, height: 7, borderRadius: 99, background: '#1abc9c', animation: 'heroScroll 2.4s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes heroPulse  { 0%,100%{box-shadow:0 0 0 3px rgba(26,188,156,0.22)} 50%{box-shadow:0 0 0 6px rgba(26,188,156,0.07)} }
        @keyframes heroScroll { 0%,100%{transform:translateY(0);opacity:1} 70%{transform:translateY(12px);opacity:0} }
      `}</style>
    </section>
  );
}