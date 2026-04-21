// src/pages/OwnerDashboard.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import StatCard from '../components/dashboard/StatCard';
import Panel    from '../components/shared/Panel';
import Badge    from '../components/shared/Badge';
import { createSale, getSalesByShop } from '../lib/api';
import { useReceiptDownload } from '../hooks/useReceiptDownload';
import styles   from './OwnerDashboard.module.css';

const repairBadge = {
  'In Progress': 'progress',
  'Pending':     'pending',
  'Completed':   'done',
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function enrichSale(sale, repairs, shopName) {
  const repair = repairs.find(r => r.request_id === sale.requestId);
  return {
    ...sale,
    shopName:       shopName ?? null,
    customerName:   repair?.customer_name   ?? null,
    deviceType:     repair?.device_type     ?? null,
    technicianName: repair?.technician_name ?? null,
  };
}

// ── Download Button ───────────────────────────────────────────────────────────
function DownloadButton({ onClick, disabled, label = 'Download' }) {
  const [busy, setBusy] = useState(false);
  const handleClick = async () => {
    setBusy(true);
    try { await onClick(); }
    finally { setTimeout(() => setBusy(false), 800); }
  };
  return (
    <button onClick={handleClick} disabled={disabled || busy} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: disabled ? 'rgba(26,188,156,0.06)' : 'rgba(26,188,156,0.12)',
      border: '1px solid rgba(26,188,156,0.3)',
      color: disabled ? 'rgba(128,144,168,0.5)' : 'var(--teal, #1abc9c)',
      fontSize: '0.76rem', fontWeight: 700, padding: '7px 14px', borderRadius: 8,
      cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.18s ease',
      whiteSpace: 'nowrap', letterSpacing: '0.03em', opacity: disabled ? 0.55 : 1,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(26,188,156,0.22)'; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'rgba(26,188,156,0.12)'; }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
      {busy ? 'Generating…' : label}
    </button>
  );
}

// ── Assign Technician Dropdown ────────────────────────────────────────────────
function AssignCell({ repair, technicians, onAssigned }) {
  const [selected, setSelected] = useState(repair.technician_id ?? '');
  const [saving,   setSaving]   = useState(false);
  const handleAssign = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res  = await fetch('/api/repairs.php', {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: repair.request_id, technician_id: Number(selected) }),
      });
      const data = await res.json();
      if (data.success) onAssigned?.();
    } catch {}
    finally { setSaving(false); }
  };
  if (repair.status === 'Completed') {
    return <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{repair.technician_name ?? '—'}</span>;
  }
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <select value={selected} onChange={e => setSelected(e.target.value)} style={{
        background: 'var(--navy-mid, #0d1f38)', border: '1px solid var(--navy-border, rgba(26,188,156,0.14))',
        color: 'var(--white, #fff)', fontSize: '0.76rem', padding: '4px 8px',
        borderRadius: 7, outline: 'none', cursor: 'pointer', minWidth: 130,
      }}>
        <option value="">— Assign —</option>
        {technicians.map(t => <option key={t.user_id} value={t.user_id}>{t.username}</option>)}
      </select>
      <button onClick={handleAssign}
        disabled={saving || !selected || Number(selected) === Number(repair.technician_id)}
        style={{
          background: 'var(--teal, #1abc9c)', color: '#0a1628', border: 'none',
          fontSize: '0.73rem', fontWeight: 700, padding: '4px 11px', borderRadius: 7,
          cursor: 'pointer', opacity: saving ? 0.55 : 1, whiteSpace: 'nowrap', transition: 'opacity 0.2s',
        }}>
        {saving ? '…' : 'Save'}
      </button>
    </div>
  );
}

