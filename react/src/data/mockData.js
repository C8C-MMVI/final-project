// ── Repairs ──────────────────────────────────────────────
export const repairs = [
  { id: '#1042', customer: 'Maria Santos',   device: 'iPhone 14',       issue: 'Screen replacement', status: 'progress',  date: 'Mar 15, 2026' },
  { id: '#1041', customer: 'Juan Dela Cruz', device: 'Samsung A54',     issue: 'Battery issue',      status: 'pending',   date: 'Mar 14, 2026' },
  { id: '#1040', customer: 'Ana Reyes',      device: 'Oppo Reno 8',     issue: 'Charging port',      status: 'completed', date: 'Mar 13, 2026' },
  { id: '#1039', customer: 'Pedro Gomez',    device: 'Xiaomi Note 12',  issue: 'Water damage',       status: 'pending',   date: 'Mar 12, 2026' },
  { id: '#1038', customer: 'Rosa Cruz',      device: 'iPhone 13',       issue: 'Camera repair',      status: 'completed', date: 'Mar 11, 2026' },
];

// ── Transactions ─────────────────────────────────────────
export const transactions = [
  { ref: 'TXN-0091', customer: 'Ana Reyes',    item: 'Screen Repair – Oppo Reno 8',  amount: '₱850',   date: 'Today, 2:14 PM',  status: 'paid' },
  { ref: 'TXN-0090', customer: 'Rosa Cruz',    item: 'Camera Repair – iPhone 13',    amount: '₱1,200', date: 'Today, 11:30 AM', status: 'paid' },
  { ref: 'TXN-0089', customer: 'Carlo Mendez', item: 'Tempered Glass + Case',        amount: '₱320',   date: 'Today, 10:05 AM', status: 'paid' },
  { ref: 'TXN-0088', customer: 'Liza Tan',     item: 'Battery Replacement',          amount: '₱650',   date: 'Yesterday',       status: 'paid' },
];

// ── Inventory Alerts ─────────────────────────────────────
export const inventoryAlerts = [
  { title: 'Samsung A54 Battery',  sub: 'Only 2 units left',   type: 'danger' },
  { title: 'iPhone 14 Screen',     sub: 'Only 3 units left',   type: 'warn'   },
  { title: 'USB-C Charging Cable', sub: 'Stock at 5 units',    type: 'warn'   },
  { title: 'Tempered Glass 6.5"',  sub: 'Restock recommended', type: 'info'   },
];

// ── Admin Activity ────────────────────────────────────────
export const adminActivity = [
  { user: 'Maria Santos',   action: 'Registered as customer',    shop: 'TechFix Cagayan', time: '2 min ago',  type: 'user'   },
  { user: 'Juan Dela Cruz', action: 'Submitted repair request',  shop: 'MobilePro Shop',  time: '15 min ago', type: 'repair' },
  { user: 'Ana Reyes',      action: 'Completed job order #1042', shop: 'TechFix Cagayan', time: '1 hr ago',   type: 'done'   },
  { user: 'Pedro Gomez',    action: 'Added inventory item',      shop: 'GadgetCare PH',   time: '2 hr ago',   type: 'stock'  },
  { user: 'Rosa Cruz',      action: 'New shop registered',       shop: 'QuickFix Center', time: '3 hr ago',   type: 'shop'   },
];

// ── Admin Alerts ──────────────────────────────────────────
export const adminAlerts = [
  { title: 'Shop pending approval',   sub: 'QuickFix Center awaiting review', time: '3 hr ago',  type: 'warn'   },
  { title: 'Unusual login detected',  sub: 'User admin@technologs.ph',        time: '5 hr ago',  type: 'danger' },
  { title: 'System backup completed', sub: 'Daily backup at 2:00 AM',         time: '6 hr ago',  type: 'info'   },
  { title: 'New technician added',    sub: 'Carlo Mendez – MobilePro Shop',   time: '1 day ago', type: 'info'   },
];

// ── Customer: My Repairs ──────────────────────────────────
export const myRepairs = [
  { id: '#1042', device: 'iPhone 14',      issue: 'Screen replacement', shop: 'TechFix Cagayan', status: 'progress',  date: 'Mar 15, 2026' },
  { id: '#1035', device: 'Samsung A54',    issue: 'Battery issue',      shop: 'TechFix Cagayan', status: 'completed', date: 'Mar 10, 2026' },
  { id: '#1028', device: 'Oppo Reno 8',    issue: 'Charging port',      shop: 'TechFix Cagayan', status: 'completed', date: 'Feb 28, 2026' },
];

// ── Customer: My Transactions ─────────────────────────────
export const myTransactions = [
  { ref: 'TXN-0091', item: 'Screen Repair – iPhone 14',    amount: '₱850',  date: 'Mar 15, 2026', status: 'paid' },
  { ref: 'TXN-0078', item: 'Battery Replacement – A54',    amount: '₱650',  date: 'Mar 10, 2026', status: 'paid' },
  { ref: 'TXN-0064', item: 'Charging Port – Oppo Reno 8',  amount: '₱450',  date: 'Feb 28, 2026', status: 'paid' },
];

