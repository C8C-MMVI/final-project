const FOOTER_LINKS = [
  { label: 'Home',         href: '#home' },
  { label: 'Services',     href: '#services' },
  { label: 'Track Repair', href: '#track-repair' },
  { label: 'Sign In',      href: '/login' },
];

export default function Footer() {
  return (
    <footer style={{
      position: 'relative', width: '100%', padding: '28px 0',
      borderTop: '1px solid rgba(26,188,156,0.1)',
      background: 'rgba(7,17,31,0.8)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#1abc9c', boxShadow: '0 0 7px #1abc9c', display: 'inline-block',
          }} />
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)',
          }}>
            TechnoLogs
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {FOOTER_LINKS.map(({ label, href }) => (
            <a key={label} href={href} style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#1abc9c'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '0.73rem',
          color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em',
          margin: 0, textAlign: 'center',
        }}>
          © {new Date().getFullYear()} TechnoLogs Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}