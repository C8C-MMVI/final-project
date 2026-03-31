const SERVICES = [
  { icon: '🔧', title: 'Screen Replacement',  desc: 'Cracked or unresponsive screens replaced with premium quality parts. Same-day service available.' },
  { icon: '🔋', title: 'Battery Replacement', desc: 'Restore your device to full capacity with genuine battery replacements for all major brands.' },
  { icon: '💧', title: 'Water Damage Repair', desc: 'Professional cleaning and component-level repair for liquid-damaged devices.' },
  { icon: '📡', title: 'Signal & Network Fix', desc: 'Antenna repairs, SIM tray replacements, and network IC fixes to restore full connectivity.' },
  { icon: '⚙️', title: 'Software & Unlocking', desc: 'OS reinstallation, factory resets, and carrier unlocking services for all devices.' },
  { icon: '🛡️', title: 'Accessories & Parts',  desc: 'Wide selection of cases, chargers, cables, and OEM spare parts available in-store.' },
];

export default function Services() {
  return (
    <section id="services" className="relative w-full py-32">

      {/* Section top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-transparent to-teal" />

      {/* Centered container with consistent horizontal padding */}
      <div className="w-full max-w-[1280px] mx-auto px-8 flex flex-col items-center">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 w-full">
          <span className="font-koho text-teal text-[0.78rem] tracking-[4px] uppercase mb-3">
            What We Offer
          </span>
          <h2 className="font-koho font-bold text-white leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Expert Repair <span className="text-teal">Services</span>
          </h2>
          <p className="font-koho text-[rgba(255,255,255,0.5)] text-[1rem] mt-4 max-w-[500px] leading-relaxed">
            From screen replacements to complex motherboard repairs — we handle it all with precision and care.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {SERVICES.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="group flex flex-col gap-4 p-7 rounded-[16px] transition-all duration-300 cursor-default hover:-translate-y-[4px]"
              style={{
                background:    'rgba(10,22,44,0.6)',
                border:        '1px solid rgba(26,188,156,0.12)',
                backdropFilter: 'blur(12px)',
                animation:     `fadeUp 0.5s ease ${0.1 * i}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border     = '1px solid rgba(26,188,156,0.4)';
                e.currentTarget.style.boxShadow  = '0 12px 40px rgba(26,188,156,0.12)';
                e.currentTarget.style.background = 'rgba(26,188,156,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border     = '1px solid rgba(26,188,156,0.12)';
                e.currentTarget.style.boxShadow  = 'none';
                e.currentTarget.style.background = 'rgba(10,22,44,0.6)';
              }}
            >
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(26,188,156,0.1)', border: '1px solid rgba(26,188,156,0.2)' }}
              >
                {icon}
              </div>
              <h3 className="font-koho font-bold text-white text-[1.1rem]">{title}</h3>
              <p className="font-koho text-[rgba(255,255,255,0.55)] text-[0.88rem] leading-[1.7]">{desc}</p>
              <div className="mt-auto pt-2 flex items-center gap-2 text-teal text-[0.8rem] font-koho font-semibold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Learn more <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}