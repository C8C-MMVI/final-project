import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'Services',     href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Track Repair', href: '#track-repair' },
];

const S = {
  nav: (scrolled) => ({
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 50,
    transition: 'all 0.3s',
    background:     scrolled ? 'rgba(7,17,31,0.92)' : 'transparent',
    backdropFilter: scrolled ? 'blur(18px)'          : 'none',
    borderBottom:   scrolled ? '1px solid rgba(26,188,156,0.12)' : 'none',
    boxShadow:      scrolled ? '0 4px 32px rgba(0,0,0,0.35)'    : 'none',
  }),
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '18px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    textDecoration: 'none',
  },
  logoDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#1abc9c', boxShadow: '0 0 10px #1abc9c',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800,
    fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.01em',
  },
  links: {
    display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0,
  },
  link: {
    fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s',
  },
  ctas: { display: 'flex', alignItems: 'center', gap: 10 },
  btnGhost: {
    fontFamily: "'Syne', sans-serif", fontWeight: 700,
    fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase',
    textDecoration: 'none', color: '#1abc9c',
    border: '1px solid rgba(26,188,156,0.35)',
    padding: '9px 20px', borderRadius: 8, transition: 'all 0.2s',
    display: 'inline-block',
  },
  btnSolid: {
    fontFamily: "'Syne', sans-serif", fontWeight: 700,
    fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase',
    textDecoration: 'none', color: '#07111f', background: '#1abc9c',
    padding: '9px 20px', borderRadius: 8, transition: 'all 0.2s',
    display: 'inline-block',
  },
  mobileBtn: {
    display: 'flex', flexDirection: 'column', gap: 5,
    background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
  },
  mobileBar: {
    display: 'block', width: 24, height: 2,
    background: '#1abc9c', borderRadius: 999, transition: 'all 0.3s',
  },
  mobileMenu: {
    padding: '0 24px 24px',
    background: 'rgba(7,17,31,0.98)',
    borderTop: '1px solid rgba(26,188,156,0.12)',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  mobileLink: {
    fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none', fontSize: '1rem',
  },
  mobileCtas: { display: 'flex', gap: 10, marginTop: 4 },
};

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <nav style={S.nav(scrolled)}>
      <div style={S.inner}>

        {/* Logo */}
        <Link to="/" style={S.logo}>
          <span style={S.logoDot} />
          <span style={S.logoText}>TechnoLogs</span>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <ul style={S.links}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} style={S.link}
                  onMouseEnter={e => e.currentTarget.style.color = '#1abc9c'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Desktop CTAs */}
        {!isMobile && (
          <div style={S.ctas}>
            <Link to="/login" style={S.btnGhost}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,188,156,0.09)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Sign In</Link>
            <Link to="/register" style={S.btnSolid}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,188,156,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >Get Started</Link>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button style={S.mobileBtn} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                ...S.mobileBar,
                transform: menuOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
              }} />
            ))}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={S.mobileMenu}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} style={S.mobileLink} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <div style={S.mobileCtas}>
            <Link to="/login" onClick={() => setMenuOpen(false)}
              style={{ ...S.btnGhost, flex: 1, textAlign: 'center' }}>Sign In</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}
              style={{ ...S.btnSolid, flex: 1, textAlign: 'center' }}>Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}