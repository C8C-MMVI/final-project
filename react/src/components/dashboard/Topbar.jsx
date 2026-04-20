import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  // Customer routes
  '/customer':              'Dashboard',
  '/customer/repairs':      'My Repairs',
  '/customer/transactions': 'Transactions',
  '/customer/track':        'Track Repair',

  // Owner routes
  '/owner':             'Dashboard',
  '/owner/repairs':     'Repairs / Job Orders',
  '/owner/customers':   'Customers',
  '/owner/reports':     'Reports / Analytics',
  '/owner/members':     'Member Management',
};

export default function Topbar({ username, initials, role, onMenuToggle, collapsed, onCollapseToggle }) {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(10,22,44,0.9)',
        borderBottom: '1px solid rgba(26,188,156,0.12)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-[2px] bg-teal rounded-full" />
          <span className="block w-5 h-[2px] bg-teal rounded-full" />
          <span className="block w-5 h-[2px] bg-teal rounded-full" />
        </button>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onCollapseToggle}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-[6px] border-none cursor-pointer transition-all duration-200 hover:bg-[rgba(26,188,156,0.1)] text-[rgba(255,255,255,0.5)] hover:text-teal"
          style={{ background: 'transparent' }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? '›' : '‹'}
        </button>

        {/* Page title */}
        <div>
          <h1 className="font-koho font-bold text-white text-[1.1rem] leading-tight">
            {pageTitle}
          </h1>
          <p className="font-koho text-[rgba(255,255,255,0.4)] text-[0.75rem] tracking-wide capitalize">
            {role}
          </p>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="font-koho text-white text-[0.88rem] font-medium">{username}</p>
          <p className="font-koho text-[rgba(255,255,255,0.4)] text-[0.75rem] capitalize">{role}</p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-rajdhani font-bold text-[0.85rem] text-white flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0ea882, #1abc9c)',
            boxShadow: '0 0 12px rgba(26,188,156,0.4)',
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}