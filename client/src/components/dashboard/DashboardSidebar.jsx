import { Link, useLocation } from 'react-router-dom';

const sidebarConfig = {
  'Care Manager': [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'patients', label: 'Patients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'alerts', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'history', label: 'History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ],
  'Parent': [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'alerts', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'history', label: 'History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'emergency', label: 'Emergency', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', isEmergency: true },
  ],
  'Child': [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'history', label: 'History', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ],
};

function SidebarContent({ items, currentPage, onClose, role }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-800/50">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-none group-hover:text-teal-400 transition-colors">Arogyam</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Health Monitor</div>
          </div>
        </Link>
      </div>

      <div className="p-4">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          {role}
        </span>
      </div>

      <nav className="flex-1 px-3 pb-3 overflow-y-auto">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          const isEmergency = item.isEmergency;
          
          return (
            <Link
              key={item.id}
              to={item.id === 'dashboard' ? '/dashboard' : `/${item.id}`}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${
                isEmergency
                  ? isActive
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/30'
                    : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300'
                  : isActive
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50 mt-auto">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/20">
            <span className="text-xs font-bold text-teal-400">
              {role === 'Care Manager' ? 'CM' : role === 'Parent' ? 'P' : 'C'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500">v1.0</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar({ role, mobile, onClose }) {
  const location = useLocation();
  const items = sidebarConfig[role] || [];

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.includes('patients')) return 'patients';
    if (path.includes('alerts')) return 'alerts';
    if (path.includes('history')) return 'history';
    if (path.includes('emergency')) return 'emergency';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  if (mobile) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-slate-900/90 z-40 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 z-50">
          <SidebarContent items={items} currentPage={currentPage} onClose={onClose} role={role} />
        </aside>
      </>
    );
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-slate-900 z-30">
      <SidebarContent items={items} currentPage={currentPage} role={role} />
    </aside>
  );
}
