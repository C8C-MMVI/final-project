import { useNavigate } from 'react-router-dom';

// ── Mock data (replace with API calls) ──────────────────────────────────────
const statsData = [
  {
    label: 'Total Users',
    value: '3',
    sub: <><span className="text-teal-400">3 active</span>, <span className="text-gray-400">0 inactive</span></>,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    iconBg: 'bg-teal-500/10 text-teal-400',
  },
  {
    label: 'Registered Shops',
    value: '12',
    sub: <><span className="text-blue-400">2 pending approval</span></>,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    iconBg: 'bg-blue-500/10 text-blue-400',
  },
  {
    label: 'Shop Requests',
    value: '2',
    sub: <span className="text-gray-400">Awaiting review</span>,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    iconBg: 'bg-orange-500/10 text-orange-400',
  },
  {
    label: 'Admin Users',
    value: '1',
    sub: <span className="text-gray-400">Super accounts</span>,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <line x1="19" y1="8" x2="23" y2="8"/><line x1="21" y1="6" x2="21" y2="10"/>
      </svg>
    ),
    iconBg: 'bg-red-500/10 text-red-400',
  },
];

const activityData = [
  { user: 'Maria Santos',   action: 'Registered as customer',    time: '2 min ago'  },
  { user: 'Juan Dela Cruz', action: 'Submitted shop request',     time: '15 min ago' },
  { user: 'Ana Reyes',      action: 'Role changed to Shop Owner', time: '1 hr ago'   },
  { user: 'Pedro Gomez',    action: 'Account deactivated',        time: '2 hr ago'   },
  { user: 'Rosa Cruz',      action: 'Shop request approved',      time: '3 hr ago'   },
];

const shopRequests = [
  { shop: 'QuickFix Center', owner: 'Juan Dela Cruz', location: 'Tuguegarao City', date: 'Mar 20, 2026' },
  { shop: 'GadgetPro Cagayan', owner: 'Liza Tan',    location: 'Cauayan City',    date: 'Mar 19, 2026' },
];

const userOverview = [
  { label: 'Shop Owners', value: '1', color: 'text-teal-400' },
  { label: 'Technicians', value: '0', color: 'text-blue-400' },
  { label: 'Customers',   value: '1', color: 'text-orange-400' },
  { label: 'Admins',      value: '1', color: 'text-red-400' },
];

const recentUsers = [
  { username: 'maria_santos',   phone: '09123456789', role: 'Customer',   status: 'Active',   registered: 'Mar 20, 2026' },
  { username: 'juan_delacruz',  phone: '09234567890', role: 'Technician', status: 'Active',   registered: 'Mar 19, 2026' },
  { username: 'ana_reyes',      phone: '09345678901', role: 'Owner',      status: 'Active',   registered: 'Mar 18, 2026' },
  { username: 'pedro_gomez',    phone: '09456789012', role: 'Customer',   status: 'Inactive', registered: 'Mar 17, 2026' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function roleBadge(role) {
  const map = {
    Owner:      'bg-teal-500/15 text-teal-400',
    Technician: 'bg-blue-500/15 text-blue-400',
    Customer:   'bg-purple-500/15 text-purple-400',
    Admin:      'bg-orange-500/15 text-orange-400',
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[role] ?? 'bg-gray-500/15 text-gray-400'}`}>
      {role}
    </span>
  );
}

function statusBadge(status) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
      status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
    }`}>
      {status}
    </span>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, iconBg }) {
  return (
    <div className="bg-[#0d1f38] border border-teal-900/40 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white font-['Rajdhani',sans-serif]">{value}</div>
      <div className="text-xs">{sub}</div>
    </div>
  );
}

function SectionHeader({ title, linkLabel, onLink }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
      {linkLabel && (
        <button onClick={onLink} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
          {linkLabel}
        </button>
      )}
    </div>
  );
}

function Panel({ children, className = '' }) {
  return (
    <div className={`bg-[#0d1f38] border border-teal-900/40 rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-[#0a1628] flex flex-col gap-5">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsData.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Activity + Shop Requests ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* System Activity */}
        <Panel>
          <div className="px-5 pt-4 pb-2">
            <SectionHeader
              title="System Activity"
              linkLabel="View all logs →"
              onLink={() => navigate('/dashboard/repairs')}
            />
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-teal-900/30">
                <th className="text-left px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">User</th>
                <th className="text-left px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Action</th>
                <th className="text-left px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody>
              {activityData.map((a, i) => (
                <tr key={i} className="border-b border-teal-900/20 last:border-0 hover:bg-teal-900/10 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{a.user}</td>
                  <td className="px-5 py-3 text-gray-300">{a.action}</td>
                  <td className="px-5 py-3 text-gray-500">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        {/* Pending Shop Requests */}
        <Panel>
          <div className="px-5 pt-4 pb-2">
            <SectionHeader
              title="Pending Shop Requests"
              linkLabel="View all →"
              onLink={() => navigate('/dashboard/members')}
            />
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-teal-900/30">
                {['Shop Name', 'Owner', 'Location', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shopRequests.map((r, i) => (
                <tr key={i} className="border-b border-teal-900/20 last:border-0 hover:bg-teal-900/10 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{r.shop}</td>
                  <td className="px-4 py-3 text-gray-300">{r.owner}</td>
                  <td className="px-4 py-3 text-gray-400">{r.location}</td>
                  <td className="px-4 py-3 text-gray-500">{r.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button className="text-[10px] font-semibold px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors border border-emerald-500/20">
                        Approve
                      </button>
                      <button className="text-[10px] font-semibold px-2.5 py-1 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors border border-red-500/20">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

      </div>

      {/* ── User Overview ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">User Overview</span>
          <button
            onClick={() => navigate('/dashboard/members')}
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            Manage all users →
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {userOverview.map((u, i) => (
            <Panel key={i} className="p-5">
              <div className={`text-3xl font-bold font-['Rajdhani',sans-serif] ${u.color}`}>{u.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">{u.label}</div>
            </Panel>
          ))}
        </div>
      </div>

      {/* ── Recently Registered ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Recently Registered</span>
          <button className="text-xs text-teal-400 hover:text-teal-300 transition-colors">View all →</button>
        </div>
        <Panel>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-teal-900/30">
                {['Username', 'Phone', 'Role', 'Status', 'Registered'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u, i) => (
                <tr key={i} className="border-b border-teal-900/20 last:border-0 hover:bg-teal-900/10 transition-colors">
                  <td className="px-5 py-3 font-medium text-teal-400">{u.username}</td>
                  <td className="px-5 py-3 text-gray-300">{u.phone}</td>
                  <td className="px-5 py-3">{roleBadge(u.role)}</td>
                  <td className="px-5 py-3">{statusBadge(u.status)}</td>
                  <td className="px-5 py-3 text-gray-500">{u.registered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

    </main>
  );
}