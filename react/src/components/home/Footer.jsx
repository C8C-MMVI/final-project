import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'Services',     href: '#services' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Track Repair', href: '#track-repair' },
];

const ACCOUNT_LINKS = [
  { label: 'Sign In',  href: '/login' },
  { label: 'Register', href: '/register' },
];

const CONTACT_ITEMS = [
  {
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.24 1 2 3.24 2 6c0 3.75 5 8 5 8s5-4.25 5-8c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
    text: 'San Juan, La Union',
  },
  {
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3h11a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5zm0 0 5.5 5 5.5-5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
    text: 'support@technologs.ph',
  },
  {
    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h3l1.5 3.5-2 1a8.5 8.5 0 0 0 3 3l1-2L12 9v3a1 1 0 0 1-1 1A10 10 0 0 1 1 3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
    text: '+63 912 345 6789',
  },
];

const SOCIALS = [
  {
    label: 'Facebook', href: '#',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 1.5H3a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 3 14.5h5V10H6.5V8H8V6.5C8 5.12 8.87 4 10.5 4H12v2h-1.5c-.28 0-.5.22-.5.5V8h2l-.5 2H10v4.5H13a1.5 1.5 0 0 0 1.5-1.5V3A1.5 1.5 0 0 0 13 1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  },
  {
    label: 'Instagram', href: '#',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.1"/><circle cx="8" cy="8" r="2.8" stroke="currentColor" strokeWidth="1.1"/><circle cx="11.2" cy="4.8" r="0.7" fill="currentColor"/></svg>,
  },
  {
    label: 'Twitter', href: '#',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 3s-.9.5-1.8.65A2.3 2.3 0 0 0 8 5.5v.5C5.5 6 3.5 4.5 2 3c0 0-1.5 3 1.5 4.5-.5 0-.9-.1-1.4-.4C2 9 3.3 10.4 5 10.7c-.5.2-1 .2-1.4.1.9 2.3 3.2 2.4 3.2 2.4S4.9 14.5 2.5 14c5.5 3.2 11-.9 11-6.5V7c.65-.46 1.4-1.4 1.5-1.5s-.9 0-1-.5V5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>,
  },
];

function FooterLink({ href, children, isRoute }) {
  const style = {
    fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
    fontSize: '0.88rem', color: 'rgba(15,31,26,0.5)',
    textDecoration: 'none', transition: 'color 0.2s', display: 'inline-block',
  };
  const handlers = {
    onMouseEnter: e => (e.currentTarget.style.color = '#1abc9c'),
    onMouseLeave: e => (e.currentTarget.style.color = 'rgba(15,31,26,0.5)'),
  };
  return isRoute
    ? <Link to={href} style={style} {...handlers}>{children}</Link>
    : <a href={href} style={style} {...handlers}>{children}</a>;
}

// logo prop: pass <TechnoLogsLogo size="sm" /> from Home.jsx
export default function Footer({ logo }) {
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
    <footer style={{
      position: 'relative', width: '100%',
      background: '#eef2ef',
      borderTop: '1px solid rgba(26,188,156,0.15)',
    }}>
      {/* Top accent */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(26,188,156,0.4) 30%, rgba(26,188,156,0.6) 50%, rgba(26,188,156,0.4) 70%, transparent 100%)',
      }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: `${isMobile ? '36px' : 'clamp(40px,6vw,64px)'} ${isMobile ? '20px' : isTablet ? '28px' : 'clamp(20px,5vw,40px)'} ${isMobile ? '28px' : 'clamp(32px,4vw,48px)'}`,
        display: 'grid',
        gridTemplateColumns: isMobile
          ? '1fr'
          : isTablet
          ? 'repeat(2,1fr)'
          : 'repeat(auto-fit, minmax(min(100%,180px),1fr))',
        gap: isMobile ? '32px' : isTablet ? '32px 40px' : 'clamp(32px,5vw,52px)',
      }}>

        {/* Brand */}
        <div style={{ gridColumn: isMobile ? '1' : isTablet ? 'span 2' : 'span 2', minWidth: 0 }}>
          {/* Logo — use prop if provided, else fallback text */}
          <div style={{ marginBottom: 20 }}>
            {logo ?? (
              <span style={{
                fontFamily: "'Orbitron', sans-serif", fontWeight: 900,
                fontSize: '1.1rem', color: '#0f1f1a',
              }}>
                Techno<span style={{ color: '#1abc9c' }}>Logs</span>
              </span>
            )}
          </div>

          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
            fontSize: '0.875rem', lineHeight: 1.8,
            color: 'rgba(15,31,26,0.45)', margin: '0 0 24px',
            maxWidth: isMobile ? '100%' : 280,
          }}>
            A modern repair management platform connecting customers, certified technicians, and shop owners — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            {SOCIALS.map(({ label, href, icon }) => (
              <a key={label} href={href} aria-label={label} style={{
                width: 36, height: 36, borderRadius: 9,
                border: '1px solid rgba(15,31,26,0.12)',
                background: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(15,31,26,0.4)', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(26,188,156,0.4)'; e.currentTarget.style.color = '#1abc9c'; e.currentTarget.style.background = 'rgba(26,188,156,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(15,31,26,0.12)'; e.currentTarget.style.color = 'rgba(15,31,26,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'none'; }}
              >{icon}</a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p style={{
            fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: '0.6rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(15,31,26,0.35)', marginBottom: 18, marginTop: 0,
          }}>Navigation</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <li key={label}><FooterLink href={href}>{label}</FooterLink></li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <p style={{
            fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: '0.6rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(15,31,26,0.35)', marginBottom: 18, marginTop: 0,
          }}>Account</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ACCOUNT_LINKS.map(({ label, href }) => (
              <li key={label}><FooterLink href={href} isRoute>{label}</FooterLink></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div style={{ gridColumn: isMobile ? '1' : isTablet ? 'span 2' : undefined }}>
          <p style={{
            fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: '0.6rem',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(15,31,26,0.35)', marginBottom: 18, marginTop: 0,
          }}>Contact</p>
          <div style={{
            display: isTablet ? 'grid' : 'flex',
            gridTemplateColumns: isTablet ? 'repeat(3,1fr)' : undefined,
            flexDirection: 'column',
            gap: 14,
          }}>
            {CONTACT_ITEMS.map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#1abc9c', flexShrink: 0 }}>{icon}</span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
                  fontSize: '0.85rem', color: 'rgba(15,31,26,0.5)',
                  wordBreak: 'break-word',
                }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(15,31,26,0.08)', padding: `18px ${isMobile ? '20px' : 'clamp(20px,5vw,40px)'}` }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: isMobile ? 10 : 12,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
            fontSize: '0.76rem', color: 'rgba(15,31,26,0.3)', margin: 0,
          }}>
            © {new Date().getFullYear()} TechnoLogs Management System. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms of Service'].map(label => (
              <a key={label} href="#" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.76rem',
                color: 'rgba(15,31,26,0.3)', textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1abc9c')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(15,31,26,0.3)')}
              >{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}