// ── Customer: Repair Timeline ─────────────────────────────
export const repairTimeline = [
  { label: 'Request Submitted',  sub: 'Mar 15, 2026 – 9:00 AM',  status: 'done'    },
  { label: 'Assessed by Tech',   sub: 'Mar 15, 2026 – 10:30 AM', status: 'done'    },
  { label: 'Repair In Progress', sub: 'Mar 15, 2026 – 2:00 PM',  status: 'active'  },
  { label: 'Ready for Pickup',   sub: 'Waiting…',                 status: 'pending' },
  { label: 'Completed',          sub: 'Waiting…',                 status: 'pending' },
];

// ── Nav per role ──────────────────────────────────────────
export const navItems = {
  owner: [
    { section: 'Overview' },
    { label: 'Dashboard',     icon: 'grid',    active: true },
    { label: 'Repair Jobs',   icon: 'wrench'   },
    { label: 'Transactions',  icon: 'peso'     },
    { section: 'Management' },
    { label: 'Staff',         icon: 'user'     },
    { label: 'Customers',     icon: 'users'    },
    { label: 'Inventory',     icon: 'package'  },
    { label: 'Reports',       icon: 'bar'      },
    { section: 'System' },
    { label: 'Settings',      icon: 'settings' },
    { label: 'Logout',        icon: 'logout'   },
  ],
  admin: [
    { section: 'Overview' },
    { label: 'Dashboard',     icon: 'grid',    active: true },
    { label: 'Repair Jobs',   icon: 'wrench'   },
    { label: 'Transactions',  icon: 'peso'     },
    { section: 'Operations' },
    { label: 'Customers',     icon: 'users'    },
    { label: 'Inventory',     icon: 'package'  },
    { section: 'System' },
    { label: 'Settings',      icon: 'settings' },
    { label: 'Logout',        icon: 'logout'   },
  ],
  customer: [
    { section: 'My Account' },
    { label: 'Overview',        icon: 'grid',   active: true },
    { label: 'My Repairs',      icon: 'wrench'  },
    { label: 'My Payments',     icon: 'peso'    },
    { label: 'Notifications',   icon: 'bell'    },
    { section: 'Support' },
    { label: 'Help & FAQs',     icon: 'help'    },
    { label: 'Logout',          icon: 'logout'  },
  ],
};

// ── Quick Actions per role ────────────────────────────────
export const quickActions = {
  owner: [
    { label: 'New Repair Job',    primary: true  },
    { label: 'Receive Payment',   primary: false },
    { label: 'Search Customer',   primary: false },
    { label: 'Print Report',      primary: false },
  ],
  admin: [
    { label: 'New Repair Job',    primary: true  },
    { label: 'Update Status',     primary: false },
    { label: 'Search Customer',   primary: false },
  ],
  customer: [
    { label: 'Contact Us',        primary: true  },
    { label: 'Track Repair',      primary: false },
    { label: 'View Receipt',      primary: false },
  ],
};

// ── Stats per role ────────────────────────────────────────
export const statsData = {
  owner: [
    { label: 'Active Repairs',   value: '14',    sub: '3 due today',       subHighlight: '3',     color: 'orange' },
    { label: 'Completed Today',  value: '6',     sub: '+2 from yesterday', subHighlight: '+2',    color: 'teal'   },
    { label: 'Total Customers',  value: '83',    sub: '+5 this week',      subHighlight: '+5',    color: 'blue'   },
    { label: "Today's Revenue",  value: '₱4.2K', sub: '+18% vs last week', subHighlight: '+18%',  color: 'purple' },
  ],
  admin: [
    { label: 'Total Users',    value: '128',  sub: '+4 this week',       subHighlight: '+4',   color: 'teal'   },
    { label: 'Active Shops',   value: '12',   sub: '2 pending approval', subHighlight: '2',    color: 'blue'   },
    { label: 'Open Repairs',   value: '47',   sub: '8 due today',        subHighlight: '8',    color: 'orange' },
    { label: 'Total Revenue',  value: '₱84K', sub: '+12% this month',    subHighlight: '+12%', color: 'purple' },
  ],
  customer: [
    { label: 'Active Repair',       value: '1',      sub: 'In progress',  subHighlight: '',    color: 'orange' },
    { label: 'Completed Repairs',   value: '2',      sub: 'All time',     subHighlight: '',    color: 'teal'   },
    { label: 'Total Spent',         value: '₱1,950', sub: 'All time',     subHighlight: '',    color: 'blue'   },
  ],
};

navItems.technician = [
  { section: 'Overview' },
  { label: 'Dashboard',  icon: 'grid',    active: true },
  { label: 'My Repairs', icon: 'wrench'   },
  { section: 'System' },
  { label: 'Settings',   icon: 'settings' },
  { label: 'Logout',     icon: 'logout'   },
];
