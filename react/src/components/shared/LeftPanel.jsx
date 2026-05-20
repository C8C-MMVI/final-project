import TechnoLogsLogo from './TechnoLogsLogo';

export default function LeftPanel() {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 'clamp(32px, 6vh, 60px) clamp(28px, 4vw, 50px)',
      background: 'linear-gradient(155deg, #e6f5ef 0%, #f0f9f5 50%, #eaf4ee 100%)',
      borderRight: '1px solid rgba(26,188,156,0.15)',
      overflow: 'hidden',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Radial glow top-left */}
      <div style={{
        position: 'absolute', top: '-80px', left: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,188,156,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Radial glow bottom-right */}
      <div style={{
        position: 'absolute', bottom: '-60px', right: '-60px',
        width: '220px', height: '220px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,188,156,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '420px',
        marginBottom: '4px',
        animation: 'fadeUp 0.5s ease both',
      }}>
        <TechnoLogsLogo size="lg" className="login-logo-component" />
      </div>

      <p style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 'clamp(22px, 2.8vw, 28px)',
        fontWeight: '900',
        lineHeight: '1.3',
        color: '#0a1c16',
        margin: 'clamp(20px, 4vh, 38px) 0 0 0',
        animation: 'fadeUp 0.5s ease 0.1s both',
      }}>
        Streamline Your{' '}
        <span style={{ color: '#1abc9c' }}>Repair Business.</span>
      </p>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '16px',
        lineHeight: '1.8',
        color: 'rgba(13,31,26,0.55)',
        margin: '12px 0 0 0',
        animation: 'fadeUp 0.5s ease 0.2s both',
      }}>
        Comprehensive management solution for cellphone repair shops and
        accessories retailers. Track repairs, manage inventory, and grow
        your business — all in one powerful platform.
      </p>
    </div>
  );
}