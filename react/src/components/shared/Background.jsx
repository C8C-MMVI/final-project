export default function Background() {
  return (
    <>
      {/* Animated scanline background */}
      <div className="fixed inset-0 z-0 bg-navy" style={{
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
      <div
        className="fixed -top-40 -right-28 w-[520px] h-[520px] rounded-full blur-[90px] pointer-events-none z-[1]"
        style={{
          background: 'rgba(26,188,156,0.13)',
          animation: 'blobPulse 6s ease-in-out infinite',
        }}
      />

      {/* Blob 2 — bottom left */}
      <div
        className="fixed -bottom-24 -left-20 w-[400px] h-[400px] rounded-full blur-[90px] pointer-events-none z-[1]"
        style={{
          background: 'rgba(0,60,120,0.28)',
          animation: 'blobPulse 9s ease-in-out 2s infinite',
        }}
      />
    </>
  );
}