// src/pages/CustomerDashboard.jsx
//
// CHANGES vs original:
//  1. Imports useChatUnread hook
//  2. RepairsTable now receives perRepairUnread + clearRepair from the hook
//     (replaces its own local fetch loop — avoids double-fetching)
//  3. CustomerDashboard accepts + forwards  onUnreadChatChange  prop so the
//     parent (App / DashboardLayout) can pass the count to <Topbar>.

import { useState, useEffect, useCallback } from 'react';
import { getSalesByCustomer } from '../lib/api';
import { useReceiptDownload } from '../hooks/useReceiptDownload';
import { useChatUnread }      from '../hooks/useChatUnread';   // ← NEW
import ReviewModal from '../components/shared/ReviewModal';
import s from './CustomerDashboard.module.css';
import ChatWindow from '../components/dashboard/ChatWindow';
import RepairTimeline from '../components/dashboard/RepairTimeline';

function normStatus(raw=''){const key=raw.toLowerCase().replace(/[\s_]+/g,'_');return{pending:'pending',in_progress:'progress',completed:'done',cancelled:'cancelled'}[key]??'pending';}
function statusLabel(raw=''){const key=raw.toLowerCase().replace(/[\s_]+/g,'_');return{pending:'Pending',in_progress:'In Progress',completed:'Completed',cancelled:'Cancelled'}[key]??raw;}
const repairId   = r => r.repair_id   ?? r.request_id;
const deviceName = r => r.device      ?? r.device_type;
const issueText  = r => r.issue       ?? r.issue_description;
const fmtDate    = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});

function enrichSale(sale, repairs) {
  const repair = repairs.find(r =>
    (r.repair_id ?? r.request_id) === sale.requestId ||
    (r.repair_id ?? r.request_id) === Number(sale.requestId)
  );
  return {
    ...sale,
    shopName:       repair?.shop_name       ?? sale.shopName       ?? null,
    deviceType:     repair?.device_type     ?? repair?.device      ?? sale.deviceType ?? null,
    technicianName: repair?.technician_name ?? sale.technicianName ?? null,
  };
}

