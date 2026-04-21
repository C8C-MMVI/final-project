// src/pages/CustomerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { getSalesByCustomer } from '../lib/api';
import { useReceiptDownload } from '../hooks/useReceiptDownload';
import s from './CustomerDashboard.module.css';

function normStatus(raw=''){const key=raw.toLowerCase().replace(/[\s_]+/g,'_');return{pending:'pending',in_progress:'progress',completed:'done',cancelled:'cancelled'}[key]??'pending';}
function statusLabel(raw=''){const key=raw.toLowerCase().replace(/[\s_]+/g,'_');return{pending:'Pending',in_progress:'In Progress',completed:'Completed',cancelled:'Cancelled'}[key]??raw;}
const repairId   = r => r.repair_id   ?? r.request_id;
const deviceName = r => r.device      ?? r.device_type;
const issueText  = r => r.issue       ?? r.issue_description;
const fmtDate    = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});

// ── Enrich sale with repair details for receipt ───────────────────────────────
function enrichSale(sale, repairs) {
  const repair = repairs.find(r => (r.repair_id ?? r.request_id) === sale.requestId);
  return {
    ...sale,
    shopName:       repair?.shop_name       ?? null,
    deviceType:     repair?.device_type ?? repair?.device ?? null,
    technicianName: repair?.technician_name ?? null,
  };
}

function buildTimeline(repair){
  if(!repair)return[];
  const created=fmtDate(repair.created_at);
  const base=[
    {label:'Request Submitted',sub:created,status:'done'},
    {label:'Assessed by Tech',sub:'Waiting…',status:'pending'},
    {label:'Repair In Progress',sub:'Waiting…',status:'pending'},
    {label:'Ready for Pickup',sub:'Waiting…',status:'pending'},
    {label:'Completed',sub:'Waiting…',status:'pending'},
  ];
  const st=(repair.status??'').toLowerCase().replace(/[\s_]+/g,'_');
  if(st==='pending'){base[1].status='active';}
  else if(st==='in_progress'){base[1].status='done';base[2].status='active';}
  else if(st==='completed'){base.forEach(b=>(b.status='done'));base[4].sub=created;}
  return base;
}

const IconTool    = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>;
const IconCheck   = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconPeso    = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconCheckSm = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconDot     = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/></svg>;
const IconEmpty   = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

function Badge({status,label}){
  const cls={pending:s.badgePending,progress:s.badgeProgress,done:s.badgeDone,cancelled:s.badgeCancelled}[status]??s.badgePending;
  return <span className={`${s.badge} ${cls}`}>{label}</span>;
}
function Panel({title,metaLabel,onMeta,children}){
  return(
    <div className={s.panel}>
      <div className={s.panelHeader}>
        <span className={s.panelTitle}>{title}</span>
        {metaLabel&&(onMeta?<button className={s.panelMeta} onClick={onMeta}>{metaLabel}</button>:<span className={s.panelMeta}>{metaLabel}</span>)}
      </div>
      {children}
    </div>
  );
}

// ── Download Button ───────────────────────────────────────────────────────────
function DownloadButton({onClick,disabled,label='Download'}){
  const [busy,setBusy]=useState(false);
  const handleClick=async()=>{setBusy(true);try{await onClick();}finally{setTimeout(()=>setBusy(false),800);}};
  return(
    <button onClick={handleClick} disabled={disabled||busy} style={{
      display:'flex',alignItems:'center',gap:6,
      background:disabled?'rgba(26,188,156,0.06)':'rgba(26,188,156,0.12)',
      border:'1px solid rgba(26,188,156,0.3)',
      color:disabled?'rgba(128,144,168,0.5)':'var(--teal,#1abc9c)',
      fontSize:'0.76rem',fontWeight:700,padding:'7px 14px',borderRadius:8,
      cursor:disabled?'not-allowed':'pointer',transition:'all 0.18s ease',
      whiteSpace:'nowrap',letterSpacing:'0.03em',opacity:disabled?0.55:1,
    }}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.background='rgba(26,188,156,0.22)';}}
      onMouseLeave={e=>{if(!disabled)e.currentTarget.style.background='rgba(26,188,156,0.12)';}}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
      {busy?'Generating…':label}
    </button>
  );
}