// ── Create Sale Modal ─────────────────────────────────────────────────────────
function CreateSaleModal({ repair, onClose, onCreated }) {
  const emptyItem = () => ({ description: '', quantity: 1, unitPrice: '' });
  const [items,  setItems]  = useState([emptyItem()]);
  const [method, setMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);
  const addItem    = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  const total = items.reduce((sum, it) => sum + (Number(it.quantity)||0)*(Number(it.unitPrice)||0), 0);
  const handleSubmit = async () => {
    setError(null);
    for (const it of items) {
      if (!it.description.trim() || !it.quantity || !it.unitPrice) { setError('Please fill in all item fields.'); return; }
    }
    setSaving(true);
    try {
      const body = {
        requestId: repair.request_id, shopId: repair.shop_id,
        customerId: repair.customer_id, staffId: repair.technician_id,
        paymentMethod: method,
        items: items.map(it => ({ description: it.description.trim(), quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) })),
      };
      const res  = await createSale(body);
      const data = await res.json();
      if (res.ok) { onCreated?.(); onClose(); }
      else { setError(data.error ?? 'Failed to create sale.'); }
    } catch { setError('Cannot connect to sales server.'); }
    finally { setSaving(false); }
  };
  const overlay  = { position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999 };
  const modal    = { background:'var(--navy-mid,#0d1f38)',border:'1px solid rgba(26,188,156,0.18)',borderRadius:14,padding:'28px 32px',width:'100%',maxWidth:580,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.5)' };
  const lbl      = { display:'block',color:'var(--muted,#8090a8)',fontSize:'0.72rem',marginBottom:4,textTransform:'uppercase',letterSpacing:'0.06em' };
  const inp      = { width:'100%',background:'var(--navy-dark,#0a1628)',border:'1px solid rgba(26,188,156,0.15)',color:'#fff',padding:'7px 11px',borderRadius:7,fontSize:'0.82rem',outline:'none',boxSizing:'border-box' };
  const btnTeal  = { background:'var(--teal,#1abc9c)',color:'#0a1628',border:'none',fontWeight:700,padding:'8px 18px',borderRadius:8,cursor:'pointer',fontSize:'0.82rem' };
  const btnGhost = { background:'transparent',color:'var(--muted)',border:'1px solid rgba(255,255,255,0.12)',padding:'8px 18px',borderRadius:8,cursor:'pointer',fontSize:'0.82rem' };
  return (
    <div style={overlay} onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={modal}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
          <div>
            <div style={{ color:'#fff',fontWeight:700,fontSize:'1rem',fontFamily:'Rajdhani,sans-serif' }}>Create Sale — Repair #{repair.request_id}</div>
            <div style={{ color:'var(--muted)',fontSize:'0.78rem',marginTop:2 }}>{repair.device_type} · {repair.customer_name}</div>
          </div>
          <button onClick={onClose} style={{ ...btnGhost,padding:'4px 10px' }}>✕</button>
        </div>
        {error && <div style={{ background:'rgba(239,68,68,0.12)',border:'1px solid #ef4444',color:'#ef4444',padding:'8px 12px',borderRadius:7,marginBottom:14,fontSize:'0.8rem' }}>{error}</div>}
        <div style={{ marginBottom:16 }}>
          <label style={lbl}>Payment Method</label>
          <select value={method} onChange={e=>setMethod(e.target.value)} style={inp}>
            <option>Cash</option><option>GCash</option><option>Maya</option><option>Bank Transfer</option><option>Card</option>
          </select>
        </div>
        <div style={{ marginBottom:8 }}>
          <label style={lbl}>Line Items</label>
          {items.map((it,i) => (
            <div key={i} style={{ display:'grid',gridTemplateColumns:'1fr 70px 100px 32px',gap:8,marginBottom:8,alignItems:'center' }}>
              <input style={inp} placeholder="Description" value={it.description} onChange={e=>updateItem(i,'description',e.target.value)} />
              <input style={inp} type="number" min="1" placeholder="Qty" value={it.quantity} onChange={e=>updateItem(i,'quantity',e.target.value)} />
              <input style={inp} type="number" min="0" step="0.01" placeholder="Unit Price" value={it.unitPrice} onChange={e=>updateItem(i,'unitPrice',e.target.value)} />
              <button onClick={()=>removeItem(i)} disabled={items.length===1} style={{ ...btnGhost,padding:'6px 8px',opacity:items.length===1?0.3:1 }}>✕</button>
            </div>
          ))}
          <button onClick={addItem} style={{ ...btnGhost,marginTop:4,fontSize:'0.78rem' }}>+ Add Item</button>
        </div>
        <div style={{ textAlign:'right',color:'var(--teal)',fontWeight:700,fontSize:'1.1rem',fontFamily:'Rajdhani,sans-serif',margin:'16px 0' }}>
          Total: ₱{total.toLocaleString('en-PH',{minimumFractionDigits:2})}
        </div>
        <div style={{ display:'flex',gap:10,justifyContent:'flex-end' }}>
          <button style={btnGhost} onClick={onClose} disabled={saving}>Cancel</button>
          <button style={{ ...btnTeal,opacity:saving?0.6:1 }} onClick={handleSubmit} disabled={saving}>{saving?'Saving…':'Confirm Sale'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Revenue Bar Chart ─────────────────────────────────────────────────────────
function RevenueBarChart({ transactions }) {
  const monthlyData = useMemo(() => {
    const now   = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { label: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), total: 0 };
    });
    transactions.forEach(t => {
      if (!t.soldAt) return;
      const d = new Date(t.soldAt);
      const bucket = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (bucket) bucket.total += Number(t.amount) || 0;
    });
    return months;
  }, [transactions]);

  const maxVal = Math.max(...monthlyData.map(m => m.total), 1);
  const W = 340, H = 140, padL = 48, padB = 28, padT = 12, barW = 32;
  const chartW = W - padL - 12;
  const slotW  = chartW / monthlyData.length;
  const fmt = (v) => v >= 1000 ? `₱${(v/1000).toFixed(1)}k` : `₱${v}`;

  return (
    <div style={{ padding: '16px 8px 8px' }}>
      {transactions.length === 0 ? <NoDataMsg label="No sales data yet" /> : (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
          {Array.from({ length: 5 }, (_, i) => {
            const val = (maxVal / 4) * i;
            const y   = padT + (H - padT - padB) * (1 - i / 4);
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={W-8} y2={y} stroke="rgba(26,188,156,0.08)" strokeWidth="1" strokeDasharray="3 3"/>
                <text x={padL-6} y={y+4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter,sans-serif">{fmt(val)}</text>
              </g>
            );
          })}
          {monthlyData.map((m, i) => {
            const barH  = m.total === 0 ? 2 : Math.max(4, ((m.total / maxVal) * (H - padT - padB)));
            const x     = padL + i * slotW + (slotW - barW) / 2;
            const y     = H - padB - barH;
            const isMax = m.total === maxVal && m.total > 0;
            return (
              <g key={i}>
                <rect x={x} y={padT} width={barW} height={H-padT-padB} rx="4" fill="rgba(26,188,156,0.04)"/>
                <rect x={x} y={y} width={barW} height={barH} rx="4" fill={isMax ? 'url(#barGradientPeak)' : 'url(#barGradient)'}/>
                {m.total > 0 && <text x={x+barW/2} y={y-5} textAnchor="middle" fill="rgba(26,188,156,0.85)" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="600">{fmt(m.total)}</text>}
                <text x={x+barW/2} y={H-padB+14} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Inter,sans-serif">{m.label}</text>
              </g>
            );
          })}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1abc9c" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#0e8a6e" stopOpacity="0.6"/>
            </linearGradient>
            <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2eeed8" stopOpacity="1"/>
              <stop offset="100%" stopColor="#1abc9c" stopOpacity="0.8"/>
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
}

// ── Repairs Status Donut ──────────────────────────────────────────────────────
function RepairStatusDonut({ repairs }) {
  const segments = useMemo(() => {
    const counts = { Pending: repairs.filter(r=>r.status==='Pending').length, 'In Progress': repairs.filter(r=>r.status==='In Progress').length, Completed: repairs.filter(r=>r.status==='Completed').length };
    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    const colors = { Pending:'#fb923c','In Progress':'#facc15',Completed:'#1abc9c' };
    let cumulative = 0;
    return Object.entries(counts).map(([label,count])=>{
      const pct=total===0?0:count/total; const start=cumulative; cumulative+=pct;
      return { label,count,pct,start,color:colors[label] };
    }).filter(s=>s.count>0);
  }, [repairs]);

  const total = segments.reduce((a,s)=>a+s.count,0);
  const cx=70,cy=70,r=52,inner=34,strokeW=r-inner;
  const describeArc=(startPct,endPct)=>{
    if(endPct-startPct>=1)endPct=0.9999;
    const start=startPct*2*Math.PI-Math.PI/2, end=endPct*2*Math.PI-Math.PI/2;
    const midR=(r+inner)/2;
    return `M ${cx+midR*Math.cos(start)} ${cy+midR*Math.sin(start)} A ${midR} ${midR} 0 ${(endPct-startPct)>0.5?1:0} 1 ${cx+midR*Math.cos(end)} ${cy+midR*Math.sin(end)}`;
  };

  return (
    <div style={{ padding:'12px 8px 8px' }}>
      {total===0?<NoDataMsg label="No repair data yet"/>:(
        <div style={{ display:'flex',alignItems:'center',gap:20 }}>
          <svg viewBox="0 0 140 140" style={{ width:140,flexShrink:0 }}>
            <circle cx={cx} cy={cy} r={(r+inner)/2} fill="none" stroke="rgba(26,188,156,0.07)" strokeWidth={strokeW}/>
            {segments.map((s,i)=><path key={i} d={describeArc(s.start,s.start+s.pct)} fill="none" stroke={s.color} strokeWidth={strokeW-2} strokeLinecap="butt" opacity="0.9"/>)}
            <text x={cx} y={cy-6} textAnchor="middle" fill="#fff" fontSize="20" fontFamily="Rajdhani,sans-serif" fontWeight="700">{total}</text>
            <text x={cx} y={cy+10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter,sans-serif">TOTAL</text>
          </svg>
          <div style={{ display:'flex',flexDirection:'column',gap:10,flex:1 }}>
            {segments.map((s,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',gap:8 }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:s.color,flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.75rem',color:'rgba(255,255,255,0.7)',fontWeight:500 }}>{s.label}</div>
                  <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:2 }}>
                    <div style={{ flex:1,height:3,borderRadius:99,background:'rgba(255,255,255,0.06)' }}>
                      <div style={{ width:`${s.pct*100}%`,height:'100%',borderRadius:99,background:s.color }}/>
                    </div>
                    <span style={{ fontSize:'0.7rem',color:s.color,fontWeight:700,minWidth:24 }}>{s.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payment Method Breakdown ──────────────────────────────────────────────────
function PaymentMethodChart({ transactions }) {
  const data = useMemo(() => {
    const counts = {};
    transactions.forEach(t => { const m=t.paymentMethod||'Unknown'; counts[m]=(counts[m]||0)+Number(t.amount||0); });
    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    const colors = ['#1abc9c','#3b82f6','#a855f7','#f59e0b','#ef4444'];
    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([label,value],i)=>({ label,value,pct:total?value/total:0,color:colors[i%colors.length] }));
  }, [transactions]);

  if (data.length===0) return <NoDataMsg label="No payment data yet"/>;
  return (
    <div style={{ padding:'12px 16px 8px',display:'flex',flexDirection:'column',gap:10 }}>
      {data.map((d,i)=>(
        <div key={i}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:4 }}>
            <span style={{ fontSize:'0.76rem',color:'rgba(255,255,255,0.7)' }}>{d.label}</span>
            <span style={{ fontSize:'0.76rem',color:d.color,fontWeight:700 }}>₱{Number(d.value).toLocaleString('en-PH',{minimumFractionDigits:2})}</span>
          </div>
          <div style={{ height:6,borderRadius:99,background:'rgba(255,255,255,0.06)' }}>
            <div style={{ width:`${d.pct*100}%`,height:'100%',borderRadius:99,background:d.color,transition:'width 0.6s ease' }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Report KPIs ───────────────────────────────────────────────────────────────
function ReportKPIs({ transactions, repairs }) {
  const totalRevenue   = transactions.reduce((s,t)=>s+Number(t.amount||0),0);
  const avgSale        = transactions.length ? totalRevenue/transactions.length : 0;
  const completionRate = repairs.length ? ((repairs.filter(r=>r.status==='Completed').length/repairs.length)*100).toFixed(0) : 0;
  const kpis = [
    { label:'Total Revenue',   value:`₱${totalRevenue.toLocaleString('en-PH',{minimumFractionDigits:2})}`, color:'#1abc9c' },
    { label:'Avg. Sale Value', value:`₱${avgSale.toLocaleString('en-PH',{minimumFractionDigits:2})}`,      color:'#3b82f6' },
    { label:'Completion Rate', value:`${completionRate}%`,                                                   color:'#facc15' },
    { label:'Total Sales',     value:transactions.length,                                                     color:'#a855f7' },
  ];
  return (
    <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20 }}>
      {kpis.map((k,i)=>(
        <div key={i} style={{ background:'var(--navy-mid,#0d1f38)',border:`1px solid ${k.color}22`,borderRadius:10,padding:'14px 18px' }}>
          <div style={{ color:k.color,fontSize:'1.25rem',fontWeight:700,fontFamily:'Rajdhani,sans-serif' }}>{k.value}</div>
          <div style={{ color:'var(--muted)',fontSize:'0.7rem',marginTop:3 }}>{k.label}</div>
        </div>
      ))}
    </div>
  );
}

function NoDataMsg({ label }) {
  return <div style={{ padding:'36px 20px',textAlign:'center',color:'var(--muted)',fontSize:'0.8rem',opacity:0.6 }}>{label}</div>;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function OwnerDashboard({ setPage, activeSection = 'dashboard', setActiveSection }) {
  const [repairs,      setRepairs]      = useState([]);
  const [technicians,  setTechnicians]  = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers,    setCustomers]    = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [custLoading,  setCustLoading]  = useState(false);
  const [error,        setError]        = useState(null);
  const [toast,        setToast]        = useState(null);
  const [saleRepair,   setSaleRepair]   = useState(null);
  const [shopId,       setShopId]       = useState(null);

  const shopInfo = {
    name:    stats?.shop_name    ?? 'TechnoLogs Repair',
    address: stats?.shop_address ?? '',
    phone:   stats?.shop_phone   ?? '',
  };

  const { downloadReceipt, downloadAllReceipts } = useReceiptDownload(shopInfo);
  const showToast = (msg, isError=false) => { setToast({msg,isError}); setTimeout(()=>setToast(null),3000); };

  const fetchRepairs = useCallback(async () => {
    try { const res=await fetch('/api/repairs.php',{credentials:'include'}); const data=await res.json(); if(data.success)setRepairs(data.repairs??[]); } catch {}
  }, []);
  const fetchTechnicians = useCallback(async () => {
    try { const res=await fetch('/api/technicians.php',{credentials:'include'}); const data=await res.json(); if(data.success)setTechnicians(data.technicians??[]); } catch {}
  }, []);
  const fetchDashboard = useCallback(async () => {
    try { const res=await fetch('/api/dashboard.php',{credentials:'include'}); const data=await res.json(); if(data.success){setStats(data.stats);if(data.stats?.shop_id)setShopId(data.stats.shop_id);} } catch {}
  }, []);
  const fetchSales = useCallback(async (sid) => {
    if(!sid)return;
    try { const res=await getSalesByShop(sid); if(res.ok){const data=await res.json();setTransactions(data??[]);} } catch {}
  }, []);

  // ── Fetch shop customers (owner-scoped) ───────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setCustLoading(true);
    try {
      const res  = await fetch('/api/users.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCustomers(data.users ?? []);
    } catch {}
    finally { setCustLoading(false); }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true); setError(null);
    try { await Promise.all([fetchRepairs(),fetchTechnicians(),fetchDashboard()]); }
    catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  }, [fetchRepairs,fetchTechnicians,fetchDashboard]);

  useEffect(()=>{loadAll();},[loadAll]);
  useEffect(()=>{if(shopId)fetchSales(shopId);},[shopId,fetchSales]);

  // Load customers when that section is first visited
  useEffect(()=>{
    if(activeSection==='customers' && customers.length===0) fetchCustomers();
  },[activeSection]);

  const handleAssigned    = () => { showToast('Technician assigned successfully.'); fetchRepairs(); };
  const handleSaleCreated = () => { showToast('Sale created successfully!'); if(shopId)fetchSales(shopId); };
  const handleTab         = (k) => { if(setActiveSection)setActiveSection(k); };
  const getSaleForReceipt = (sale) => enrichSale(sale, repairs, shopInfo.name);

  const statCards = stats ? [
    { label:'Active Repairs',  value:stats.active_repairs,  icon_class:'orange' },
    { label:'Completed Today', value:stats.completed_today, icon_class:'teal'   },
    { label:'Total Customers', value:stats.total_customers, icon_class:'blue'   },
    { label:"Today's Revenue", value:`₱${Number(stats.today_revenue??0).toLocaleString('en-PH')}`, icon_class:'purple' },
  ] : [];

  const tabs = [
    { id:'dashboard',  label:'Dashboard'            },
    { id:'repairs',    label:'Repairs / Job Orders' },
    { id:'customers',  label:'Customers'            },
    { id:'members',    label:'Member Management'    },
    { id:'reports',    label:'Reports / Analytics'  },
  ];

  return (
    <div className={styles.root}>
      {toast && (
        <div style={{ position:'fixed',bottom:28,right:28,zIndex:9998,background:'var(--navy-mid,#0d1f38)',
          border:`1px solid ${toast.isError?'#ef4444':'var(--teal,#1abc9c)'}`,
          color:toast.isError?'#ef4444':'var(--white,#fff)',
          padding:'12px 20px',borderRadius:10,fontSize:'0.82rem',boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
          {toast.msg}
        </div>
      )}
      {saleRepair && <CreateSaleModal repair={saleRepair} onClose={()=>setSaleRepair(null)} onCreated={handleSaleCreated}/>}

      <nav className={styles.subNav}>
        {tabs.map(tab=>(
          <button key={tab.id} className={`${styles.subNavBtn} ${activeSection===tab.id?styles.subNavBtnActive:''}`} onClick={()=>handleTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>

      <main className={styles.content}>

        {/* ── DASHBOARD ── */}
        {activeSection==='dashboard' && (
          <>
            {loading?<div className={styles.loadingText}>Loading dashboard…</div>
              :error?<div className={styles.errorText}>{error}</div>
              :<div className={styles.cardsGrid}>{statCards.map((s,i)=><StatCard key={i} {...s}/>)}</div>}
            <Panel title="Recent Repair Jobs" linkLabel="View all" onLink={()=>handleTab('repairs')}>
              {loading?<Loader/>:repairs.length===0?<Empty msg="No repairs found."/>:(
                <table className={styles.table}>
                  <thead><tr><th>Job #</th><th>Customer</th><th>Device</th><th>Issue</th><th>Technician</th><th>Status</th></tr></thead>
                  <tbody>
                    {repairs.slice(0,5).map((r,i)=>(
                      <tr key={r.request_id??i}>
                        <td className={styles.idCol}>#{r.request_id}</td>
                        <td>{r.customer_name}</td><td>{r.device_type}</td>
                        <td className={styles.mutedCol}>{r.issue_description}</td>
                        <td style={{color:r.technician_name?'var(--teal)':'var(--muted)',fontSize:'0.8rem'}}>{r.technician_name??'Unassigned'}</td>
                        <td><Badge status={repairBadge[r.status]??'pending'}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
            <Panel title="Recent Sales" linkLabel="View all" onLink={()=>handleTab('reports')}>
              {transactions.length===0?<Empty msg="No sales yet."/>:(
                <table className={styles.table}>
                  <thead><tr><th>Sale #</th><th>Repair #</th><th>Amount</th><th>Method</th><th>Date</th><th>Receipt</th></tr></thead>
                  <tbody>
                    {transactions.slice(0,5).map((t,i)=>(
                      <tr key={t.saleId??i}>
                        <td className={styles.idCol}>SALE-{String(t.saleId).padStart(4,'0')}</td>
                        <td>#{t.requestId}</td>
                        <td className={styles.amountCol}>₱{Number(t.amount).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                        <td>{t.paymentMethod}</td>
                        <td className={styles.mutedCol}>{fmtDate(t.soldAt)}</td>
                        <td><button onClick={()=>downloadReceipt(getSaleForReceipt(t))} style={{background:'transparent',border:'1px solid rgba(26,188,156,0.3)',color:'var(--teal)',fontSize:'0.72rem',fontWeight:700,padding:'3px 10px',borderRadius:6,cursor:'pointer'}}>PDF</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* ── REPAIRS ── */}
        {activeSection==='repairs' && (
          <>
            <SectionHeader title="Repairs / Job Orders"/>
            <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
              {[
                {label:'Total',value:repairs.length,color:'var(--teal)'},
                {label:'Pending',value:repairs.filter(r=>r.status==='Pending').length,color:'#fb923c'},
                {label:'In Progress',value:repairs.filter(r=>r.status==='In Progress').length,color:'#facc15'},
                {label:'Completed',value:repairs.filter(r=>r.status==='Completed').length,color:'#4ade80'},
                {label:'Unassigned',value:repairs.filter(r=>!r.technician_id).length,color:'#f87171'},
              ].map(s=>(
                <div key={s.label} style={{background:'var(--navy-mid,#0d1f38)',border:'1px solid var(--navy-border)',borderRadius:10,padding:'10px 18px',textAlign:'center',minWidth:90}}>
                  <div style={{color:s.color,fontSize:'1.3rem',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>{s.value}</div>
                  <div style={{color:'var(--muted)',fontSize:'0.7rem',marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
            <Panel title="All Repair Jobs" linkLabel={`${repairs.length} total`}>
              {loading?<Loader/>:repairs.length===0?<Empty msg="No repairs found."/>:(
                <table className={styles.table}>
                  <thead><tr><th>Job #</th><th>Customer</th><th>Device</th><th>Issue</th><th>Date</th><th>Status</th><th>Assign Technician</th><th>Sale</th></tr></thead>
                  <tbody>
                    {repairs.map((r,i)=>(
                      <tr key={r.request_id??i}>
                        <td className={styles.idCol}>#{r.request_id}</td>
                        <td className={styles.boldCol}>{r.customer_name}</td>
                        <td>{r.device_type}</td>
                        <td className={styles.mutedCol}>{r.issue_description}</td>
                        <td className={styles.mutedCol}>{fmtDate(r.created_at)}</td>
                        <td><Badge status={repairBadge[r.status]??'pending'}/></td>
                        <td><AssignCell repair={r} technicians={technicians} onAssigned={handleAssigned}/></td>
                        <td>
                          {r.status==='Completed'
                            ?<button onClick={()=>setSaleRepair(r)} style={{background:'var(--teal)',color:'#0a1628',border:'none',fontSize:'0.72rem',fontWeight:700,padding:'4px 12px',borderRadius:7,cursor:'pointer',whiteSpace:'nowrap'}}>Create Sale</button>
                            :<span style={{color:'var(--muted)',fontSize:'0.75rem'}}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* ── CUSTOMERS ── */}
        {activeSection==='customers' && (
          <>
            <SectionHeader title="Customers"/>
            <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
              {[
                {label:'Total Customers', value:customers.length,                                                     color:'var(--teal)'},
                {label:'Active Repairs',  value:customers.reduce((s,c)=>s+Number(c.active_repairs||0),0),             color:'#fb923c'  },
                {label:'Jobs Completed',  value:customers.reduce((s,c)=>s+Number(c.completed_repairs||0),0),          color:'#4ade80'  },
              ].map(s=>(
                <div key={s.label} style={{background:'var(--navy-mid,#0d1f38)',border:'1px solid var(--navy-border)',borderRadius:10,padding:'10px 18px',textAlign:'center',minWidth:110}}>
                  <div style={{color:s.color,fontSize:'1.3rem',fontWeight:700,fontFamily:'Rajdhani,sans-serif'}}>{s.value}</div>
                  <div style={{color:'var(--muted)',fontSize:'0.7rem',marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
            <Panel title="Shop Customers" linkLabel={`${customers.length} customers`}>
              {custLoading?<Loader/>:customers.length===0?<Empty msg="No customers have visited your shop yet."/>:(
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Total Repairs</th>
                      <th>Completed</th>
                      <th>Active</th>
                      <th>Last Visit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c,i)=>(
                      <tr key={c.user_id??i}>
                        <td className={styles.boldCol}>{c.username}</td>
                        <td className={styles.mutedCol}>{c.email||'—'}</td>
                        <td style={{color:'var(--teal)',fontWeight:600}}>{c.total_repairs}</td>
                        <td style={{color:'#4ade80'}}>{c.completed_repairs}</td>
                        <td style={{color:Number(c.active_repairs)>0?'#fb923c':'var(--muted)'}}>{c.active_repairs}</td>
                        <td className={styles.mutedCol}>{fmtDate(c.last_visit)}</td>
                        <td>
                          <span style={{
                            background: c.status==='active'?'rgba(26,188,156,0.12)':'rgba(239,68,68,0.12)',
                            color: c.status==='active'?'#1abc9c':'#ef4444',
                            padding:'2px 10px',borderRadius:12,fontSize:'0.7rem',fontWeight:600,textTransform:'capitalize',
                          }}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* ── MEMBERS ── */}
        {activeSection==='members' && (
          <>
            <SectionHeader title="Member Management"/>
            <Panel title="Shop Technicians" linkLabel={`${technicians.length} members`}>
              {loading?<Loader/>:technicians.length===0?<Empty msg="No technicians assigned to your shop yet."/>:(
                <table className={styles.table}>
                  <thead><tr><th>Name</th><th>Email</th><th>Shop</th><th>Jobs Done</th><th>Active Jobs</th><th>Joined</th></tr></thead>
                  <tbody>
                    {technicians.map((t,i)=>(
                      <tr key={t.user_id??i}>
                        <td className={styles.boldCol}>{t.username}</td>
                        <td className={styles.mutedCol}>{t.email}</td>
                        <td>{t.shop_name}</td>
                        <td className={styles.boldCol}>{t.jobs_done}</td>
                        <td style={{color:t.active_jobs>0?'#facc15':'var(--muted)'}}>{t.active_jobs}</td>
                        <td className={styles.mutedCol}>{fmtDate(t.appointed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* ── REPORTS ── */}
        {activeSection==='reports' && (
          <>
            <SectionHeader title="Reports / Analytics"/>
            <ReportKPIs transactions={transactions} repairs={repairs}/>
            <div className={styles.twoCol} style={{marginBottom:20}}>
              <Panel title="Revenue — Last 6 Months"><RevenueBarChart transactions={transactions}/></Panel>
              <Panel title="Repairs by Status"><RepairStatusDonut repairs={repairs}/></Panel>
            </div>
            <Panel title="Revenue by Payment Method" style={{marginBottom:20}}>
              <PaymentMethodChart transactions={transactions}/>
            </Panel>
            <Panel title="All Sales" linkLabel={`${transactions.length} records`}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0 14px',borderBottom:'1px solid rgba(26,188,156,0.08)',marginBottom:4,flexWrap:'wrap',gap:10}}>
                <span style={{color:'var(--muted)',fontSize:'0.78rem'}}>
                  {transactions.length>0?`${transactions.length} sale${transactions.length!==1?'s':''} found`:'No sales yet'}
                </span>
                <DownloadButton onClick={()=>downloadAllReceipts(transactions.map(t=>getSaleForReceipt(t)))} disabled={transactions.length===0} label="Download All Receipts (PDF)"/>
              </div>
              {transactions.length===0?<Empty msg="No sales yet."/>:(
                <table className={styles.table}>
                  <thead><tr><th>Sale #</th><th>Repair #</th><th>Amount</th><th>Method</th><th>Date</th><th>Items</th><th>Receipt</th></tr></thead>
                  <tbody>
                    {transactions.map((t,i)=>(
                      <tr key={t.saleId??i}>
                        <td className={styles.idCol}>SALE-{String(t.saleId).padStart(4,'0')}</td>
                        <td>#{t.requestId}</td>
                        <td className={styles.amountCol}>₱{Number(t.amount).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                        <td>{t.paymentMethod}</td>
                        <td className={styles.mutedCol}>{fmtDate(t.soldAt)}</td>
                        <td className={styles.mutedCol}>{t.items?.length??0} item(s)</td>
                        <td><button onClick={()=>downloadReceipt(getSaleForReceipt(t))} style={{background:'transparent',border:'1px solid rgba(26,188,156,0.3)',color:'var(--teal)',fontSize:'0.72rem',fontWeight:700,padding:'3px 10px',borderRadius:6,cursor:'pointer'}}>PDF</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}
      </main>
    </div>
  );
}

function SectionHeader({title}){return <div className={styles.sectionPageHeader}><h2>{title}</h2></div>;}
function Loader(){return <div className={styles.loadingText} style={{padding:'1rem'}}>Loading…</div>;}
function Empty({msg}){return <div className={styles.emptyText} style={{padding:'1rem'}}>{msg}</div>;}