const IconTool    = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>;
const IconCheck   = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconPeso    = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconEmpty   = ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconClock = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const IconCheckCircle = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const IconXCircle = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>);
const IconInfo = ({ size = 15 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);
const IconAlertCircle = ({ size = 15 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>);
const IconCheckToast = ({ size = 15 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>);
const IconSend = ({ size = 13 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const IconLoader = ({ size = 13 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);
const IconLogOut = ({ size = 14 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const IconShop = ({ size = 15 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);

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

function DownloadButton({onClick,disabled,label='Download'}){
  const [busy,setBusy]=useState(false);
  const handleClick=async()=>{setBusy(true);try{await onClick();}finally{setTimeout(()=>setBusy(false),800);}};
  return(
    <button onClick={handleClick} disabled={disabled||busy} style={{display:'flex',alignItems:'center',gap:6,background:disabled?'rgba(26,188,156,0.06)':'rgba(26,188,156,0.12)',border:'1px solid rgba(26,188,156,0.3)',color:disabled?'rgba(128,144,168,0.5)':'var(--teal,#1abc9c)',fontSize:'0.76rem',fontWeight:700,padding:'7px 14px',borderRadius:8,cursor:disabled?'not-allowed':'pointer',transition:'all 0.18s ease',whiteSpace:'nowrap',letterSpacing:'0.03em',opacity:disabled?0.55:1,}}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.background='rgba(26,188,156,0.22)';}}
      onMouseLeave={e=>{if(!disabled)e.currentTarget.style.background='rgba(26,188,156,0.12)';}}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      {busy?'Generating…':label}
    </button>
  );
}

// ── Chat Modal ────────────────────────────────────────────────────────────────
function ChatModal({ repair, customerId, username, onClose }) {
  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose(); };
  return (
    <div onClick={handleBackdrop} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, height: 560,
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 10, right: 10, zIndex: 10,
          background: 'rgba(0,0,0,0.2)', border: 'none',
          color: '#fff', width: 28, height: 28, borderRadius: '50%',
          cursor: 'pointer', fontSize: '0.9rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
        <ChatWindow
          repairId={repairId(repair)}
          currentUserId={customerId}
          currentUserName={username}
          technicianId={repair.technician_id ?? null}
        />
      </div>
    </div>
  );
}

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
      <div className={s.formGroup}><label className={s.formLabel}>Shop</label><select className={s.formSelect} value={form.shop_id} onChange={e=>setForm(f=>({...f,shop_id:e.target.value}))}><option value="">Select a shop…</option>{shops.map(sh=><option key={sh.shop_id} value={sh.shop_id}>{sh.shop_name}</option>)}</select></div>
      <div className={s.formRow}>
        <div className={s.formGroup}><label className={s.formLabel}>Device Type</label><input type="text" className={s.formInput} placeholder="e.g. iPhone 14, Samsung A54…" value={form.device_type} onChange={e=>setForm(f=>({...f,device_type:e.target.value}))}/></div>
        <div className={s.formGroup}><label className={s.formLabel}>Issue Type</label><select className={s.formSelect} value={form.issue} onChange={e=>setForm(f=>({...f,issue:e.target.value}))}><option value="">Select an issue…</option><option>Screen Damage</option><option>Battery Issue</option><option>Charging Port</option><option>Water Damage</option><option>Camera Problem</option><option>Speaker / Mic Issue</option><option>Other</option></select></div>
      </div>
      <div className={s.formGroup}><label className={s.formLabel}>Description</label><textarea className={s.formTextarea} placeholder="Describe the issue in detail…" rows={4} value={form.issue_description} onChange={e=>setForm(f=>({...f,issue_description:e.target.value}))}/></div>
      <button type="submit" className={s.formSubmit} disabled={saving}>{saving?'Submitting…':'Submit Request'}</button>
    </form>
  );
}

// ── Notifications Section ─────────────────────────────────────────────────────
function NotificationsSection() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [markingAll, setMarkingAll]       = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await fetch('/api/notifications.php', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setNotifications(data.notifications ?? []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications.php?action=read&id=${id}`, { method: 'PATCH', credentials: 'include' });
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await fetch('/api/notifications.php?action=read_all', { method: 'PATCH', credentials: 'include' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
    finally { setMarkingAll(false); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={s.tableSection}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Notifications</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} disabled={markingAll} style={{background:'transparent',border:'1px solid rgba(26,188,156,0.3)',color:'#1abc9c',fontSize:'0.76rem',fontWeight:700,padding:'6px 14px',borderRadius:8,cursor:'pointer'}}>
            {markingAll ? 'Marking…' : `Mark all as read (${unreadCount})`}
          </button>
        )}
      </div>
      {loading ? (
        <div className={s.emptyState}><p>Loading notifications…</p></div>
      ) : notifications.length === 0 ? (
        <div className={s.emptyState} style={{padding:'60px 20px'}}><IconEmpty /><p>No notifications yet.</p></div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {notifications.map(n => (
            <div key={n.notification_id} onClick={() => !n.is_read && markAsRead(n.notification_id)} style={{padding:'14px 18px',borderRadius:10,background:n.is_read?'#fff':'rgba(26,188,156,0.06)',border:`1px solid ${n.is_read?'rgba(13,31,26,0.08)':'rgba(26,188,156,0.2)'}`,cursor:n.is_read?'default':'pointer',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,transition:'background 0.2s',boxShadow:'0 1px 4px rgba(13,31,26,0.04)'}}>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:'0.88rem',color:n.is_read?'rgba(13,31,26,0.45)':'#0a1c16',fontWeight:n.is_read?400:500,lineHeight:1.5}}>{n.message}</p>
                <span style={{fontSize:'0.72rem',color:'rgba(13,31,26,0.35)',marginTop:4,display:'block'}}>{new Date(n.created_at).toLocaleString()}</span>
              </div>
              {!n.is_read && <span style={{width:8,height:8,borderRadius:'50%',background:'#1abc9c',flexShrink:0,marginTop:6}}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Help Section ──────────────────────────────────────────────────────────────
function HelpSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = [
    { q: 'How do I submit a repair request?', a: 'Go to the Dashboard and fill out the "Submit Repair Request" form. Select a shop, enter your device type, choose the issue type, and provide a description. Click "Submit Request" when done.' },
    { q: 'How do I track my repair status?', a: 'Your latest repair status is shown on the Dashboard under "Track Repair". You can also go to "My Repairs" in the sidebar to see all your repair requests and their current statuses (Pending, In Progress, or Completed).' },
    { q: 'What do the repair statuses mean?', a: 'Pending means your request has been submitted and is waiting to be assigned. In Progress means a technician is actively working on your device. Completed means your device is ready for pickup.' },
    { q: 'How do I view my transactions?', a: 'Click "My Transactions" in the sidebar. You will see a full history of your payments including the amount, payment method, and date.' },
    { q: 'How do I download a receipt?', a: 'Go to "My Transactions" and click the "PDF" button next to any transaction to download a receipt. You can also click "Download All (PDF)" to download all receipts at once.' },
    { q: 'How will I know when my repair is updated?', a: 'You will receive a notification every time your repair status changes. Click "Notifications" in the sidebar to view all your notifications. Unread notifications are highlighted — click them to mark as read.' },
    { q: 'How do I mark notifications as read?', a: 'Click on any unread notification to mark it as read individually, or use the "Mark all as read" button at the top of the Notifications page to clear all at once.' },
    { q: 'Can I submit multiple repair requests?', a: 'Yes, you can submit as many repair requests as you need. Each request is tracked separately and you will receive notifications for each one.' },
    { q: 'How do I leave a review for my technician?', a: 'Once a repair is marked as Completed, a "★ Review" button will appear next to it in My Repairs. Click it to leave a star rating and optional comment for your technician.' },
    { q: 'What should I do if I have a problem not listed here?', a: 'Contact our support team directly via email or phone. Our details are listed in the Contact Support section below.' },
  ];
  return (
    <div className={s.tableSection}>
      <div style={{marginBottom:32}}>
        <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(13,31,26,0.4)',marginBottom:14,fontFamily:"'Orbitron', sans-serif"}}>Frequently Asked Questions</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {faqs.map((faq,i)=>(
            <div key={i} style={{borderRadius:10,border:`1px solid ${openIndex===i?'rgba(26,188,156,0.25)':'rgba(13,31,26,0.08)'}`,background:openIndex===i?'rgba(26,188,156,0.04)':'#fff',overflow:'hidden',transition:'all 0.2s ease',boxShadow:'0 1px 4px rgba(13,31,26,0.04)'}}>
              <button onClick={()=>setOpenIndex(openIndex===i?null:i)} style={{width:'100%',textAlign:'left',background:'transparent',border:'none',padding:'14px 18px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
                <span style={{fontSize:'0.88rem',fontWeight:600,color:openIndex===i?'#1abc9c':'#0a1c16',fontFamily:"'DM Sans', sans-serif"}}>{faq.q}</span>
                <span style={{fontSize:'1.1rem',color:'#1abc9c',flexShrink:0,transition:'transform 0.2s',display:'inline-block',transform:openIndex===i?'rotate(45deg)':'rotate(0deg)'}}>+</span>
              </button>
              {openIndex===i&&<div style={{padding:'0 18px 14px',fontSize:'0.84rem',color:'rgba(13,31,26,0.55)',lineHeight:1.65,fontFamily:"'DM Sans', sans-serif"}}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
      <div style={{borderRadius:12,border:'1px solid rgba(26,188,156,0.18)',background:'rgba(26,188,156,0.04)',padding:'24px 28px'}}>
        <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'rgba(13,31,26,0.4)',marginBottom:16,fontFamily:"'Orbitron', sans-serif"}}>Contact Support</div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {[{icon:<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>,label:'Email',value:<a href="mailto:technologs@gmail.com" style={{fontSize:'0.88rem',fontWeight:500,color:'#1abc9c',textDecoration:'none'}}>technologs@gmail.com</a>},{icon:<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,label:'Phone',value:<a href="tel:09956351020" style={{fontSize:'0.88rem',fontWeight:500,color:'#1abc9c',textDecoration:'none'}}>0995 635 1020</a>},{icon:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,label:'Business Hours',value:<span style={{fontSize:'0.88rem',fontWeight:500,color:'#0a1c16'}}>Monday – Sunday, 7:00 AM – 7:00 PM</span>}]
          .map(({icon,label,value},i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:8,flexShrink:0,background:'rgba(26,188,156,0.08)',border:'1px solid rgba(26,188,156,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg></div>
              <div><div style={{fontSize:'0.72rem',color:'rgba(13,31,26,0.4)',marginBottom:2}}>{label}</div>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Doc Upload widget (reusable inside ShopRequestSection) ───────────────────
function DocUpload({ label, fieldName, file, onChange, hint }) {
  const hasFile = !!file;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label className={s.formLabel}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      {hint && (
        <span style={{ fontSize: '0.70rem', color: 'rgba(13,31,26,0.38)', marginBottom: 2 }}>
          {hint}
        </span>
      )}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 13px', borderRadius: 9, cursor: 'pointer',
        border: hasFile
          ? '1.5px solid rgba(26,188,156,0.45)'
          : '1.5px dashed rgba(13,31,26,0.16)',
        background: hasFile
          ? 'rgba(26,188,156,0.05)'
          : 'rgba(13,31,26,0.02)',
        transition: 'all 0.18s',
      }}>
        {/* File icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={hasFile ? '#1abc9c' : 'rgba(13,31,26,0.3)'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          {hasFile
            ? <><polyline points="9 12 12 15 15 12"/><line x1="12" y1="15" x2="12" y2="21"/></>
            : <><line x1="12" y1="12" x2="12" y2="18"/><polyline points="9 15 12 12 15 15"/></>
          }
        </svg>

        <span style={{
          flex: 1, fontSize: '0.79rem',
          color: hasFile ? '#0e8f6a' : 'rgba(13,31,26,0.4)',
          fontFamily: "'DM Sans', sans-serif",
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {hasFile ? file.name : 'Upload PDF, JPG or PNG (max 5 MB)'}
        </span>

        {/* Remove button */}
        {hasFile && (
          <button type="button"
            onClick={e => { e.preventDefault(); onChange(fieldName, null); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(239,68,68,0.6)', fontSize: '1rem',
              lineHeight: 1, padding: '0 2px', flexShrink: 0,
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

// ── Required document definitions ────────────────────────────────────────────
const SHOP_DOCS = [
  { field: 'dti_permit',      label: 'DTI Permit',               hint: 'Department of Trade and Industry registration' },
  { field: 'nc3_certificate', label: 'NC3 Cleaning Certificate',  hint: 'TESDA National Certificate III' },
  { field: 'bir_permit',      label: 'BIR Permit',               hint: 'Bureau of Internal Revenue certificate' },
  { field: 'dit_permit',      label: 'DIT Permit',               hint: 'Department of Information Technology authorization' },
  { field: 'ntc_permit',      label: 'NTC Permit',               hint: 'National Telecommunications Commission authority' },
];

// ── Shop Request Section ──────────────────────────────────────────────────────
function ShopRequestSection() {
  const [form, setForm] = useState({
    shop_name: '', address: '', contact_number: '', description: '',
  });
  const [docs, setDocs] = useState({
    dti_permit: null, nc3_certificate: null,
    bir_permit: null, dit_permit: null, ntc_permit: null,
  });

  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);
  const [status, setStatus]     = useState(null);
  const [checking, setChecking] = useState(true);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Check existing request on mount ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/shop_requests.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.my_request) {
          setStatus(data.my_request.status);
          if (data.my_request.status === 'approved') {
            fetch('/api/session.php', { credentials: 'include' })
              .then(r => r.json())
              .then(session => { if (session.role === 'owner') window.location.href = '/owner/dashboard'; })
              .catch(() => {});
          }
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleDocChange = (field, file) => setDocs(d => ({ ...d, [field]: file }));

  const allDocsUploaded = SHOP_DOCS.every(d => !!docs[d.field]);
  const uploadedCount   = Object.values(docs).filter(Boolean).length;

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.shop_name.trim() || !form.address.trim() || !form.contact_number.trim()) {
      showToast('Shop name, address, and contact number are required.', true);
      return;
    }
    if (!allDocsUploaded) {
      showToast('Please upload all five required government documents.', true);
      return;
    }

    setSaving(true);
    try {
      // Must use FormData — NOT JSON — because we have file uploads
      const fd = new FormData();
      fd.append('shop_name',      form.shop_name.trim());
      fd.append('address',        form.address.trim());
      fd.append('contact_number', form.contact_number.trim());
      fd.append('description',    form.description.trim());
      SHOP_DOCS.forEach(d => fd.append(d.field, docs[d.field]));

      const res  = await fetch('/api/shop_requests.php', {
        method: 'POST',
        credentials: 'include',
        // ⚠️ Do NOT set Content-Type header — browser adds it with boundary
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message);
        setStatus('pending');
        setForm({ shop_name: '', address: '', contact_number: '', description: '' });
        setDocs({ dti_permit: null, nc3_certificate: null, bir_permit: null, dit_permit: null, ntc_permit: null });
      } else {
        showToast(data.message || 'Failed to submit.', true);
      }
    } catch {
      showToast('Cannot connect to server.', true);
    } finally {
      setSaving(false);
    }
  };

  // ── Status screens (unchanged from original) ────────────────────────────────
  if (checking) return (
    <div className={s.tableSection}>
      <Panel title="Register My Shop">
        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(13,31,26,0.4)', fontSize: '0.88rem' }}>
          Checking status…
        </div>
      </Panel>
    </div>
  );

  if (status === 'pending') return (
    <div className={s.tableSection}>
      <Panel title="Register My Shop">
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#b45309' }}>
            <IconClock />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0a1c16', marginBottom: 8 }}>Request Under Review</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(13,31,26,0.5)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
            Your shop registration request and documents have been submitted and are waiting for admin approval. You will receive a notification once reviewed.
          </div>
        </div>
      </Panel>
    </div>
  );

  if (status === 'approved') return (
    <div className={s.tableSection}>
      <Panel title="Register My Shop">
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(26,188,156,0.1)', border: '1px solid rgba(26,188,156,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#1abc9c' }}>
            <IconCheckCircle />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1abc9c', marginBottom: 8 }}>Shop Approved!</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(13,31,26,0.5)', lineHeight: 1.6, marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
            Your shop has been approved. Click the button below to go to your Owner Dashboard.
          </div>
          <button
            onClick={() => { fetch('/api/logout.php', { method: 'POST', credentials: 'include' }).finally(() => { window.location.href = '/login'; }); }}
            style={{ background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 28px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.5px', boxShadow: '0 3px 12px rgba(26,188,156,0.28)', transition: 'background 0.18s, transform 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0aaa86'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1abc9c'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <IconLogOut />Log out &amp; Sign in as Owner
          </button>
        </div>
      </Panel>
    </div>
  );

  if (status === 'rejected') return (
    <div className={s.tableSection}>
      <Panel title="Register My Shop">
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444' }}>
            <IconXCircle />
          </div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ef4444', marginBottom: 8 }}>Request Not Approved</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(13,31,26,0.5)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 24px' }}>
            Your shop registration request was not approved. You may submit a new request with updated documents.
          </div>
          {/* Allow re-submission on rejection */}
          <button
            onClick={() => setStatus(null)}
            style={{ background: '#1abc9c', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 24px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", boxShadow: '0 3px 12px rgba(26,188,156,0.25)' }}
          >
            Submit New Request
          </button>
        </div>
      </Panel>
    </div>
  );

  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <div className={s.tableSection}>
      <Panel title="Register My Shop">

        {/* Info banner */}
        <div style={{ margin: '0 20px 4px', padding: '12px 16px', borderRadius: 10, background: 'rgba(26,188,156,0.04)', border: '1px solid rgba(26,188,156,0.12)', fontSize: '0.82rem', color: 'rgba(13,31,26,0.5)', lineHeight: 1.65, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ flexShrink: 0, marginTop: 2, color: '#1abc9c' }}><IconShop /></span>
          <span>Want to offer repair services on <strong style={{ color: '#0a1c16', fontWeight: 600 }}>TechnoLogs</strong>? Fill in your shop details and upload all required government permits. Our admin team will review and notify you once approved.</span>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ margin: '12px 20px 0', padding: '11px 16px', borderRadius: 9, background: toast.isError ? 'rgba(239,68,68,0.07)' : 'rgba(26,188,156,0.08)', border: `1px solid ${toast.isError ? 'rgba(239,68,68,0.2)' : 'rgba(26,188,156,0.2)'}`, color: toast.isError ? '#ef4444' : '#0e8f6a', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flexShrink: 0 }}>{toast.isError ? <IconAlertCircle /> : <IconCheckToast />}</span>
            {toast.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={s.repairForm}>

          {/* ── Shop details ── */}
          <div className={s.formGroup}>
            <label className={s.formLabel}>Shop Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className={s.formInput} placeholder="e.g. TechFix Manila"
              value={form.shop_name} onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))} />
          </div>

          <div className={s.formGroup}>
            <label className={s.formLabel}>Address <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className={s.formInput} placeholder="e.g. 123 Rizal Ave, Quezon City"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>

          <div className={s.formGroup}>
            <label className={s.formLabel}>Contact Number <span style={{ color: '#ef4444' }}>*</span></label>
            <input type="text" className={s.formInput} placeholder="e.g. 09171234567" maxLength={11}
              value={form.contact_number}
              onChange={e => setForm(f => ({ ...f, contact_number: e.target.value.replace(/\D/g, '') }))} />
          </div>

          <div className={s.formGroup}>
            <label className={s.formLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Description
              <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'rgba(13,31,26,0.3)', textTransform: 'none', letterSpacing: 0 }}>— optional</span>
            </label>
            <textarea className={s.formTextarea} placeholder="Tell us about your shop and the services you offer…" rows={3}
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          {/* ── Document uploads ── */}
          <div style={{ borderTop: '1px solid rgba(26,188,156,0.1)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(13,31,26,0.45)', fontFamily: "'Orbitron', sans-serif" }}>
                Required Government Documents
              </span>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: allDocsUploaded ? '#0e8f6a' : '#d97706', fontFamily: "'Orbitron', sans-serif" }}>
                {uploadedCount}/{SHOP_DOCS.length} {allDocsUploaded ? '✓' : 'uploaded'}
              </span>
            </div>

            {SHOP_DOCS.map(d => (
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

          {/* ── Submit row ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 4, borderTop: '1px solid rgba(26,188,156,0.08)', marginTop: 4 }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(13,31,26,0.35)' }}>
              Fields marked <span style={{ color: '#ef4444' }}>*</span> are required &nbsp;·&nbsp; All documents are kept confidential
            </span>
            <button type="submit" className={s.formSubmit} disabled={saving}
              style={{ alignSelf: 'auto', minWidth: 170, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              {saving
                ? <><IconLoader /> Submitting…</>
                : <><IconSend /> Submit Request</>
              }
            </button>
          </div>

        </form>
      </Panel>
    </div>
  );
}

// ── Repairs Table ─────────────────────────────────────────────────────────────
// CHANGED: removed internal fetch loop; now receives perRepairUnread + clearRepair as props
function RepairsTable({ repairs, onReview, onChat, perRepairUnread = {}, clearRepair }) {
  if (!repairs.length) {
    return <div className={s.emptyState}><IconEmpty /><p>No repair requests yet.</p></div>;
  }

  return (
    <div className={s.tableWrapper}>
      <table className={s.table}>
        <thead>
          <tr><th>#</th><th>Device</th><th>Issue</th><th>Shop</th><th>Date</th><th>Status</th><th>Review</th><th>Chat</th></tr>
        </thead>
        <tbody>
          {repairs.map(r => {
            const st     = normStatus(r.status ?? '');
            const rid    = repairId(r);
            const unread = perRepairUnread[rid] ?? 0;
            return (
              <tr key={rid}>
                <td className={s.idCol}>#{rid}</td>
                <td className={s.bold}>{deviceName(r) || '—'}</td>
                <td className={s.muted} style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={issueText(r)}>{issueText(r)||'—'}</td>
                <td>{r.shop_name||'—'}</td>
                <td className={s.muted}>{r.created_at?fmtDate(r.created_at):'—'}</td>
                <td><Badge status={st} label={statusLabel(r.status??'')}/></td>
                <td>
                  {st==='done'?(r.reviewed?(<span style={{fontSize:'0.75rem',color:'rgba(13,31,26,0.35)',fontStyle:'italic'}}>Reviewed</span>):(<button onClick={()=>onReview(r)} style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',color:'#b45309',fontSize:'0.76rem',fontWeight:700,padding:'4px 12px',borderRadius:6,cursor:'pointer',whiteSpace:'nowrap',transition:'background 0.15s'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(245,158,11,0.2)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(245,158,11,0.1)'}>★ Review</button>)):(<span style={{fontSize:'0.75rem',color:'rgba(13,31,26,0.25)'}}>—</span>)}
                </td>
                <td>
                  {/* ── Chat button with unread badge ── */}
                  <button
                    onClick={() => {
                      onChat(r);
                      clearRepair?.(rid);  // immediately clear the badge for this repair
                    }}
                    style={{
                      position:'relative',
                      background:'rgba(59,130,246,0.1)',
                      border:'1px solid rgba(59,130,246,0.3)',
                      color:'#60a5fa',fontSize:'0.76rem',fontWeight:700,
                      padding:'4px 12px',borderRadius:6,cursor:'pointer',
                      whiteSpace:'nowrap',transition:'background 0.15s',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(59,130,246,0.1)'}
                  >
                    💬 Chat
                    {unread > 0 && (
                      <span style={{
                        position:'absolute',top:-6,right:-6,
                        background:'#ef4444',color:'#fff',
                        fontSize:'0.6rem',fontWeight:700,
                        minWidth:16,height:16,borderRadius:'50%',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        padding:'0 3px',lineHeight:1,
                        boxShadow:'0 1px 4px rgba(239,68,68,0.4)',
                        animation:'chatBtnBadgePop 0.25s ease',
                      }}>
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  <style>{`@keyframes chatBtnBadgePop{0%{transform:scale(0.4);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}`}</style>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
//
// NEW PROP:
//   onUnreadChatChange(count)
//     — Called whenever the total unread chat count changes.
//       Pass this down from App/DashboardLayout to feed <Topbar unreadChatCount>.
//
export default function CustomerDashboard({
  username = 'Customer',
  userId,
  setPage,
  activeSection = 'dashboard',
  setActiveSection,
  onUnreadChatChange,   // ← NEW
}) {
  const [stats,setStats]               = useState(null);
  const [repairs,setRepairs]           = useState([]);
  const [transactions,setTransactions] = useState([]);
  const [latestRepair,setLatestRepair] = useState(null);
  const [loading,setLoading]           = useState(true);
  const [txLoading,setTxLoading]       = useState(false);
  const [error,setError]               = useState(null);
  const [customerId,setCustomerId]     = useState(userId??null);
  const [reviewTarget,setReviewTarget] = useState(null);
  const [chatRepair,setChatRepair]     = useState(null);

  const { downloadReceipt, downloadAllReceipts } = useReceiptDownload({ name: 'TechnoLogs Repair' });
  const getSaleForReceipt = (sale) => enrichSale(sale, repairs);

  // ── NEW: centralised unread chat counts ──────────────────────────────────
  const { totalUnread, perRepairUnread, clearRepair } = useChatUnread(customerId, repairs);

  // Bubble the total up so Topbar can show the badge
  useEffect(() => {
    onUnreadChatChange?.(totalUnread);
  }, [totalUnread, onUnreadChatChange]);
  // ────────────────────────────────────────────────────────────────────────

  const loadData = useCallback(() => {
    setLoading(true);
    fetch('/api/dashboard.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          setRepairs(data.repairs ?? []);
          setLatestRepair(data.latest_repair ?? (data.repairs?.length ? data.repairs[0] : null));
          if (data.stats?.customer_id) setCustomerId(data.stats.customer_id);
        } else { setError(data.message || 'Failed to load dashboard.'); }
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, []);

  const loadTransactions = useCallback(async (cid) => {
    if (!cid) return;
    setTxLoading(true);
    try {
      const res = await getSalesByCustomer(cid);
      if (res.ok) { const data = await res.json(); setTransactions(data ?? []); }
    } catch {}
    finally { setTxLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (customerId) loadTransactions(customerId); }, [customerId, loadTransactions]);

  const handleReviewed = () => {
    if (!reviewTarget) return;
    const id = repairId(reviewTarget);
    setRepairs(prev => prev.map(r => repairId(r) === id ? { ...r, reviewed: true } : r));
    if (latestRepair && repairId(latestRepair) === id) setLatestRepair(prev => ({ ...prev, reviewed: true }));
  };

  if (loading) return <div className={s.loadingState}>Loading dashboard…</div>;
  if (error)   return <div className={s.errorState}>{error}</div>;

  const activeCount    = stats?.active_repairs    ?? 0;
  const completedCount = stats?.completed_repairs ?? 0;
  const totalSpent     = transactions.reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

  return (
    <>
      {reviewTarget && <ReviewModal repair={reviewTarget} onClose={() => setReviewTarget(null)} onSubmitted={handleReviewed} />}

      {chatRepair && (
        <ChatModal repair={chatRepair} customerId={customerId} username={username} onClose={() => setChatRepair(null)} />
      )}

      {activeSection === 'dashboard' && (
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
            <RepairTimeline currentRepair={latestRepair} />
          </div>
          <div className={s.tableSection}>
            <Panel title="My Repair Requests" metaLabel={`${repairs.length} total`} onMeta={setActiveSection ? () => setActiveSection('repairs') : null}>
              <RepairsTable repairs={repairs} onReview={setReviewTarget} onChat={setChatRepair} perRepairUnread={perRepairUnread} clearRepair={clearRepair} />
            </Panel>
          </div>
        </>
      )}

      {activeSection === 'repairs' && (
        <div className={s.tableSection}>
          <Panel title="All Repair Requests" metaLabel={`${repairs.length} total`}>
            <RepairsTable repairs={repairs} onReview={setReviewTarget} onChat={setChatRepair} perRepairUnread={perRepairUnread} clearRepair={clearRepair} />
          </Panel>
        </div>
      )}

      {activeSection === 'transactions' && (
        <div className={s.tableSection}>
          <Panel title="Transaction History" metaLabel={`${transactions.length} records`}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0 14px',borderBottom:'1px solid rgba(26,188,156,0.08)',marginBottom:4,flexWrap:'wrap',gap:10}}>
              <span style={{color:'rgba(128,144,168,0.8)',fontSize:'0.78rem'}}>{txLoading?'Loading transactions…':transactions.length>0?`${transactions.length} transaction${transactions.length!==1?'s':''} found`:'No transactions yet'}</span>
              <DownloadButton onClick={()=>downloadAllReceipts(transactions.map(t=>getSaleForReceipt(t)))} disabled={txLoading||transactions.length===0} label="Download All (PDF)"/>
            </div>
            {txLoading?(<div className={s.emptyState}><p>Loading transactions…</p></div>):transactions.length===0?(<div className={s.emptyState}><IconEmpty/><p>No transactions found.</p></div>):(
              <table className={s.table}>
                <thead><tr><th>Sale #</th><th>Repair #</th><th>Amount</th><th>Method</th><th>Date</th><th>Receipt</th></tr></thead>
                <tbody>{transactions.map(t=>(<tr key={t.saleId}><td className={s.idCol}>SALE-{String(t.saleId).padStart(4,'0')}</td><td>#{t.requestId}</td><td className={s.bold}>₱{Number(t.amount).toLocaleString('en-PH',{minimumFractionDigits:2})}</td><td>{t.paymentMethod}</td><td className={s.muted}>{fmtDate(t.soldAt)}</td><td><button onClick={()=>downloadReceipt(getSaleForReceipt(t))} style={{background:'transparent',border:'1px solid rgba(26,188,156,0.3)',color:'var(--teal,#1abc9c)',fontSize:'0.72rem',fontWeight:700,padding:'3px 10px',borderRadius:6,cursor:'pointer'}}>PDF</button></td></tr>))}</tbody>
              </table>
            )}
          </Panel>
        </div>
      )}

      {activeSection === 'notifications' && <NotificationsSection />}
      {activeSection === 'help'          && <HelpSection />}
      {activeSection === 'shop'          && <ShopRequestSection />}
    </>
  );
}