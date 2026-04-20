import { useState, useEffect } from 'react';

const inputClass = [
  'w-full py-[11px] px-[14px] rounded-[10px]',
  'text-white text-[0.88rem] font-koho outline-none',
  'placeholder:text-[rgba(255,255,255,0.25)]',
  'transition-all duration-200',
  'focus:shadow-[0_0_0_3px_rgba(26,188,156,0.2)]',
].join(' ');

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
};

const labelClass = 'font-koho text-[0.72rem] tracking-[2px] uppercase text-[rgba(255,255,255,0.5)] mb-1 block';

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
    setLoading(true);
    setMsg(null);
    try {
      const res  = await fetch('/api/repairs.php', {
        method: 'POST',
        credentials: 'include',
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
    } catch {
      setMsg({ text: 'Cannot connect to server.', error: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-[16px]"
      style={{
        background: 'rgba(10,22,44,0.6)',
        border: '1px solid rgba(26,188,156,0.12)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h3 className="font-koho font-bold text-white text-[1rem] tracking-wide">
        Submit a Repair Request
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

        <div>
          <label className={labelClass}>Shop</label>
          <select
            name="shop_id"
            value={form.shop_id}
            onChange={handleChange}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Select a shop…</option>
            {shops.map(sh => (
              <option key={sh.shop_id} value={sh.shop_id}>{sh.shop_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Device Type</label>
          <input
            name="device_type"
            type="text"
            placeholder="e.g. iPhone 13, Samsung A52…"
            value={form.device_type}
            onChange={handleChange}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass}>Issue Type</label>
          <select
            name="issue"
            value={form.issue}
            onChange={handleChange}
            className={inputClass}
            style={inputStyle}
          >
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
          <label className={labelClass}>Description</label>
          <textarea
            name="issue_description"
            placeholder="Describe the problem in detail…"
            value={form.issue_description}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none`}
            style={inputStyle}
          />
        </div>

        {msg && (
          <p className="font-koho text-[0.82rem]"
            style={{ color: msg.error ? '#ff4f4f' : '#1abc9c' }}>
            {msg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-[12px] rounded-[10px] border-none font-rajdhani font-bold tracking-[3px] uppercase text-white text-[0.9rem] cursor-pointer transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(26,188,156,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(90deg, #0ea882, #1abc9c)' }}
        >
          {loading ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}