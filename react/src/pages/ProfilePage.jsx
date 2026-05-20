// src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import Panel from '../components/shared/Panel';
import styles from './AdminDashboard.module.css';

const AVATAR_PLACEHOLDER = null;

function AvatarUploader({ current, name, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(current ?? null);

  useEffect(() => { setPreview(current ?? null); }, [current]);

  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Photo must be under 2 MB.'); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: 72, height: 72, borderRadius: '50%', overflow: 'hidden',
          cursor: 'pointer', border: '2px solid rgba(13,31,26,0.12)',
          flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(13,31,26,0.06)', position: 'relative',
        }}
        title="Click to change photo"
      >
        {preview ? (
          <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 22, fontWeight: 500, color: 'rgba(13,31,26,0.5)', userSelect: 'none' }}>
            {initials}
          </span>
        )}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,0.35)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', opacity: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      </div>
      <div>
        <button
          type="button"
          style={{
            fontSize: '0.8rem', padding: '6px 14px', borderRadius: 6,
            border: '1px solid rgba(13,31,26,0.18)', background: 'transparent',
            cursor: 'pointer', color: 'inherit', marginBottom: 4, display: 'block',
          }}
          onClick={() => inputRef.current?.click()}
        >
          Upload photo
        </button>
        <span style={{ fontSize: '0.72rem', color: 'rgba(13,31,26,0.4)' }}>
          JPG or PNG, max 2 MB
        </span>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