// ── Repair Request Form ───────────────────────────────────────────────────────
function RepairRequestForm({onSuccess}){
  const [form,setForm]=useState({shop_id:'',device_type:'',issue:'',issue_description:''});
  const [shops,setShops]=useState([]);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const showToast=(msg,isError=false)=>{setToast({msg,isError});setTimeout(()=>setToast(null),3500);};
  useEffect(()=>{
    fetch('/api/shops.php',{credentials:'include'}).then(r=>r.json()).then(d=>{if(d.success)setShops(d.shops??[]);}).catch(()=>{});
  },[]);
  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(!form.shop_id||!form.device_type.trim()||!form.issue){showToast('Please select a shop, device type, and issue.',true);return;}
    setSaving(true);
    try{
      const res=await fetch('/api/repairs.php',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({shop_id:Number(form.shop_id),device_type:form.device_type,issue_description:form.issue+(form.issue_description?' – '+form.issue_description:'')})});
      const data=await res.json();
      if(data.success){showToast('Repair request submitted successfully!');setForm({shop_id:'',device_type:'',issue:'',issue_description:''});onSuccess?.();}
      else{showToast(data.message||'Failed to submit.',true);}
    }catch{showToast('Cannot connect to server.',true);}
    finally{setSaving(false);}
  };
  return(
    <form onSubmit={handleSubmit} className={s.repairForm}>
      {toast&&<div className={`${s.toast} ${toast.isError?s.toastError:s.toastSuccess}`}>{toast.msg}</div>}
      <div className={s.formGroup}>
        <label className={s.formLabel}>Shop</label>
        <select className={s.formSelect} value={form.shop_id} onChange={e=>setForm(f=>({...f,shop_id:e.target.value}))}>
          <option value="">Select a shop…</option>
          {shops.map(sh=><option key={sh.shop_id} value={sh.shop_id}>{sh.shop_name}</option>)}
        </select>
      </div>
      <div className={s.formRow}>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Device Type</label>
          <input type="text" className={s.formInput} placeholder="e.g. iPhone 14, Samsung A54…" value={form.device_type} onChange={e=>setForm(f=>({...f,device_type:e.target.value}))}/>
        </div>
        <div className={s.formGroup}>
          <label className={s.formLabel}>Issue Type</label>
          <select className={s.formSelect} value={form.issue} onChange={e=>setForm(f=>({...f,issue:e.target.value}))}>
            <option value="">Select an issue…</option>
            <option>Screen Damage</option><option>Battery Issue</option><option>Charging Port</option>
            <option>Water Damage</option><option>Camera Problem</option><option>Speaker / Mic Issue</option><option>Other</option>
          </select>
        </div>
      </div>
      <div className={s.formGroup}>
        <label className={s.formLabel}>Description</label>
        <textarea className={s.formTextarea} placeholder="Describe the issue in detail…" rows={4} value={form.issue_description} onChange={e=>setForm(f=>({...f,issue_description:e.target.value}))}/>
      </div>
      <button type="submit" className={s.formSubmit} disabled={saving}>{saving?'Submitting…':'Submit Request'}</button>
    </form>
  );
}

