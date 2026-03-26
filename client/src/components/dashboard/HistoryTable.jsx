import { StatusBadge } from './StatusBadge';

export function HistoryTable({ records = [], loading, showPatient = false }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="w-32 h-5 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-20 h-4 rounded bg-slate-200 animate-pulse" />
                <div className="w-16 h-4 rounded bg-slate-200 animate-pulse" />
                <div className="w-12 h-4 rounded bg-slate-200 animate-pulse" />
                <div className="w-12 h-4 rounded bg-slate-200 animate-pulse" />
                <div className="flex-1" />
                <div className="w-16 h-4 rounded bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No Records</h3>
        <p className="text-sm text-slate-500">Health records will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Health History</h3>
            <p className="text-xs text-slate-500">{records.length} record{records.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {showPatient && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">HR</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">O₂</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">BP</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record, index) => (
              <tr key={record._id || index} className="hover:bg-slate-50/50 transition-colors">
                {showPatient && (
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{record.patient?.name || '-'}</div>
                    <div className="text-xs text-slate-500">Room {record.patient?.room || '-'}</div>
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-slate-700">
                  {formatDate(record.readingTime || record.date)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {formatTime(record.readingTime || record.date)}
                </td>
                <td className={`px-4 py-3 font-semibold ${
                  record.heartRate > 100 || record.heartRate < 50 ? 'text-rose-600' : 'text-slate-700'
                }`}>
                  {record.heartRate || '-'}
                </td>
                <td className={`px-4 py-3 font-semibold ${
                  record.oxygenLevel < 92 ? 'text-rose-600' : 'text-slate-700'
                }`}>
                  {record.oxygenLevel || '-'}%
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {record.systolicBP || '-'}/{record.diastolicBP || '-'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={record.alertType || 'Normal'} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
