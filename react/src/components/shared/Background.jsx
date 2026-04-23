export default function Background() {
  return (
    <>
      {/* bg.jpg base layer */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: `url('/images/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
      }} />

      {/* Dark overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'rgba(10, 22, 44, 0.82)',
        width: '100vw',
        height: '100vh',
      }} />

      {/* Animated scanline overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(26,188,156,0.015) 3px,
            rgba(26,188,156,0.015) 4px
          )
        `,
        animation: 'scanShift 10s linear infinite',
      }} />

      {/* Blob 1 — top right */}
      <div style={{
        position: 'fixed',
        top: '-160px',
        right: '-120px',
        width: '520px',
        height: '520px',
        borderRadius: '50%',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 1,
        background: 'rgba(26,188,156,0.13)',
        animation: 'blobPulse 6s ease-in-out infinite',
      }} />

      {/* Blob 2 — bottom left */}
      <div style={{
        position: 'fixed',
        bottom: '-100px',
        left: '-80px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        filter: 'blur(90px)',
        pointerEvents: 'none',
        zIndex: 1,
        background: 'rgba(0,60,120,0.28)',
        animation: 'blobPulse 9s ease-in-out 2s infinite',
      }} />
    </>
  );
}