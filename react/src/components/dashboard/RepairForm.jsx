import { useState, useEffect } from 'react';

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: 9,
  background: 'rgba(13,31,26,0.03)',
  border: '1px solid rgba(13,31,26,0.14)',
  color: '#0a1c16', fontSize: '0.88rem',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '0.68rem', fontWeight: 700,
  letterSpacing: '2px', textTransform: 'uppercase',
  color: 'rgba(13,31,26,0.45)', marginBottom: 6,
};

export default function RepairForm({ onSuccess }) {
  const [form,    setForm]    = useState({ shop_id: '', device_type: '', issue: '', issue_description: '' });
  const [shops,   setShops]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  useEffect(() => {
    fetch('/api/shops.php', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setShops(d.shops ?? []); })
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.shop_id || !form.device_type.trim() || !form.issue) {
      setMsg({ text: 'Please select a shop, device type, and issue.', error: true });
      return;
    }
    setLoading(true); setMsg(null);
    try {
      const res  = await fetch('/api/repairs.php', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_id:           Number(form.shop_id),
          device_type:       form.device_type,
          issue_description: form.issue + (form.issue_description ? ' – ' + form.issue_description : ''),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: '✓ Repair request submitted!', error: false });
        setForm({ shop_id: '', device_type: '', issue: '', issue_description: '' });
        onSuccess?.();
      } else {
        setMsg({ text: data.message || 'Submission failed.', error: true });
      }
    } catch { setMsg({ text: 'Cannot connect to server.', error: true }); }
    finally  { setLoading(false); }
  }

  const focusStyle = (e) => {
    e.target.style.borderColor = '#1abc9c';
    e.target.style.boxShadow = '0 0 0 3px rgba(26,188,156,0.1)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = 'rgba(13,31,26,0.14)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      padding: 20,
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>

        <div>
          <label style={labelStyle}>Shop</label>
          <select name="shop_id" value={form.shop_id} onChange={handleChange}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={focusStyle} onBlur={blurStyle}>
            <option value="">Select a shop…</option>
            {shops.map(sh => <option key={sh.shop_id} value={sh.shop_id}>{sh.shop_name}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Device Type</label>
          <input name="device_type" type="text"
            placeholder="e.g. iPhone 13, Samsung A52…"
            value={form.device_type} onChange={handleChange}
            style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </div>

        <div>
          <label style={labelStyle}>Issue Type</label>
          <select name="issue" value={form.issue} onChange={handleChange}
            style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={focusStyle} onBlur={blurStyle}>
            <option value="">Select an issue…</option>
            <option>Screen Damage</option>
            <option>Battery Issue</option>
            <option>Charging Port</option>
            <option>Water Damage</option>
            <option>Camera Problem</option>
            <option>Speaker / Mic Issue</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea name="issue_description"
            placeholder="Describe the problem in detail…"
            value={form.issue_description} onChange={handleChange}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            onFocus={focusStyle} onBlur={blurStyle} />
        </div>

        {msg && (
          <p style={{
            fontSize: '0.82rem', fontWeight: 500,
            color: msg.error ? '#ef4444' : '#0e8f6a',
            padding: '9px 12px', borderRadius: 8,
            background: msg.error ? 'rgba(239,68,68,0.07)' : 'rgba(26,188,156,0.07)',
            border: `1px solid ${msg.error ? 'rgba(239,68,68,0.2)' : 'rgba(26,188,156,0.2)'}`,
          }}>
            {msg.text}
          </p>
        )}

        <button type="submit" disabled={loading} style={{
          padding: '11px', borderRadius: 9, border: 'none',
          background: loading ? 'rgba(26,188,156,0.5)' : '#1abc9c',
          color: '#fff', fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700, fontSize: '0.88rem',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: loading ? 'none' : '0 3px 12px rgba(26,188,156,0.28)',
        }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#0aaa86'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
          onMouseLeave={e => { e.currentTarget.style.background = loading ? 'rgba(26,188,156,0.5)' : '#1abc9c'; e.currentTarget.style.transform = 'none'; }}
        >
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}