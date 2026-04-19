import { useState } from 'react';
import axios from 'axios';

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

export default function RepairForm() {
  const [form,    setForm]    = useState({ device: '', issue: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.device || !form.issue || !form.description) {
      setMsg({ text: 'All fields are required.', error: true });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await axios.post('/api/submit_repair.php', form);
      if (data.success) {
        setMsg({ text: '✓ Repair request submitted!', error: false });
        setForm({ device: '', issue: '', description: '' });
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
          <label className={labelClass}>Device</label>
          <input
            name="device"
            type="text"
            placeholder="e.g. iPhone 13, Samsung A52…"
            value={form.device}
            onChange={handleChange}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass}>Issue</label>
          <input
            name="issue"
            type="text"
            placeholder="e.g. Cracked screen, won't charge…"
            value={form.issue}
            onChange={handleChange}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            placeholder="Describe the problem in detail…"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none`}
            style={inputStyle}
          />
        </div>

        {msg && (
          <p
            className="font-koho text-[0.82rem]"
            style={{ color: msg.error ? '#ff4f4f' : '#1abc9c' }}
          >
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
