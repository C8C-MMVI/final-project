import { useState, useEffect } from 'react';

const SERVICES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="2" width="16" height="18" rx="2" stroke="#1abc9c" strokeWidth="1.4"/>
        <rect x="7" y="6" width="8" height="5" rx="1" stroke="#1abc9c" strokeWidth="1.2"/>
        <path d="M7 15h8M7 17.5h5" stroke="#1abc9c" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Screen Replacement',
    desc: 'Cracked or unresponsive displays replaced with premium-grade parts. Same-day service for most models.',
    tag: 'Most Popular',
    accent: true,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="5" y="7" width="12" height="7" rx="2" stroke="#1abc9c" strokeWidth="1.4"/>
        <path d="M17 10h2M3 10h2" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M9 10.5h4" stroke="#1abc9c" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Battery Replacement',
    desc: 'Restore full capacity with genuine replacements for all major smartphone and laptop brands.',
    tag: null, accent: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3C7 3 4 6.13 4 9s3 6 7 7c4-1 7-4.13 7-7 0-2.87-3-6-7-6z" stroke="#1abc9c" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8 9l2 2 4-4" stroke="#1abc9c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Water Damage Repair',
    desc: 'Professional ultrasonic cleaning and component-level repair for liquid-damaged devices.',
    tag: null, accent: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3C7 3 4 6 4 10s3 7 7 7 7-3 7-7" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M15 3l4 4-4 4" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 10v3" stroke="#1abc9c" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Signal & Network Fix',
    desc: 'Antenna repairs, SIM tray replacements, and network IC fixes to restore full connectivity.',
    tag: null, accent: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="12" rx="2" stroke="#1abc9c" strokeWidth="1.4"/>
        <path d="M7 9l2 2 4-4" stroke="#1abc9c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 19h16" stroke="#1abc9c" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Software & Unlocking',
    desc: 'OS reinstallation, factory resets, virus removal, and carrier unlocking for all devices.',
    tag: null, accent: false,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L5 6v5c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V6L11 3z" stroke="#1abc9c" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M8 11l2 2 4-4" stroke="#1abc9c" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Accessories & Parts',
    desc: 'Cases, protectors, cables, chargers, and OEM spare parts available in-store.',
    tag: null, accent: false,
  },
];

function ServiceCard({ icon, title, desc, tag, accent, index, isMobile }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 16,
        padding: isMobile ? '18px 16px 16px' : '22px 20px 20px',
        borderRadius: 16,
        background: hovered ? '#fff' : accent ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.68)',
        border: hovered
          ? '1px solid rgba(26,188,156,0.42)'
          : accent
          ? '1px solid rgba(26,188,156,0.28)'
          : '1px solid rgba(26,188,156,0.12)',
        transform: hovered ? 'translateY(-5px)' : 'none',
        boxShadow: hovered
          ? '0 24px 52px rgba(26,188,156,0.12), 0 6px 16px rgba(13,31,26,0.07)'
          : accent
          ? '0 4px 20px rgba(26,188,156,0.1)'
          : '0 2px 8px rgba(13,31,26,0.04)',
        transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'default',
        animation: `fadeUp 0.45s ease ${0.07 * index}s both`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 16, bottom: 16, width: 3, borderRadius: '0 3px 3px 0',
        background: '#1abc9c',
        opacity: hovered ? 1 : accent ? 0.7 : 0,
        transition: 'opacity 0.28s',
      }} />

      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 20, right: 20, height: 2, borderRadius: '0 0 3px 3px',
        background: 'linear-gradient(90deg, transparent, rgba(26,188,156,0.55), transparent)',
        opacity: hovered ? 1 : accent ? 0.5 : 0,
        transition: 'opacity 0.28s',
      }} />

      {/* Icon row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: isMobile ? 40 : 46, height: isMobile ? 40 : 46, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hovered ? 'rgba(26,188,156,0.12)' : 'rgba(26,188,156,0.07)',
          border: '1px solid rgba(26,188,156,0.18)',
          transition: 'background 0.28s', flexShrink: 0,
        }}>
          {icon}
        </div>
        {tag && (
          <span style={{
            fontFamily: "'Orbitron',sans-serif", fontSize: '0.57rem', fontWeight: 700,
            letterSpacing: '0.11em', textTransform: 'uppercase',
            color: '#0e8f6a', background: 'rgba(26,188,156,0.11)',
            padding: '4px 10px', borderRadius: 99, border: '1px solid rgba(26,188,156,0.24)',
          }}>{tag}</span>
        )}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
        fontSize: isMobile ? '0.9rem' : '0.97rem',
        color: '#0a1c16', margin: 0,
      }}>{title}</h3>

      {/* Desc */}
      <p style={{
        fontFamily: "'DM Sans',sans-serif", fontWeight: 400,
        fontSize: isMobile ? '0.82rem' : '0.84rem',
        lineHeight: 1.76, color: 'rgba(13,31,26,0.5)', margin: 0, flex: 1,
      }}>{desc}</p>

      {/* Learn more */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5, color: '#1abc9c',
        fontSize: '0.75rem', fontFamily: "'Orbitron',sans-serif", fontWeight: 700,
        letterSpacing: '0.04em',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
        transition: 'opacity 0.22s, transform 0.22s',
        marginTop: 'auto',
      }}>
        Learn more
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8M7 3l3 3-3 3" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export default function Services() {
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
    <section id="services" style={{
      position: 'relative', width: '100%',
      padding: isMobile ? '0 0 60px' : '0 0 88px',
      background: '#f7fbf9',
    }}>

      {/* Section divider */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 8px' }}>
        <div style={{ width: 1, height: 56, background: 'linear-gradient(to bottom, transparent, rgba(26,188,156,0.3))' }} />
        <div style={{ width: 7, height: 7, borderRadius: 2, transform: 'rotate(45deg)', background: 'rgba(26,188,156,0.4)' }} />
      </div>

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: `52px ${isMobile ? '20px' : isTablet ? '28px' : 'clamp(20px,5vw,40px)'} 0`,
      }}>

        {/* Header */}
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '1fr auto',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          gap: isMobile ? 12 : 32,
          marginBottom: isMobile ? 28 : 44,
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{
              fontFamily: "'Orbitron',sans-serif", fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1abc9c',
              display: 'block', marginBottom: 10,
            }}>What We Offer</span>
            <h2 style={{
              fontFamily: "'Orbitron',sans-serif", fontWeight: 800,
              fontSize: isMobile ? '1.7rem' : isTablet ? '2.1rem' : 'clamp(1.7rem,4vw,2.65rem)',
              lineHeight: 1.08, letterSpacing: '-0.022em', color: '#0a1c16', margin: 0,
            }}>
              Expert Repair{' '}
              <span style={{ background: 'linear-gradient(95deg, #1abc9c, #0aaa86)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Services</span>
            </h2>
          </div>
          <p style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: isMobile ? '0.87rem' : '0.92rem',
            lineHeight: 1.78, color: 'rgba(13,31,26,0.46)',
            maxWidth: isMobile ? '100%' : 320,
            margin: 0,
            textAlign: isMobile ? 'left' : 'right',
          }}>
            From cracked screens to complex motherboard repairs — certified precision and genuine parts.
          </p>
        </div>

        {/* Card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : isTablet
            ? 'repeat(2, 1fr)'
            : 'repeat(auto-fit, minmax(min(100%, 265px), 1fr))',
          gap: isMobile ? 12 : 14,
        }}>
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} {...s} index={i} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </section>
  );
}