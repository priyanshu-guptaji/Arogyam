import { useState, useEffect } from 'react';
import { alertAPI, fallbackAPI } from '../utils/api';

function Skeleton({ className }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function AlertsPage() {
  const [filter, setFilter] = useState('All');
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ Critical: 0, Warning: 0, Normal: 0, Emergency: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await alertAPI.getAll();
      if (res.data.success) {
        setAlerts(res.data.data);
        setStats(res.data.stats || {});
      }
    } catch {
      setStats({ Critical: 0, Warning: 0, Normal: 0, Emergency: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.type === filter);

  const formatTime = (date) => {
    if (!date) return 'Just now';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return d.toLocaleDateString();
  };

  const getStatusClass = (type) => {
    switch (type) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'Warning': return 'bg-amber-100 text-amber-700';
      case 'Emergency': return 'bg-red-100 text-red-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const getDotColor = (type) => {
    switch (type) {
      case 'Critical':
      case 'Emergency': return 'bg-red-500';
      case 'Warning': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-28" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alerts Center</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time patient health alerts</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Critical', count: stats.Critical || 0, color: 'red' },
          { label: 'Warning', count: stats.Warning || 0, color: 'amber' },
          { label: 'Normal', count: stats.Normal || 0, color: 'green' },
          { label: 'Emergency', count: stats.Emergency || 0, color: 'red' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 border border-slate-200">
            <div className={`w-2 h-2 rounded-full bg-${b.color}-500`} />
            <span className="text-xl font-bold text-slate-900">{b.count}</span>
            <span className="text-sm text-slate-500">{b.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-2">
            {['All', 'Critical', 'Warning', 'Normal', 'Emergency'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Heart Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Oxygen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Blood Pressure</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Alert Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a, i) => (
                <tr key={a._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/50 transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{a.patient?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">Room {a.patient?.room || '--'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={a.heartRate > 100 || a.heartRate < 50 ? 'text-red-600 font-semibold' : 'text-slate-700 font-semibold'}>
                      {a.heartRate || '--'} bpm
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={a.oxygenLevel < 92 ? 'text-red-600 font-semibold' : 'text-slate-700 font-semibold'}>
                      {a.oxygenLevel || '--'}%
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {a.systolicBP || '--'}/{a.diastolicBP || '--'} mmHg
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(a.type)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(a.type)}`} />
                      {a.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">
                    {formatTime(a.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No alerts for this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
