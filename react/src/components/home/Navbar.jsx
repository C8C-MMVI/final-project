import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'Services',     href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Track Repair', href: '#track-repair' },
];

// logo prop: pass <TechnoLogsLogo size="sm" /> from Home.jsx
export default function Navbar({ logo }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [width,     setWidth]     = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onResize = () => {
      setWidth(window.innerWidth);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const linkHover = e => (e.currentTarget.style.color = '#0d1f1a');
  const linkOut   = e => (e.currentTarget.style.color = 'rgba(13,31,26,0.52)');

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <nav style={{
        transition: 'background 0.3s, box-shadow 0.3s, border-color 0.3s',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(240,246,243,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(26,188,156,0.18)'
          : '1px solid rgba(26,188,156,0.10)',
        boxShadow: scrolled ? '0 2px 24px rgba(13,31,26,0.08)' : 'none',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '12px 20px' : isTablet ? '13px 28px' : '13px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            {logo ?? (
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 15 : 17,
                color: '#0d1f1a',
                letterSpacing: '-0.02em',
              }}>
                Techno<span style={{ color: '#1abc9c' }}>Logs</span>
              </span>
            )}
          </Link>

          {/* Desktop / Tablet nav links */}
          {!isMobile && (
            <ul style={{
              display: 'flex',
              gap: isTablet ? 16 : 32,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}>
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 400,
                      color: 'rgba(13,31,26,0.52)',
                      textDecoration: 'none',
                      fontSize: isTablet ? '0.82rem' : '0.875rem',
                      transition: 'color 0.18s',
                      letterSpacing: '0.01em',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={linkHover}
                    onMouseLeave={linkOut}
                  >{label}</a>
                </li>
              ))}
            </ul>
          )}

          {/* Desktop / Tablet CTAs */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: isTablet ? 6 : 8, flexShrink: 0 }}>
              <Link
                to="/login"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 700,
                  fontSize: isTablet ? '0.65rem' : '0.7rem',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  color: '#2e6b58',
                  padding: isTablet ? '8px 14px' : '9px 18px',
                  borderRadius: 8,
                  border: '1px solid rgba(26,188,156,0.28)',
                  background: 'transparent',
                  transition: 'all 0.2s',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#1abc9c';
                  e.currentTarget.style.color = '#1abc9c';
                  e.currentTarget.style.background = 'rgba(26,188,156,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(26,188,156,0.28)';
                  e.currentTarget.style.color = '#2e6b58';
                  e.currentTarget.style.background = 'transparent';
                }}
              >Sign In</Link>

              <Link
                to="/register"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 700,
                  fontSize: isTablet ? '0.65rem' : '0.7rem',
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  color: '#fff',
                  background: '#1abc9c',
                  padding: isTablet ? '8px 14px' : '9px 20px',
                  borderRadius: 8,
                  transition: 'all 0.22s',
                  display: 'inline-block',
                  boxShadow: '0 2px 10px rgba(26,188,156,0.28)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#17a882';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,188,156,0.38)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#1abc9c';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,188,156,0.28)';
                  e.currentTarget.style.transform = 'none';
                }}
              >Get Started</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              style={{
                background: 'rgba(26,188,156,0.08)',
                border: '1px solid rgba(26,188,156,0.2)',
                borderRadius: 8,
                padding: '9px 11px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block',
                  width: 20,
                  height: 2,
                  background: '#1abc9c',
                  borderRadius: 999,
                  transition: 'all 0.28s',
                  opacity: menuOpen && i === 1 ? 0 : 1,
                  transform: menuOpen
                    ? i === 0 ? 'translateY(7px) rotate(45deg)'
                    : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                    : 'none'
                    : 'none',
                }} />
              ))}
            </button>
          )}
        </div>

        {/* Mobile dropdown */}
        {isMobile && (
          <div style={{
            overflow: 'hidden',
            maxHeight: menuOpen ? '500px' : '0px',
            transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
          }}>
            <div style={{
              padding: '8px 20px 24px',
              background: 'rgba(255,255,255,0.98)',
              borderTop: '1px solid rgba(26,188,156,0.1)',
            }}>
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: 'rgba(13,31,26,0.6)',
                    textDecoration: 'none',
                    fontSize: '0.97rem',
                    padding: '13px 0',
                    borderBottom: '1px solid rgba(13,31,26,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1abc9c')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(13,31,26,0.6)')}
                >
                  {label}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="#1abc9c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, textAlign: 'center', textDecoration: 'none',
                  fontFamily: "'Orbitron', sans-serif", fontWeight: 700,
                  fontSize: '0.65rem', letterSpacing: '0.04em',
                  color: '#1abc9c',
                  border: '1px solid rgba(26,188,156,0.3)',
                  padding: '12px 0', borderRadius: 9,
                  background: 'transparent',
                }}>Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{
                  flex: 1, textAlign: 'center', textDecoration: 'none',
                  fontFamily: "'Orbitron', sans-serif", fontWeight: 700,
                  fontSize: '0.65rem', letterSpacing: '0.04em',
                  color: '#fff', background: '#1abc9c',
                  padding: '12px 0', borderRadius: 9,
                }}>Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}