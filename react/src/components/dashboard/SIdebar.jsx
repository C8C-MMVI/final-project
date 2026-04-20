import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = {
  customer: [
    { label: 'Dashboard',    href: '/customer',              icon: '⬡'  },
    { label: 'My Repairs',   href: '/customer/repairs',      icon: '🔧' },
    { label: 'Transactions', href: '/customer/transactions', icon: '💳' },
    { label: 'Track Repair', href: '/customer/track',        icon: '📡' },
  ],
  owner: [
    { label: 'Dashboard',            href: '/owner',                 icon: '⬡'  },
    { label: 'Repairs / Job Orders', href: '/owner/repairs',         icon: '🔧' },
    { label: 'Customers',            href: '/owner/customers',       icon: '👥' },
    { label: 'Reports / Analytics',  href: '/owner/reports',         icon: '📊' },
    { label: 'Member Management',    href: '/owner/members',         icon: '🪪' },
  ],
};

export default function Sidebar({ role = 'customer', open, onClose, collapsed }) {
  const location = useLocation();
  const items    = NAV_ITEMS[role] ?? [];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300',
          'md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        style={{
          width: collapsed ? '72px' : '240px',
          background: 'rgba(10,22,44,0.98)',
          borderRight: '1px solid rgba(26,188,156,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[rgba(26,188,156,0.12)]">
          {!collapsed && (
            <img
              src="/images/Logo.png"
              alt="TechnoLogs"
              className="h-7 w-auto"
              style={{ filter: 'drop-shadow(0 0 6px rgba(26,188,156,0.4))' }}
            />
          )}
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-[6px] border-none cursor-pointer text-[rgba(255,255,255,0.5)] hover:text-teal ml-auto"
            style={{ background: 'transparent' }}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
          {items.map(({ label, href, icon }) => {
            const active = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-[10px] rounded-[10px] no-underline transition-all duration-200"
                style={{
                  background: active ? 'rgba(26,188,156,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(26,188,156,0.25)' : '1px solid transparent',
                }}
              >
                <span className="text-[1.1rem] flex-shrink-0">{icon}</span>
                {!collapsed && (
                  <span
                    className="font-koho text-[0.88rem] font-medium tracking-wide truncate"
                    style={{ color: active ? '#1abc9c' : 'rgba(255,255,255,0.6)' }}
                  >
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-[rgba(26,188,156,0.12)]">
          <a
            href="/api/logout.php"
            className="flex items-center gap-3 px-3 py-[10px] rounded-[10px] no-underline transition-all duration-200 hover:bg-[rgba(255,79,79,0.08)] group"
          >
            <span className="text-[1.1rem]">⏻</span>
            {!collapsed && (
              <span className="font-koho text-[0.88rem] text-[rgba(255,255,255,0.5)] group-hover:text-[#ff4f4f] transition-colors">
                Logout
              </span>
            )}
          </a>
        </div>
      </aside>
    </>
  );
}