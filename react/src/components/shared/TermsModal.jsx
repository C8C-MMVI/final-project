import { useEffect, useRef } from 'react';

/**
 * TermsModal
 * Matches the existing TechnoLogs design tokens:
 *   - Primary green: #1abc9c / #0aaa86
 *   - Dark base:     #0a1c16 / rgba(13,31,26,…)
 *   - Border radius: 10px
 *   - Font sizes aligned with RegisterFields
 */
export default function TermsModal({ isOpen, onClose }) {
  const overlayRef = useRef(null);
  const dialogRef  = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Trap scroll on body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tc-title"
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        background:      'rgba(10,28,22,0.55)',
        backdropFilter:  'blur(4px)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '16px',
        animation:       'tcFadeIn 180ms ease',
      }}
    >
      <style>{`
        @keyframes tcFadeIn  { from { opacity: 0; }               to { opacity: 1; } }
        @keyframes tcSlideUp { from { transform: translateY(18px); opacity: 0; }
                                to  { transform: translateY(0);    opacity: 1; } }
        .tc-scroll::-webkit-scrollbar        { width: 5px; }
        .tc-scroll::-webkit-scrollbar-track  { background: rgba(13,31,26,0.04); border-radius: 10px; }
        .tc-scroll::-webkit-scrollbar-thumb  { background: rgba(26,188,156,0.35); border-radius: 10px; }
        .tc-scroll::-webkit-scrollbar-thumb:hover { background: #1abc9c; }
      `}</style>

      <div
        ref={dialogRef}
        style={{
          background:   '#fff',
          borderRadius: '16px',
          width:        '100%',
          maxWidth:     '620px',
          maxHeight:    '88vh',
          display:      'flex',
          flexDirection:'column',
          boxShadow:    '0 24px 60px rgba(10,28,22,0.18)',
          animation:    'tcSlideUp 220ms cubic-bezier(.22,.68,0,1.2)',
          overflow:     'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding:        '22px 28px 18px',
          borderBottom:   '1px solid rgba(13,31,26,0.08)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          flexShrink:     0,
        }}>
          <div>
            <div style={{
              fontSize:      '0.62rem',
              fontWeight:    700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color:         'rgba(13,31,26,0.4)',
              marginBottom:  '3px',
            }}>
              TechnoLogs
            </div>
            <h2 id="tc-title" style={{
              margin:     0,
              fontSize:   '1.15rem',
              fontWeight: 700,
              color:      '#0a1c16',
            }}>
              Terms &amp; Conditions
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close terms"
            style={{
              background:   'rgba(13,31,26,0.05)',
              border:       'none',
              borderRadius: '8px',
              width:        '34px',
              height:       '34px',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              color:        'rgba(13,31,26,0.5)',
              transition:   'background 150ms, color 150ms',
              flexShrink:   0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,31,26,0.05)'; e.currentTarget.style.color = 'rgba(13,31,26,0.5)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="tc-scroll"
          style={{
            overflowY:  'auto',
            padding:    '24px 28px',
            flex:       1,
            color:      '#0a1c16',
            fontSize:   '0.875rem',
            lineHeight: '1.7',
          }}
        >
          <p style={{ color: 'rgba(13,31,26,0.5)', fontSize: '0.78rem', marginTop: 0 }}>
            Last updated: {new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <p>
            Welcome to <strong>TechnoLogs</strong>. By creating an account and using our platform, you agree to be
            bound by the following Terms &amp; Conditions. Please read them carefully before proceeding.
          </p>

          <Section title="1. Acceptance of Terms">
            By registering an account, you confirm that you have read, understood, and agree to these Terms &amp;
            Conditions and our Privacy Policy. If you do not agree, you must not use TechnoLogs.
          </Section>

          <Section title="2. Eligibility">
            You must be at least <strong>18 years of age</strong> (or the age of majority in your jurisdiction) to
            use this service. By registering, you represent that you meet this requirement.
          </Section>

          <Section title="3. Account Responsibilities">
            <ul style={{ paddingLeft: '18px', margin: '8px 0' }}>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to provide accurate, current, and complete information during registration.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
              <li>One person may not maintain more than one account.</li>
            </ul>
          </Section>

          <Section title="4. Use of the Platform">
            TechnoLogs provides a repair booking and management system for electronics and devices. You agree to
            use the platform only for lawful purposes and in a manner consistent with these terms. You must not:
            <ul style={{ paddingLeft: '18px', margin: '8px 0' }}>
              <li>Submit false or fraudulent repair requests.</li>
              <li>Impersonate any person or entity.</li>
              <li>Use the platform to harass, abuse, or harm other users or staff.</li>
              <li>Attempt to gain unauthorized access to any part of the system.</li>
            </ul>
          </Section>

          <Section title="5. Repair Services">
            TechnoLogs facilitates bookings between customers and repair technicians. We do not guarantee specific
            repair outcomes or timelines. Estimates provided are subject to change based on the actual condition of
            the device upon inspection.
          </Section>

          <Section title="6. Payments & Transactions">
            All payments made through the platform are subject to our pricing policy. Refunds, if applicable, are
            processed in accordance with our Refund Policy. TechnoLogs is not responsible for payment disputes
            arising from miscommunication between the customer and the technician.
          </Section>

          <Section title="7. Privacy & Data">
            We collect personal information (name, email, phone number) solely to provide our services. Your data
            will not be sold to third parties. For full details, refer to our Privacy Policy. By registering, you
            consent to the collection and processing of your data as described therein.
          </Section>

          <Section title="8. Intellectual Property">
            All content, logos, and materials on TechnoLogs are the property of TechnoLogs and its licensors.
            You may not reproduce, distribute, or create derivative works without explicit written permission.
          </Section>

          <Section title="9. Limitation of Liability">
            TechnoLogs shall not be liable for any indirect, incidental, or consequential damages arising from your
            use of the platform, including but not limited to data loss, device damage, or service interruptions.
          </Section>

          <Section title="10. Termination">
            We reserve the right to suspend or terminate your account at any time if you violate these Terms &amp;
            Conditions, without prior notice and without liability.
          </Section>

          <Section title="11. Changes to Terms">
            TechnoLogs may update these Terms &amp; Conditions from time to time. Continued use of the platform
            after any changes constitutes your acceptance of the new terms.
          </Section>

          <Section title="12. Governing Law">
            These Terms &amp; Conditions are governed by the laws of the <strong>Republic of the Philippines</strong>.
            Any disputes shall be subject to the exclusive jurisdiction of the courts of the Philippines.
          </Section>

          <Section title="13. Contact Us">
            If you have any questions about these Terms &amp; Conditions, please contact us at{' '}
            <a href="mailto:support@technologs.ph" style={{ color: '#1abc9c', textDecoration: 'none' }}>
              support@technologs.ph
            </a>.
          </Section>
        </div>

        {/* Footer */}
        <div style={{
          padding:      '16px 28px',
          borderTop:    '1px solid rgba(13,31,26,0.08)',
          flexShrink:   0,
          textAlign:    'center',
        }}>
          <button
            onClick={onClose}
            style={{
              background:    'linear-gradient(135deg, #1abc9c, #0aaa86)',
              color:         '#fff',
              border:        'none',
              borderRadius:  '10px',
              padding:       '11px 36px',
              fontSize:      '0.85rem',
              fontWeight:    700,
              letterSpacing: '0.5px',
              cursor:        'pointer',
              transition:    'opacity 150ms, transform 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small helper so section markup stays clean */
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{
        margin:        '0 0 6px',
        fontSize:      '0.9rem',
        fontWeight:    700,
        color:         '#0a1c16',
        paddingBottom: '4px',
        borderBottom:  '1px solid rgba(13,31,26,0.07)',
      }}>
        {title}
      </h3>
      <div style={{ color: 'rgba(13,31,26,0.75)' }}>{children}</div>
    </div>
  );
}