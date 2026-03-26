export function HealthCard({ label, value, unit, icon, trend, alertType }) {
  const getTrendColor = () => {
    if (alertType === 'Critical') return 'text-rose-500';
    if (alertType === 'Warning') return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getIconBg = () => {
    if (alertType === 'Critical') return 'bg-rose-100 text-rose-600';
    if (alertType === 'Warning') return 'bg-amber-100 text-amber-600';
    return 'bg-teal-100 text-teal-600';
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${getIconBg()} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${getTrendColor()}`}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-bold ${alertType === 'Critical' ? 'text-rose-700' : alertType === 'Warning' ? 'text-amber-700' : 'text-slate-900'}`}>
            {value || '--'}
          </span>
          <span className="text-sm text-slate-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export function HealthCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse" />
        <div className="w-12 h-4 rounded bg-slate-200 animate-pulse" />
      </div>
      <div>
        <div className="w-20 h-4 rounded bg-slate-200 animate-pulse mb-2" />
        <div className="w-16 h-8 rounded bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}