// ── Repair Timeline ───────────────────────────────────────────────────────────
function RepairTimeline({repair}){
  const timeline=buildTimeline(repair);
  return(
    <Panel title={repair?`Track Repair – #${repairId(repair)}`:'Track Repair'} metaLabel={repair?statusLabel(repair.status):null}>
      {repair?(
        <div className={s.timeline}>
          {timeline.map((t,i)=>(
            <div key={i} className={s.timelineItem}>
              <div className={`${s.timelineDot} ${s['dot_'+t.status]}`}>{t.status==='done'?<IconCheckSm/>:<IconDot/>}</div>
              <div className={s.timelineContent}>
                <div className={s.timelineTitle}>{t.label}</div>
                <div className={s.timelineSub}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      ):(
        <div className={s.emptyState}><IconEmpty/><p>No repair requests yet. Submit one to get started.</p></div>
      )}
    </Panel>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CustomerDashboard({username='Customer',userId,setPage,activeSection='dashboard',setActiveSection}){
  const [stats,setStats]=useState(null);
  const [repairs,setRepairs]=useState([]);
  const [transactions,setTransactions]=useState([]);
  const [latestRepair,setLatestRepair]=useState(null);
  const [loading,setLoading]=useState(true);
  const [txLoading,setTxLoading]=useState(false);
  const [error,setError]=useState(null);
  const [customerId,setCustomerId]=useState(userId??null);

  const { downloadReceipt, downloadAllReceipts } = useReceiptDownload({ name: 'TechnoLogs Repair' });

  // Enrich sale with repair details
  const getSaleForReceipt = (sale) => enrichSale(sale, repairs);

  const loadData=useCallback(()=>{
    setLoading(true);
    fetch('/api/dashboard.php',{credentials:'include'}).then(r=>r.json()).then(data=>{
      if(data.success){
        setStats(data.stats);setRepairs(data.repairs??[]);
        setLatestRepair(data.latest_repair??(data.repairs?.length?data.repairs[0]:null));
        if(data.stats?.customer_id)setCustomerId(data.stats.customer_id);
      }else{setError(data.message||'Failed to load dashboard.');}
    }).catch(()=>setError('Cannot connect to server.')).finally(()=>setLoading(false));
  },[]);

  const loadTransactions=useCallback(async(cid)=>{
    if(!cid)return;
    setTxLoading(true);
    try{const res=await getSalesByCustomer(cid);if(res.ok){const data=await res.json();setTransactions(data??[]);}}
    catch{}finally{setTxLoading(false);}
  },[]);

  useEffect(()=>{loadData();},[loadData]);
  useEffect(()=>{if(customerId)loadTransactions(customerId);},[customerId,loadTransactions]);

  if(loading)return <div className={s.loadingState}>Loading dashboard…</div>;
  if(error)return <div className={s.errorState}>{error}</div>;

  const activeCount    = stats?.active_repairs    ?? 0;
  const completedCount = stats?.completed_repairs ?? 0;
  const totalSpent     = transactions.reduce((sum,t)=>sum+Number(t.amount??0),0);

  // ── Dashboard ─────────────────────────────────────────────────────────────
  if(activeSection==='dashboard'){
    return(
      <>
        <div className={s.welcomeHeader}>
          <div className={s.welcomeGreeting}>Welcome back, <span>{username}</span></div>
          <div className={s.welcomeSub}>Here's a summary of your repair requests and transactions.</div>
        </div>
        <div className={s.statsRow}>
          <div className={s.statCard}><div className={`${s.statIcon} ${s.iconOrange}`}><IconTool/></div><div className={s.statInfo}><span className={s.statValue}>{activeCount}</span><span className={s.statLabel}>Active Repairs</span></div></div>
          <div className={s.statCard}><div className={`${s.statIcon} ${s.iconTeal}`}><IconCheck/></div><div className={s.statInfo}><span className={s.statValue}>{completedCount}</span><span className={s.statLabel}>Completed Repairs</span></div></div>
          <div className={s.statCard}><div className={`${s.statIcon} ${s.iconBlue}`}><IconPeso/></div><div className={s.statInfo}><span className={s.statValue}>₱{totalSpent.toLocaleString('en-PH',{minimumFractionDigits:0})}</span><span className={s.statLabel}>Total Spent</span></div></div>
        </div>
        <div className={s.twoCol}>
          <Panel title="Submit Repair Request"><RepairRequestForm onSuccess={loadData}/></Panel>
          <RepairTimeline repair={latestRepair}/>
        </div>
        <div className={s.tableSection}>
          <Panel title="My Repair Requests" metaLabel={`${repairs.length} total`} onMeta={setActiveSection?()=>setActiveSection('repairs'):null}>
            {repairs.length===0?(<div className={s.emptyState}><IconEmpty/><p>No repair requests found.</p></div>):(
              <table className={s.table}>
                <thead><tr><th>Job #</th><th>Device</th><th>Issue</th><th>Shop</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {repairs.map(r=>(
                    <tr key={repairId(r)}>
                      <td className={s.idCol}>#{repairId(r)}</td><td className={s.bold}>{deviceName(r)}</td>
                      <td>{issueText(r)}</td><td>{r.shop_name}</td>
                      <td className={s.muted}>{fmtDate(r.created_at)}</td>
                      <td><Badge status={normStatus(r.status)} label={statusLabel(r.status)}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      </>
    );
  }

  // ── My Repairs ────────────────────────────────────────────────────────────
  if(activeSection==='repairs'){
    return(
      <div className={s.tableSection}>
        <div className={s.sectionHeader}><h2 className={s.sectionTitle}>My Repairs</h2></div>
        <Panel title="All Repair Requests" metaLabel={`${repairs.length} total`}>
          {repairs.length===0?(<div className={s.emptyState}><IconEmpty/><p>No repair requests found.</p></div>):(
            <table className={s.table}>
              <thead><tr><th>Job #</th><th>Device</th><th>Issue</th><th>Shop</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {repairs.map(r=>(
                  <tr key={repairId(r)}>
                    <td className={s.idCol}>#{repairId(r)}</td><td className={s.bold}>{deviceName(r)}</td>
                    <td>{issueText(r)}</td><td>{r.shop_name}</td>
                    <td className={s.muted}>{fmtDate(r.created_at)}</td>
                    <td><Badge status={normStatus(r.status)} label={statusLabel(r.status)}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>
    );
  }

  // ── My Transactions ───────────────────────────────────────────────────────
  if(activeSection==='transactions'){
    return(
      <div className={s.tableSection}>
        <div className={s.sectionHeader}><h2 className={s.sectionTitle}>My Transactions</h2></div>
        <Panel title="Transaction History" metaLabel={`${transactions.length} records`}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0 14px',borderBottom:'1px solid rgba(26,188,156,0.08)',marginBottom:4,flexWrap:'wrap',gap:10}}>
            <span style={{color:'rgba(128,144,168,0.8)',fontSize:'0.78rem'}}>
              {txLoading?'Loading transactions…':transactions.length>0?`${transactions.length} transaction${transactions.length!==1?'s':''} found`:'No transactions yet'}
            </span>
            <div style={{display:'flex',gap:8}}>
              <DownloadButton
                onClick={()=>downloadAllReceipts(transactions.map(t=>getSaleForReceipt(t)))}
                disabled={txLoading||transactions.length===0}
                label="Download All (PDF)"
              />
            </div>
          </div>

          {txLoading?(<div className={s.emptyState}><p>Loading transactions…</p></div>)
            :transactions.length===0?(<div className={s.emptyState}><IconEmpty/><p>No transactions found.</p></div>)
            :(
              <table className={s.table}>
                <thead><tr><th>Sale #</th><th>Repair #</th><th>Amount</th><th>Method</th><th>Date</th><th>Receipt</th></tr></thead>
                <tbody>
                  {transactions.map(t=>(
                    <tr key={t.saleId}>
                      <td className={s.idCol}>SALE-{String(t.saleId).padStart(4,'0')}</td>
                      <td>#{t.requestId}</td>
                      <td className={s.bold}>₱{Number(t.amount).toLocaleString('en-PH',{minimumFractionDigits:2})}</td>
                      <td>{t.paymentMethod}</td>
                      <td className={s.muted}>{fmtDate(t.soldAt)}</td>
                      <td>
                        <button onClick={()=>downloadReceipt(getSaleForReceipt(t))} style={{background:'transparent',border:'1px solid rgba(26,188,156,0.3)',color:'var(--teal,#1abc9c)',fontSize:'0.72rem',fontWeight:700,padding:'3px 10px',borderRadius:6,cursor:'pointer'}}>
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </Panel>
      </div>
    );
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  if(activeSection==='notifications'){
    return(
      <div className={s.tableSection}>
        <div className={s.sectionHeader}><h2 className={s.sectionTitle}>Notifications</h2></div>
        <div className={s.emptyState} style={{padding:'60px 20px'}}><IconEmpty/><p>No notifications yet.</p></div>
      </div>
    );
  }

  // ── Help ──────────────────────────────────────────────────────────────────
  if(activeSection==='help'){
    return(
      <div className={s.tableSection}>
        <div className={s.sectionHeader}><h2 className={s.sectionTitle}>Help & FAQs</h2></div>
        <div className={s.emptyState} style={{padding:'60px 20px'}}><IconEmpty/><p>Help content coming soon.</p></div>
      </div>
    );
  }

  return null;
}