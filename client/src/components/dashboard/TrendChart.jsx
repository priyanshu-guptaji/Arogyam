export function TrendChart({ data = [], loading, title = 'Health Trends', patientName }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="w-40 h-5 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="w-full h-48 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No Data Yet</h3>
        <p className="text-sm text-slate-500">Health trends will appear here</p>
      </div>
    );
  }

  const allValues = [
    ...data.map(d => d.heartRate),
    ...data.map(d => d.oxygenLevel),
    ...data.map(d => d.systolicBP)
  ].filter(v => v !== undefined);

  const minVal = Math.min(...allValues) - 10;
  const maxVal = Math.max(...allValues) + 10;
  const range = maxVal - minVal || 1;

  const width = 600;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (i) => padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
  const getY = (v) => padding.top + chartHeight - ((v - minVal) / range) * chartHeight;

  const hrPoints = data.map((d, i) => `${getX(i)},${getY(d.heartRate)}`).join(' ');
  const o2Points = data.map((d, i) => `${getX(i)},${getY(d.oxygenLevel)}`).join(' ');
  const bpPoints = data.map((d, i) => `${getX(i)},${getY(d.systolicBP)}`).join(' ');

  const hrArea = `M${getX(0)},${getY(data[0]?.heartRate)} ` + 
    data.slice(1).map((d, i) => `L${getX(i+1)},${getY(d.heartRate)}`).join(' ') +
    ` L${getX(data.length-1)},${height - padding.bottom} L${getX(0)},${height - padding.bottom} Z`;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {patientName && <p className="text-xs text-slate-500">{patientName}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-rose-500" />
            <span className="text-xs text-slate-500">HR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-teal-500" />
            <span className="text-xs text-slate-500">O₂</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded bg-violet-500" />
            <span className="text-xs text-slate-500">BP</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + t * chartHeight;
          const val = Math.round(maxVal - t * range);
          return (
            <g key={t}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {val}
              </text>
            </g>
          );
        })}

        <polyline points={hrPoints} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={o2Points} fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={bpPoints} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinejoin="round" />

        {data.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.heartRate)} r="3" fill="#fff" stroke="#f43f5e" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.oxygenLevel)} r="3" fill="#fff" stroke="#14b8a6" strokeWidth="2" />
            <circle cx={getX(i)} cy={getY(d.systolicBP)} r="3" fill="#fff" stroke="#8b5cf6" strokeWidth="2" />
          </g>
        ))}

        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
          >
            {formatDate(d.readingTime || d.date)}
          </text>
        ))}
      </svg>
    </div>
  );
}
