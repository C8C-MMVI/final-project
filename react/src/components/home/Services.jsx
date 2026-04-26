import { useState } from 'react';

const SERVICES = [
  { icon: '🔧', title: 'Screen Replacement',  desc: 'Cracked or unresponsive screens replaced with premium quality parts. Same-day service available.' },
  { icon: '🔋', title: 'Battery Replacement', desc: 'Restore your device to full capacity with genuine battery replacements for all major brands.' },
  { icon: '💧', title: 'Water Damage Repair', desc: 'Professional cleaning and component-level repair for liquid-damaged devices.' },
  { icon: '📡', title: 'Signal & Network Fix', desc: 'Antenna repairs, SIM tray replacements, and network IC fixes to restore full connectivity.' },
  { icon: '⚙️', title: 'Software & Unlocking', desc: 'OS reinstallation, factory resets, and carrier unlocking services for all devices.' },
  { icon: '🛡️', title: 'Accessories & Parts',  desc: 'Wide selection of cases, chargers, cables, and OEM spare parts available in-store.' },
];

function ServiceCard({ icon, title, desc, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 14,
        padding: 24, borderRadius: 14, cursor: 'default',
        background: hovered ? 'rgba(26,188,156,0.05)' : 'rgba(255,255,255,0.03)',
        border: hovered ? '1px solid rgba(26,188,156,0.32)' : '1px solid rgba(26,188,156,0.1)',
        boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.28)' : 'none',
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.3s',
        animation: `fadeUp 0.45s ease ${delay}s both`,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
        background: 'rgba(26,188,156,0.1)', border: '1px solid rgba(26,188,156,0.2)',
      }}>
        {icon}
      </div>
      <h3 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700,
        fontSize: '1rem', color: '#fff', margin: 0,
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
        fontSize: '0.855rem', lineHeight: 1.72, color: 'rgba(255,255,255,0.5)', margin: 0,
      }}>
        {desc}
      </p>
      <div style={{
        fontFamily: "'Syne', sans-serif", marginTop: 'auto', paddingTop: 4,
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#1abc9c', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.2s',
      }}>
        Learn more <span>→</span>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" style={{ position: 'relative', width: '100%', padding: '0 0 80px' }}>

      {/* Top divider */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 1, height: 56, background: 'linear-gradient(to bottom, transparent, rgba(26,188,156,0.25))' }} />
        <div style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: 'rgba(26,188,156,0.35)' }} />
      </div>

      {/* Section container — flexDirection column + alignItems center ensures header is centered */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '56px 40px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', marginBottom: 52, width: '100%',
        }}>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontSize: '0.7rem', fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1abc9c', marginBottom: 12,
          }}>
            What We Offer
          </span>
          <h2 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', lineHeight: 1.08,
            letterSpacing: '-0.02em', color: '#fff', marginBottom: 16, marginTop: 0,
          }}>
            Expert Repair{' '}
            <span style={{
              background: 'linear-gradient(95deg, #1abc9c, #0fd4a0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Services
            </span>
          </h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
            fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.48)',
            maxWidth: 480, margin: 0,
          }}>
            From screen replacements to complex motherboard repairs — we handle it all with precision and care.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16, width: '100%',
        }}>
          {SERVICES.map(({ icon, title, desc }, i) => (
            <ServiceCard key={title} icon={icon} title={title} desc={desc} delay={0.07 * i} />
          ))}
        </div>
      </div>
    </section>
  );
}