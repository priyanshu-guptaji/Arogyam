export function HistoryTable({ data, columns }) {
  const getStatusBadge = (status) => {
    const styles = {
      normal: 'bg-green-100 text-green-700',
      warning: 'bg-amber-100 text-amber-700',
      critical: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.normal}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getValueColor = (value, type) => {
    if (type === 'hr' && value > 100) return 'text-red-600';
    if (type === 'o2' && value < 93) return 'text-red-600';
    if (type === 'sbp' && value > 140) return 'text-red-600';
    return 'text-slate-700';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-slate-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm ${
                      col.type ? getValueColor(row[col.key], col.type) : 'text-slate-700'
                    } ${col.bold ? 'font-medium' : ''}`}
                  >
                    {col.type === 'status' ? (
                      getStatusBadge(row[col.key])
                    ) : col.render ? (
                      col.render(row[col.key], row)
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
