export function AlertPanel({ alerts }) {
  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warning':
        return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
      default:
        return 'bg-green-50 border-green-200 hover:bg-green-100';
    }
  };

  const getDotColor = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Recent Alerts
        </h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={alert._id || index}
            className={`p-3 rounded-xl border ${getAlertStyles(alert.type)} transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${getDotColor(alert.type)} flex-shrink-0`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {alert.patient?.name || alert.patient}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 font-mono">
                    HR {alert.hr} · O₂ {alert.o2}% · BP {alert.sbp}/{alert.dbp}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 whitespace-nowrap pt-1">
                {alert.ts || 'Just now'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">No recent alerts</p>
          <p className="text-xs text-slate-400 mt-1">All patients are doing well</p>
        </div>
      )}
    </div>
  );
}
