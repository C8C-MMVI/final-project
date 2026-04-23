export default function LeftPanel({ logoSrc = '/images/Logo.png' }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 'clamp(32px, 6vh, 60px) clamp(28px, 4vw, 50px)',
      background: 'linear-gradient(160deg, rgba(26,188,156,0.07) 0%, transparent 65%)',
      borderRight: '1px solid rgba(26,188,156,0.18)',
      overflow: 'hidden',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: '-70px', left: '-70px',
        width: '260px', height: '260px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,188,156,0.11) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <img
        src={logoSrc}
        alt="TechnoLogs Logo"
        style={{
          width: '100%', maxWidth: '450px', height: 'auto',
          marginBottom: '4px',
          filter: 'drop-shadow(0 0 14px rgba(26,188,156,0.35))',
          animation: 'fadeUp 0.5s ease both',
        }}
      />
      <div style={{
        fontFamily: 'KoHo, sans-serif',
        fontSize: '28px', fontWeight: 'bold',
        color: 'white', textTransform: 'capitalize',
        marginBottom: 'clamp(20px, 4vh, 38px)',
        animation: 'fadeUp 0.5s ease 0.1s both',
      }}>
        Management System
      </div>
      <p style={{
        fontFamily: 'KoHo, sans-serif',
        fontSize: '30px', fontWeight: '600',
        lineHeight: '1.35', color: 'white',
        margin: '0',
        animation: 'fadeUp 0.5s ease 0.2s both',
      }}>
        Streamline Your{' '}
        <span style={{ color: '#1abc9c' }}>Repair Business</span>
      </p>
      <p style={{
        fontFamily: 'KoHo, sans-serif',
        fontSize: '18px', lineHeight: '1.8',
        color: 'rgba(255,255,255,0.75)',
        margin: '12px 0 0 0',
        animation: 'fadeUp 0.5s ease 0.3s both',
      }}>
        Comprehensive management solution for cellphone repair shops and
        accessories retailers. Track repairs, manage inventory, and grow
        your business—all in one powerful platform.
      </p>
    </div>
  );
}