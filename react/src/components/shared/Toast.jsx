export default function Toast({ toast }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      left: '50%',
      transform: toast?.show
        ? 'translateX(-50%) translateY(0)'
        : 'translateX(-50%) translateY(80px)',
      opacity: toast?.show ? 1 : 0,
      background: '#fff',
      border: '1px solid rgba(26,188,156,0.18)',
      borderLeft: `3px solid ${toast?.isError || toast?.type === 'error' ? '#ef4444' : '#1abc9c'}`,
      borderRadius: 10,
      padding: '13px 22px',
      fontSize: '0.84rem',
      color: '#0a1c16',
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 32px rgba(13,31,26,0.12)',
      transition: 'transform 0.4s cubic-bezier(0.22,0.68,0,1.1), opacity 0.3s',
      zIndex: 999,
    }}>
      {toast?.message ?? ''}
    </div>
  );
}