export function HealthChart({ data, title }) {
  const metrics = [
    { key: 'hr', label: 'Heart Rate', unit: 'bpm', color: 'bg-red-500' },
    { key: 'o2', label: 'Oxygen', unit: '%', color: 'bg-blue-500' },
    { key: 'sbp', label: 'Systolic BP', unit: 'mmHg', color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">{title || 'Weekly Trends'}</h3>
        <div className="flex items-center gap-4">
          {metrics.map((m) => (
            <div key={m.key} className="flex items-center gap-2">
              <div className={`w-3 h-0.5 ${m.color}`} />
              <span className="text-xs text-slate-500">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-1 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: '140px' }}>
              {metrics.map((m) => {
                const max = m.key === 'hr' ? 120 : m.key === 'o2' ? 100 : 180;
                const min = m.key === 'hr' ? 50 : m.key === 'o2' ? 85 : 100;
                const height = ((d[m.key] - min) / (max - min)) * 100;
                return (
                  <div
                    key={m.key}
                    className={`w-full ${m.color} rounded-t opacity-80 hover:opacity-100 transition-opacity`}
                    style={{ height: `${Math.max(5, Math.min(100, height))}%` }}
                  />
                );
              })}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{d.day || d.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
