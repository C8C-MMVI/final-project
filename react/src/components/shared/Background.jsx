export default function Background() {
  return (
    <>
      {/* bg.jpg base layer */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url('/images/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw', height: '100vh',
      }} />

      {/* Light overlay — replaces the old dark navy one */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'rgba(240,246,243,0.88)',
        width: '100vw', height: '100vh',
      }} />

      {/* Subtle teal glow — top right */}
      <div style={{
        position: 'fixed', top: '-160px', right: '-120px',
        width: '520px', height: '520px', borderRadius: '50%',
        filter: 'blur(90px)', pointerEvents: 'none', zIndex: 1,
        background: 'rgba(26,188,156,0.1)',
        animation: 'blobPulse 6s ease-in-out infinite',
      }} />

      {/* Subtle green glow — bottom left */}
      <div style={{
        position: 'fixed', bottom: '-100px', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        filter: 'blur(90px)', pointerEvents: 'none', zIndex: 1,
        background: 'rgba(26,188,156,0.07)',
        animation: 'blobPulse 9s ease-in-out 2s infinite',
      }} />
    </>
  );
}