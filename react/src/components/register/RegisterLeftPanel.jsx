export default function RegisterLeftPanel({ logoSrc = '/images/Logo.png' }) {
  return (
    <div
      className="relative flex flex-col justify-center overflow-hidden border-r border-[rgba(26,188,156,0.18)] px-[clamp(28px,4vw,50px)] py-[clamp(32px,6vh,60px)]"
      style={{ background: 'linear-gradient(160deg, rgba(26,188,156,0.07) 0%, transparent 65%)' }}
    >
      {/* Radial glow */}
      <div
        className="absolute -top-[70px] -left-[70px] w-[260px] h-[260px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,188,156,0.11) 0%, transparent 70%)' }}
      />

      <img
        src={logoSrc}
        alt="TechnoLogs Logo"
        className="w-full max-w-[450px] h-auto mb-1"
        style={{ filter: 'drop-shadow(0 0 14px rgba(26,188,156,0.35))', animation: 'fadeUp 0.5s ease both' }}
      />

      <div
        className="font-koho text-[28px] font-bold text-white capitalize mb-[clamp(20px,4vh,38px)]"
        style={{ animation: 'fadeUp 0.5s ease 0.1s both' }}
      >
        Management System
      </div>

      <p
        className="font-koho text-[30px] font-semibold leading-[1.35] text-white"
        style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}
      >
        Join Our <span className="text-teal">Community</span>
      </p>

      <p
        className="font-koho text-[18px] leading-[1.8] text-white mt-3"
        style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}
      >
        Create your account to track your device repairs, view service history,
        and stay updated on your repair status in real-time.
      </p>
    </div>
  );
}
