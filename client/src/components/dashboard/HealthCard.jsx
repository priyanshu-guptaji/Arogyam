export function HealthCard({ icon, label, value, unit, status, trend }) {
  const statusColors = {
    normal: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };

  const statusDots = {
    normal: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
          {icon}
        </div>
        {status && (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
      <div className="text-sm text-slate-500 font-medium mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
      {trend && (
        <div className={`mt-2 text-xs font-medium ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last reading
        </div>
      )}
    </div>
  );
}
