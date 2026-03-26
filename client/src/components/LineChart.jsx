import { C } from '../utils/theme';

export function LineChart({ data, keys, colors, labels }) {
  const W = 540, H = 160, pad = 32;
  const allVals = keys.flatMap((k) => data.map((d) => d[k]));
  const min = Math.min(...allVals) - 5;
  const max = Math.max(...allVals) + 5;
  const xs = data.map((_, i) => pad + (i * (W - pad * 2)) / Math.max(data.length - 1, 1));
  const y = (v) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        {keys.map((k, ki) => (
          <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[ki]} stopOpacity="0.18" />
            <stop offset="100%" stopColor={colors[ki]} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line
          key={t}
          x1={pad} y1={pad + t * (H - pad * 2)}
          x2={W - pad} y2={pad + t * (H - pad * 2)}
          stroke={C.gray200} strokeWidth="1"
        />
      ))}

      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H - 6} textAnchor="middle"
          fontSize="10" fill={C.gray400} fontFamily="'DM Sans', sans-serif">
          {d.date}
        </text>
      ))}

      {keys.map((k, ki) => {
        const pts = data.map((d, i) => `${xs[i]},${y(d[k])}`);
        const area = `M${xs[0]},${y(data[0][k])} ` + data.slice(1).map((d, i) => `L${xs[i+1]},${y(d[k])}`).join(" ") +
          ` L${xs[xs.length-1]},${H-pad} L${xs[0]},${H-pad} Z`;
        return (
          <g key={k}>
            <path d={area} fill={`url(#grad-${k})`} />
            <polyline points={pts.join(" ")} fill="none"
              stroke={colors[ki]} strokeWidth="2" strokeLinejoin="round" />
            {data.map((d, i) => (
              <circle key={i} cx={xs[i]} cy={y(d[k])} r="3"
                fill={C.white} stroke={colors[ki]} strokeWidth="2" />
            ))}
          </g>
        );
      })}

      {keys.map((k, ki) => (
        <g key={k} transform={`translate(${pad + ki * 120}, 14)`}>
          <rect x="0" y="-7" width="12" height="3" rx="1.5" fill={colors[ki]} />
          <text x="16" y="0" fontSize="10" fill={C.gray500} fontFamily="'DM Sans', sans-serif">
            {labels[ki]}
          </text>
        </g>
      ))}
    </svg>
  );
}
