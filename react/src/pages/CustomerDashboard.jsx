import { useEffect, useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import QuickStats from '../components/dashboard/QuickStats';
import RepairTimeline from '../components/dashboard/RepairTimeline';
import RepairList from '../components/dashboard/RepairList';
import TransactionList from '../components/dashboard/TransactionList';
import RepairForm from '../components/dashboard/RepairForm';
import { getDashboardData } from '../api/customer';

export default function CustomerDashboard() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [sidebarOpen,     setSidebarOpen]     = useState(false); // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-navy">
      <div
        className="w-10 h-10 rounded-full border-2 border-[rgba(255,255,255,0.2)] border-t-teal"
        style={{ animation: 'spin 0.7s linear infinite' }}
      />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-navy">
      <p className="font-koho text-[#ff4f4f] text-[0.9rem]">⚠ {error}</p>
    </div>
  );

  const initials = (data.username ?? '??').slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-navy">

      <Sidebar
        role="customer"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          username={data.username}
          initials={initials}
          role="Customer"
          onMenuToggle={() => setSidebarOpen(v => !v)}
          collapsed={sidebarCollapsed}
          onCollapseToggle={() => setSidebarCollapsed(v => !v)}
        />

        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6">

          {/* Greeting */}
          <div className="mb-6" style={{ animation: 'fadeUp 0.5s ease both' }}>
            <h2 className="font-koho font-bold text-white text-[1.5rem]">
              Welcome back, <span className="text-teal">{data.username}</span> 👋
            </h2>
            <p className="font-koho text-[rgba(255,255,255,0.45)] text-[0.88rem] mt-1">
              Here's a summary of your repair requests and transactions.
            </p>
          </div>

          {/* Quick Stats */}
          <QuickStats stats={data.stats} />

          {/* Two-column: Repair Form + Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <RepairForm />
            <RepairTimeline
              timeline={data.timeline}
              currentRepair={data.repairs[0] ?? null}
            />
          </div>

          {/* Repair List */}
          <RepairList repairs={data.repairs} />

          {/* Transactions */}
          <TransactionList transactions={data.transactions} />

        </main>
      </div>
    </div>
  );
}