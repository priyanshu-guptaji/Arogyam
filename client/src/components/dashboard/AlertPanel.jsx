import { StatusBadge } from './StatusBadge';

export function AlertPanel({ alerts = [], loading, onAcknowledge, showActions = false }) {
  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
            <div>
              <div className="w-24 h-5 rounded bg-slate-200 animate-pulse mb-1" />
              <div className="w-16 h-4 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
              <div className="flex-1">
                <div className="w-32 h-4 rounded bg-slate-200 animate-pulse mb-1" />
                <div className="w-48 h-3 rounded bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">All Clear</h3>
        <p className="text-sm text-slate-500">No alerts at the moment</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Active Alerts</h3>
            <p className="text-xs text-slate-500">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} pending</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">{formatTime(alerts[0]?.createdAt)}</span>
      </div>

      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert._id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                alert.type === 'Critical' ? 'bg-rose-500' : 
                alert.type === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={alert.type} size="sm" />
                  <span className="text-xs text-slate-400">{formatTime(alert.createdAt)}</span>
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">
                  {alert.patient?.name || 'Patient'}
                </p>
                <p className="text-xs text-slate-500">
                  {alert.message || `HR: ${alert.heartRate} | O₂: ${alert.oxygenLevel}% | BP: ${alert.systolicBP}/${alert.diastolicBP}`}
                </p>
              </div>
              {showActions && (
                <button
                  onClick={() => onAcknowledge?.(alert._id)}
                  className="px-3 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
