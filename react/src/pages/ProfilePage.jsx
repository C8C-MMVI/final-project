// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import Panel  from '../components/shared/Panel';
import styles from './AdminDashboard.module.css';

export default function ProfilePage() {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [username, setUsername] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [saveErr,  setSaveErr]  = useState('');

  useEffect(() => {
    fetch('/api/session.php', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) {
          setProfile(data);
          setUsername(data.username ?? '');
        } else {
          setError('Could not load profile.');
        }
      })
      .catch(() => setError('Server error.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveErr('');
    try {
      // Uses /api/profile.php — a dedicated self-edit endpoint.
      // update_user.php is admin-only AND blocks self-editing, so it
      // cannot be used here.
      const res  = await fetch('/api/profile.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setProfile(p => ({ ...p, username }));
      } else {
        setSaveErr(data.message ?? 'Update failed.');
      }
    } catch {
      setSaveErr('Server error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.empty}>Loading profile…</div>;
  if (error)   return <div className={styles.errorMsg}>{error}</div>;

  return (
    <div className={styles.section}>
      <div className={styles.sectionPageHeader}>
        <h2 className={styles.sectionTitle}>My Profile</h2>
      </div>

      <Panel title="Account Details">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px', padding: '8px 0' }}>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Username</label>
            <input
              className={styles.formInput}
              value={username}
              onChange={e => { setUsername(e.target.value); setSaved(false); setSaveErr(''); }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              className={styles.formInput}
              type="email"
              value={profile.email ?? '—'}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--muted, rgba(255,255,255,0.4))', marginTop: '4px', display: 'block' }}>
              Email cannot be changed here.
            </span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Role</label>
            <input
              className={styles.formInput}
              value={profile.role ?? '—'}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }}
            />
          </div>

          {saved && (
            <div style={{ fontSize: '0.82rem', color: 'var(--teal, #1abc9c)' }}>
              ✓ Profile updated successfully.
            </div>
          )}
          {saveErr && (
            <div className={styles.formError}>{saveErr}</div>
          )}

          <div>
            <button
              className={styles.btnPrimary}
              onClick={handleSave}
              disabled={saving || !username.trim()}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

        </div>
      </Panel>
    </div>
  );
}