function FieldRow({ label, children, hint }) {
  return (
    <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label className={styles.formLabel} style={{ fontSize: '0.82rem', fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {hint && (
        <span style={{ fontSize: '0.72rem', color: 'rgba(13,31,26,0.4)', marginTop: 2 }}>{hint}</span>
      )}
    </div>
  );
}

function StatusMsg({ type, text }) {
  if (!text) return null;
  const colors = {
    success: { color: '#0e7a5a', background: 'rgba(26,188,156,0.08)', border: 'rgba(26,188,156,0.25)' },
    error:   { color: '#c0392b', background: 'rgba(192,57,43,0.07)',  border: 'rgba(192,57,43,0.2)'  },
  };
  const c = colors[type] ?? colors.error;
  return (
    <div style={{
      fontSize: '0.82rem', fontWeight: 500, padding: '8px 12px',
      borderRadius: 6, border: `1px solid ${c.border}`,
      background: c.background, color: c.color,
    }}>
      {type === 'success' ? '✓ ' : '✕ '}{text}
    </div>
  );
}

export default function ProfilePage({ onProfileUpdate }) {
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchErr,   setFetchErr]   = useState('');

  const [username,   setUsername]   = useState('');
  const [contact,    setContact]    = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoStatus, setInfoStatus] = useState({ type: '', text: '' });

  const [oldPw,      setOldPw]      = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwStatus,   setPwStatus]   = useState({ type: '', text: '' });

  useEffect(() => {
    fetch('/api/session.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) {
          setProfile(data);
          setUsername(data.username ?? '');
          setContact(data.contact  ?? '');
        } else {
          setFetchErr('Could not load profile.');
        }
      })
      .catch(() => setFetchErr('Server error.'))
      .finally(() => setLoading(false));
  }, []);

  const handleInfoSave = async () => {
    setInfoSaving(true);
    setInfoStatus({ type: '', text: '' });
    try {
      let body; let headers = {};
      if (avatarFile) {
        const fd = new FormData();
        fd.append('username', username);
        fd.append('contact',  contact);
        fd.append('avatar',   avatarFile);
        body = fd;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ username, contact });
      }
      const res  = await fetch('/api/profile.php', { method: 'POST', credentials: 'include', headers, body });
      const data = await res.json();
      if (data.success) {
        setInfoStatus({ type: 'success', text: 'Profile updated.' });
        const newAvatar = data.avatar_url ?? profile?.avatar ?? null;
        setProfile(p => ({ ...p, username, contact, avatar: newAvatar }));
        setAvatarFile(null);
        onProfileUpdate?.(username, data.avatar_url ?? null);
      } else {
        setInfoStatus({ type: 'error', text: data.message ?? 'Update failed.' });
      }
    } catch {
      setInfoStatus({ type: 'error', text: 'Server error.' });
    } finally {
      setInfoSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPwStatus({ type: '', text: '' });
    if (!oldPw || !newPw || !confirmPw) { setPwStatus({ type: 'error', text: 'All password fields are required.' }); return; }
    if (newPw.length < 8) { setPwStatus({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
    if (newPw !== confirmPw) { setPwStatus({ type: 'error', text: 'New password and confirmation do not match.' }); return; }
    setPwSaving(true);
    try {
      const res  = await fetch('/api/profile.php', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', old_password: oldPw, new_password: newPw }),
      });
      const data = await res.json();
      if (data.success) {
        setPwStatus({ type: 'success', text: 'Password changed successfully.' });
        setOldPw(''); setNewPw(''); setConfirmPw('');
      } else {
        setPwStatus({ type: 'error', text: data.message ?? 'Password change failed.' });
      }
    } catch {
      setPwStatus({ type: 'error', text: 'Server error.' });
    } finally {
      setPwSaving(false);
    }
  };

  const infoChanged = username.trim() !== (profile?.username ?? '')
    || contact.trim() !== (profile?.contact ?? '')
    || avatarFile !== null;

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {showPw
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );

  const pwInputStyle = { width: '100%', boxSizing: 'border-box', paddingRight: 40 };
  const wrapStyle    = { position: 'relative', display: 'flex', alignItems: 'center' };
  const eyeStyle     = {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(13,31,26,0.4)', padding: 0, display: 'flex',
  };

  if (loading) return <div style={{ color: 'rgba(13,31,26,0.4)', padding: 40 }}>Loading profile…</div>;
  if (fetchErr) return <div style={{ padding: 40, color: '#c0392b' }}>{fetchErr}</div>;

  return (
    <div className={styles.section}>
      {/* profileGrid is already defined in AdminDashboard.module.css
          and collapses to 1 column on mobile via the media query we added */}
      <div className={styles.profileGrid}>

        <Panel title="Account Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '16px' }}>
            <AvatarUploader
              current={profile?.avatar ?? AVATAR_PLACEHOLDER}
              name={username || profile?.email}
              onChange={file => { setAvatarFile(file); setInfoStatus({ type: '', text: '' }); }}
            />
            <FieldRow label="Display name">
              <input
                className={styles.formInput}
                value={username}
                placeholder="Your display name"
                onChange={e => { setUsername(e.target.value); setInfoStatus({ type: '', text: '' }); }}
              />
            </FieldRow>
            <FieldRow label="Email" hint="Email cannot be changed here.">
              <input
                className={styles.formInput}
                type="email"
                value={profile?.email ?? '—'}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </FieldRow>
            <FieldRow label="Contact number">
              <input
                className={styles.formInput}
                type="tel"
                value={contact}
                placeholder="+63 9XX XXX XXXX"
                onChange={e => { setContact(e.target.value); setInfoStatus({ type: '', text: '' }); }}
              />
            </FieldRow>
            <FieldRow label="Role">
              <input
                className={styles.formInput}
                value={profile?.role ?? '—'}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed', textTransform: 'capitalize' }}
              />
            </FieldRow>
            <StatusMsg type={infoStatus.type} text={infoStatus.text} />
            <div>
              <button
                className={styles.btnPrimary}
                onClick={handleInfoSave}
                disabled={infoSaving || !infoChanged || !username.trim()}
                style={{ width: '100%' }}
              >
                {infoSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Change Password">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px' }}>
            <FieldRow label="Current password">
              <div style={wrapStyle}>
                <input
                  className={styles.formInput}
                  type={showPw ? 'text' : 'password'}
                  value={oldPw}
                  placeholder="Enter current password"
                  style={pwInputStyle}
                  onChange={e => { setOldPw(e.target.value); setPwStatus({ type: '', text: '' }); }}
                />
                <button style={eyeStyle} type="button" onClick={() => setShowPw(v => !v)}>
                  <EyeIcon />
                </button>
              </div>
            </FieldRow>
            <FieldRow label="New password" hint="Minimum 8 characters.">
              <div style={wrapStyle}>
                <input
                  className={styles.formInput}
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  placeholder="New password"
                  style={pwInputStyle}
                  onChange={e => { setNewPw(e.target.value); setPwStatus({ type: '', text: '' }); }}
                />
              </div>
            </FieldRow>
            <FieldRow label="Confirm new password">
              <div style={wrapStyle}>
                <input
                  className={styles.formInput}
                  type={showPw ? 'text' : 'password'}
                  value={confirmPw}
                  placeholder="Repeat new password"
                  style={pwInputStyle}
                  onChange={e => { setConfirmPw(e.target.value); setPwStatus({ type: '', text: '' }); }}
                />
              </div>
            </FieldRow>
            {newPw && confirmPw && newPw !== confirmPw && (
              <span style={{ fontSize: '0.75rem', color: '#c0392b' }}>Passwords do not match.</span>
            )}
            {newPw && newPw.length > 0 && newPw.length < 8 && (
              <span style={{ fontSize: '0.75rem', color: '#c0392b' }}>Must be at least 8 characters.</span>
            )}
            <StatusMsg type={pwStatus.type} text={pwStatus.text} />
            <div>
              <button
                className={styles.btnPrimary}
                onClick={handlePasswordSave}
                disabled={pwSaving || !oldPw || !newPw || !confirmPw}
                style={{ width: '100%' }}
              >
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </Panel>

      </div>
    </div>
  );
}