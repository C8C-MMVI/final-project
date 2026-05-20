// src/pages/RegisterShopPage.jsx
import { useState, useEffect } from 'react';
import Panel from '../components/shared/Panel';

// ── Small reusable file input ─────────────────────────────────────────────────
function DocUpload({ label, fieldName, file, onChange, hint }) {
  const hasFile = !!file;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={LBL}>{label} <span style={{ color: '#ef4444' }}>*</span></label>
      {hint && <span style={{ fontSize: '0.70rem', color: 'rgba(13,31,26,0.4)', marginBottom: 2 }}>{hint}</span>}

      <label style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 9, cursor: 'pointer',
        border: hasFile
          ? '1.5px solid rgba(26,188,156,0.5)'
          : '1.5px dashed rgba(13,31,26,0.18)',
        background: hasFile
          ? 'rgba(26,188,156,0.05)'
          : 'rgba(13,31,26,0.02)',
        transition: 'all 0.18s',
      }}>
        {/* Icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={hasFile ? '#1abc9c' : 'rgba(13,31,26,0.35)'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {hasFile
            ? <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <polyline points="9 12 12 15 15 12"/>
                <line x1="12" y1="15" x2="12" y2="21"/></>
            : <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="12" x2="12" y2="18"/>
                <polyline points="9 15 12 12 15 15"/></>
          }
        </svg>

        <span style={{
          fontSize: '0.80rem', flex: 1,
          color: hasFile ? '#0e8f6a' : 'rgba(13,31,26,0.45)',
          fontFamily: "'DM Sans', sans-serif",
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {hasFile ? file.name : 'Click to upload (PDF, JPG, PNG — max 5 MB)'}
        </span>

        {hasFile && (
          <button type="button"
            onClick={e => { e.preventDefault(); onChange(fieldName, null); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(239,68,68,0.7)', fontSize: '1rem', lineHeight: 1,
              padding: '0 2px', flexShrink: 0,
            }}
            title="Remove file"
          >×</button>
        )}

        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={e => onChange(fieldName, e.target.files[0] ?? null)}
        />
      </label>
    </div>
  );
}

// ── Style constants ───────────────────────────────────────────────────────────
const INP = {
  width: '100%', padding: '9px 12px', borderRadius: 9,
  border: '1px solid rgba(13,31,26,0.14)',
  background: 'rgba(13,31,26,0.03)',
  color: '#0a1c16', fontSize: '0.83rem',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none', boxSizing: 'border-box',
};

const LBL = {
  display: 'block', fontSize: '0.72rem', fontWeight: 600,
  color: 'rgba(13,31,26,0.45)', marginBottom: 4,
  textTransform: 'uppercase', letterSpacing: '0.06em',
  fontFamily: "'Orbitron', sans-serif",
};

// ── Document definitions ──────────────────────────────────────────────────────
const DOCS = [
  {
    field: 'dti_permit',
    label: 'DTI Permit',
    hint: 'Department of Trade and Industry registration certificate',
  },
  {
    field: 'nc3_certificate',
    label: 'NC3 Cleaning Certificate',
    hint: 'TESDA National Certificate III for electronics servicing',
  },
  {
    field: 'bir_permit',
    label: 'BIR Permit',
    hint: 'Bureau of Internal Revenue certificate of registration',
  },
  {
    field: 'dit_permit',
    label: 'DIT Permit',
    hint: 'Department of Information Technology authorization',
  },
  {
    field: 'ntc_permit',
    label: 'NTC Permit',
    hint: 'National Telecommunications Commission service authority',
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function RegisterShopPage() {
  const [form, setForm] = useState({
    shop_name: '',
    address: '',
    contact_number: '',
    description: '',
  });

  const [docs, setDocs] = useState({
    dti_permit:      null,
    nc3_certificate: null,
    bir_permit:      null,
    dit_permit:      null,
    ntc_permit:      null,
  });

  const [existing, setExisting]   = useState(null);   // existing request from server
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState(false);
  const [toast,    setToast]      = useState(null);

  // ── Fetch existing request on mount ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/shop_requests.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) setExisting(data.my_request ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDocChange = (field, file) => {
    setDocs(d => ({ ...d, [field]: file }));
  };

  const allDocsUploaded = DOCS.every(d => !!docs[d.field]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allDocsUploaded) {
      showToast('⚠ Please upload all five required documents.', true);
      return;
    }

    setSaving(true);

    // Use FormData — required for file uploads
    const fd = new FormData();
    fd.append('shop_name',      form.shop_name.trim());
    fd.append('address',        form.address.trim());
    fd.append('contact_number', form.contact_number.trim());
    fd.append('description',    form.description.trim());

    DOCS.forEach(d => {
      fd.append(d.field, docs[d.field]);
    });

    try {
      const res  = await fetch('/api/shop_requests.php', {
        method: 'POST',
        credentials: 'include',
        // Do NOT set Content-Type — browser sets it with boundary automatically
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        showToast('✓ Shop request submitted! An admin will review your documents shortly.');
        setExisting({ status: 'pending', requested_at: new Date().toISOString() });
      } else {
        showToast('⚠ ' + data.message, true);
      }
    } catch {
      showToast('⚠ Cannot connect to server. Please try again.', true);
    } finally {
      setSaving(false);
    }
  };

  // ── Status badge ────────────────────────────────────────────────────────────
  const STATUS_COLOR = {
    pending:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  text: '#d97706' },
    approved: { bg: 'rgba(26,188,156,0.08)', border: 'rgba(26,188,156,0.3)', text: '#0e8f6a' },
    rejected: { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.25)', text: '#dc2626' },
  };

  const StatusBadge = ({ status }) => {
    const c = STATUS_COLOR[status] ?? STATUS_COLOR.pending;
    return (
      <span style={{
        display: 'inline-block', padding: '4px 12px', borderRadius: 20,
        fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.05em',
        fontFamily: "'Orbitron', sans-serif", textTransform: 'uppercase',
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      }}>
        {status}
      </span>
    );
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'rgba(13,31,26,0.4)', fontSize: '0.85rem' }}>
        Loading…
      </div>
    );
  }

  // ── Already submitted: show status card ────────────────────────────────────
  if (existing) {
    const isPending  = existing.status === 'pending';
    const isApproved = existing.status === 'approved';
    const isRejected = existing.status === 'rejected';

    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <Panel title="Shop Registration Status">
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Status row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(13,31,26,0.45)',
                fontFamily: "'Orbitron', sans-serif", fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Status:
              </span>
              <StatusBadge status={existing.status} />
            </div>

            {/* Submitted date */}
            {existing.requested_at && (
              <div style={{ fontSize: '0.80rem', color: 'rgba(13,31,26,0.45)' }}>
                Submitted:{' '}
                <span style={{ color: '#0a1c16', fontWeight: 500 }}>
                  {new Date(existing.requested_at).toLocaleDateString('en-PH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Message per status */}
            {isPending && (
              <div style={{
                padding: '14px 16px', borderRadius: 9,
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.2)',
                fontSize: '0.82rem', color: '#92400e', lineHeight: 1.55,
              }}>
                ⏳ Your shop registration is under review. An admin will evaluate your submitted documents shortly. You will receive a notification once a decision has been made.
              </div>
            )}

            {isApproved && (
              <div style={{
                padding: '14px 16px', borderRadius: 9,
                background: 'rgba(26,188,156,0.06)',
                border: '1px solid rgba(26,188,156,0.2)',
                fontSize: '0.82rem', color: '#065f46', lineHeight: 1.55,
              }}>
                🎉 Your shop has been <strong>approved</strong>! Please <strong>log out and log back in</strong> to access your Shop Owner dashboard.
              </div>
            )}

            {isRejected && (
              <div style={{
                padding: '14px 16px', borderRadius: 9,
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.2)',
                fontSize: '0.82rem', color: '#991b1b', lineHeight: 1.55,
              }}>
                ❌ Your request was <strong>not approved</strong>. Please contact support for more information or submit a new request with updated documents.
              </div>
            )}

            {/* Allow re-submission if rejected */}
            {isRejected && (
              <button
                onClick={() => setExisting(null)}
                style={{
                  padding: '10px 20px', borderRadius: 9, border: 'none',
                  background: '#1abc9c', color: '#fff',
                  fontFamily: "'Orbitron', sans-serif", fontWeight: 700,
                  fontSize: '0.84rem', cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(26,188,156,0.25)',
                  alignSelf: 'flex-start',
                }}
              >
                Submit New Request
              </button>
            )}
          </div>
        </Panel>
      </div>
    );
  }

  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '1.5rem 1rem' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          marginBottom: '1rem', padding: '12px 18px', borderRadius: 9,
          background: toast.isError ? 'rgba(239,68,68,0.07)' : 'rgba(26,188,156,0.08)',
          border: `1px solid ${toast.isError ? 'rgba(239,68,68,0.2)' : 'rgba(26,188,156,0.2)'}`,
          color: toast.isError ? '#ef4444' : '#0e8f6a',
          fontSize: '0.82rem', fontWeight: 500,
        }}>
          {toast.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Shop Details ── */}
        <Panel title="Shop Details">
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={LBL}>Shop Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={INP} type="text" placeholder="e.g. Juan's Phone Repair"
                value={form.shop_name}
                onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))}
                required />
            </div>

            <div>
              <label style={LBL}>Complete Address <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={INP} type="text" placeholder="Street, Barangay, City, Province"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                required />
            </div>

            <div>
              <label style={LBL}>Contact Number <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={INP} type="tel" placeholder="09XXXXXXXXX"
                value={form.contact_number}
                maxLength={11}
                onChange={e => setForm(f => ({ ...f, contact_number: e.target.value.replace(/\D/g, '') }))}
                required />
            </div>

            <div>
              <label style={LBL}>Description <span style={{ color: 'rgba(13,31,26,0.35)', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
              <textarea style={{ ...INP, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }}
                placeholder="Briefly describe your shop's services…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
        </Panel>

        {/* ── Required Documents ── */}
        <Panel title="Required Government Documents">
          <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Progress indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8,
              background: allDocsUploaded
                ? 'rgba(26,188,156,0.06)'
                : 'rgba(13,31,26,0.03)',
              border: `1px solid ${allDocsUploaded ? 'rgba(26,188,156,0.2)' : 'rgba(13,31,26,0.08)'}`,
            }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(13,31,26,0.45)',
                fontFamily: "'DM Sans', sans-serif" }}>
                Documents uploaded:
              </span>
              <span style={{
                fontSize: '0.82rem', fontWeight: 700,
                color: allDocsUploaded ? '#0e8f6a' : '#d97706',
                fontFamily: "'Orbitron', sans-serif",
              }}>
                {Object.values(docs).filter(Boolean).length} / {DOCS.length}
              </span>
              {allDocsUploaded && (
                <span style={{ fontSize: '0.78rem', color: '#0e8f6a' }}>✓ All documents ready</span>
              )}
            </div>

            {DOCS.map(d => (
              <DocUpload
                key={d.field}
                label={d.label}
                fieldName={d.field}
                file={docs[d.field]}
                onChange={handleDocChange}
                hint={d.hint}
              />
            ))}
          </div>
        </Panel>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '13px', borderRadius: 9, border: 'none',
            background: saving ? 'rgba(26,188,156,0.5)' : '#1abc9c',
            color: '#fff', fontFamily: "'Orbitron', sans-serif",
            fontWeight: 700, fontSize: '0.9rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(26,188,156,0.3)',
          }}
        >
          {saving ? 'Submitting…' : '📋 Submit Shop Registration'}
        </button>

        <p style={{
          fontSize: '0.74rem', color: 'rgba(13,31,26,0.38)',
          textAlign: 'center', lineHeight: 1.6, margin: 0,
        }}>
          Your documents will be reviewed by an admin. You will receive a notification once approved. All uploaded files are kept confidential.
        </p>
      </form>
    </div>
  );
}