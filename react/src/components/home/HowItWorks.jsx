const STEPS = [
    { num: '1', title: 'Drop Off',  desc: 'Bring your device to a registered TechnoLogs shop near you.' },
    { num: '2', title: 'Diagnosis', desc: 'A certified technician examines the device and logs the issue.' },
    { num: '3', title: 'Repair',    desc: 'We fix it with quality parts. Track every status change live.' },
    { num: '4', title: 'Pick Up',   desc: 'Get notified when ready. Pay and collect your repaired device.' },
  ];
  
  export default function HowItWorks() {
    return (
      <section id="how-it-works" style={{ position: 'relative', width: '100%', padding: '0 0 80px' }}>
  
        {/* Top divider */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 1, height: 56, background: 'linear-gradient(to bottom, transparent, rgba(26,188,156,0.25))' }} />
          <div style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: 'rgba(26,188,156,0.35)' }} />
        </div>
  
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '56px 40px 0',
          display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%',
        }}>
  
          {/* Header */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', marginBottom: 56, width: '100%',
          }}>
            <span style={{
              fontFamily: "'Syne', sans-serif", fontSize: '0.7rem', fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1abc9c', marginBottom: 12,
            }}>
              Simple Process
            </span>
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', lineHeight: 1.08,
              letterSpacing: '-0.02em', color: '#fff', marginBottom: 16, marginTop: 0,
            }}>
              How It{' '}
              <span style={{
                background: 'linear-gradient(95deg, #1abc9c, #0fd4a0)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Works
              </span>
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
              fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.48)',
              maxWidth: 400, margin: 0,
            }}>
              Get your device repaired in four straightforward steps.
            </p>
          </div>
  
          {/* Steps — wrapper is relative so the absolute connector line sits behind the circles */}
          <div style={{ position: 'relative', width: '100%' }}>
  
            {/* Connector line: sits at the vertical center of the circles (28px = half of 56px circle) */}
            <div style={{
              position: 'absolute',
              top: 27,
              left: 'calc(100% / 8)',       /* starts at center of first circle */
              right: 'calc(100% / 8)',      /* ends at center of last circle */
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(26,188,156,0.35) 15%, rgba(26,188,156,0.35) 85%, transparent)',
              pointerEvents: 'none',
              zIndex: 0,
            }} />
  
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0, width: '100%',
            }}>
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', padding: '0 16px', position: 'relative', zIndex: 1,
                }}>
                  {/* Circle */}
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    border: '1px solid rgba(26,188,156,0.3)',
                    background: 'rgba(7,17,31,0.9)',
                    boxShadow: '0 0 0 4px rgba(7,17,31,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Syne', sans-serif", fontWeight: 800,
                    fontSize: '1.1rem', color: '#1abc9c',
                    marginBottom: 20,
                  }}>
                    {num}
                  </div>
                  <h3 style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: '0.95rem', color: '#fff', marginBottom: 8, marginTop: 0,
                  }}>
                    {title}
                  </h3>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
                    fontSize: '0.83rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', margin: 0,
                  }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }