import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(26,188,156,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,188,156,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,188,156,0.08) 0%, transparent 70%)', animation: 'blobPulse 8s ease-in-out infinite' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,60,120,0.2) 0%, transparent 70%)', animation: 'blobPulse 10s ease-in-out 3s infinite' }} />

      {/* ALL content centered */}
      <div className="relative z-[2] w-full flex flex-col items-center text-center px-6">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-[0.78rem] font-koho tracking-widest text-teal uppercase"
          style={{
            border: '1px solid rgba(26,188,156,0.3)',
            background: 'rgba(26,188,156,0.07)',
            animation: 'fadeUp 0.5s ease both',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-teal inline-block" style={{ boxShadow: '0 0 8px #1abc9c' }} />
          Cellphone Repair Management
        </div>

        {/* Headline */}
        <h1
          className="font-koho font-bold text-white leading-[1.1] mb-6 max-w-[860px]"
          style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            animation: 'fadeUp 0.5s ease 0.1s both',
            textShadow: '0 0 80px rgba(26,188,156,0.15)',
          }}
        >
          Your Repair,{' '}
          <span style={{ background: 'linear-gradient(90deg, #1abc9c, #0ea882)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tracked.
          </span>
          <br />
          Our Expertise,{' '}
          <span className="text-white">Delivered.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="font-koho text-[rgba(255,255,255,0.6)] text-[1.1rem] leading-[1.8] mb-10 max-w-[580px]"
          style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}
        >
          Drop off your device, and track every step of the repair process in real-time.
          Transparent, fast, and reliable service — all in one place.
        </p>

        {/* CTA buttons */}
        <div
          className="flex items-center justify-center gap-4 flex-wrap mb-16"
          style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}
        >
          <Link
            to="/register"
            className="font-rajdhani font-bold tracking-[3px] uppercase text-white px-8 py-[14px] rounded-[10px] no-underline transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(26,188,156,0.5)] text-[0.95rem]"
            style={{ background: 'linear-gradient(90deg, #0ea882, #1abc9c)', boxShadow: '0 6px 24px rgba(26,188,156,0.35)' }}
          >
            Get Started Free
          </Link>
          <a
            href="#track-repair"
            className="font-rajdhani font-bold tracking-[3px] uppercase text-teal px-8 py-[14px] rounded-[10px] no-underline border border-[rgba(26,188,156,0.4)] transition-all duration-200 hover:bg-[rgba(26,188,156,0.08)] hover:border-teal text-[0.95rem]"
          >
            Track My Repair
          </a>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-10"
          style={{ animation: 'fadeUp 0.5s ease 0.4s both' }}
        >
          {[
            { value: '500+', label: 'Repairs Done' },
            { value: '98%',  label: 'Satisfaction' },
            { value: '24h',  label: 'Avg Turnaround' },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <div className="font-koho font-bold text-teal text-[2rem]">{value}</div>
              <div className="font-koho text-[rgba(255,255,255,0.5)] text-[0.75rem] tracking-wider uppercase mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2"
        style={{ animation: 'fadeUp 0.5s ease 0.6s both' }}>
        <span className="font-koho text-[0.7rem] tracking-[3px] text-[rgba(255,255,255,0.3)] uppercase">Scroll</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-teal to-transparent" />
      </div>
    </section>
  );
}