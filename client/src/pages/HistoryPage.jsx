import { useState, useEffect } from 'react';
import { LineChart } from '../components/LineChart';
import { patientAPI, fallbackAPI, genHistory } from '../utils/api';

function Skeleton({ className }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function HistoryPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [view, setView] = useState('table');
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await patientAPI.getAll();
      if (res.data.success && res.data.data.length > 0) {
        setPatients(res.data.data);
        setSelectedPatient(res.data.data[0]);
      }
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      loadHistory();
    }
  }, [selectedPatient]);

  const loadHistory = async () => {
    try {
      const res = await patientAPI.getPatientHealthHistory(selectedPatient._id);
      if (res.data.success && res.data.data.length > 0) {
        setHistory(res.data.data.reverse());
      } else {
        setHistory(genHistory(selectedPatient._id));
      }
    } catch {
      setHistory(genHistory(selectedPatient._id));
    }
  };

  const perPage = 5;
  const totalPages = Math.ceil(history.length / perPage);
  const pageData = history.slice((page - 1) * perPage, page * perPage);

  const getStatusClass = (s) => {
    switch (s) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'Warning': return 'bg-amber-100 text-amber-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patient History</h1>
        <p className="text-sm text-slate-500 mt-1">Complete health records</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Patient</label>
            <select
              value={selectedPatient?._id || ''}
              onChange={(e) => {
                setSelectedPatient(patients.find(p => p._id === e.target.value));
                setPage(1);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
            >
              {patients.map(p => (
                <option key={p._id} value={p._id}>{p.name} - Room {p.room}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === 'table' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setView('chart')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                view === 'chart' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Chart
            </button>
          </div>
        </div>

        {view === 'chart' ? (
          <div className="animate-fade-in">
            <LineChart 
              data={history} 
              keys={['heartRate', 'oxygenLevel', 'systolicBP']} 
              colors={['#DC2626', '#2563EB', '#9333EA']} 
              labels={['Heart Rate', 'Oxygen %', 'Systolic BP']} 
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">HR</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Oxygen</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sys BP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dia BP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageData.map((row, i) => (
                    <tr key={row._id || i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/50 transition-colors`}>
                      <td className="px-4 py-3 font-medium text-slate-700">{formatDate(row.readingTime || row.date)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {row.readingTime ? new Date(row.readingTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${row.heartRate > 100 || row.heartRate < 50 ? 'text-red-600' : 'text-slate-700'}`}>
                        {row.heartRate || '--'}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${row.oxygenLevel < 92 ? 'text-red-600' : 'text-slate-700'}`}>
                        {row.oxygenLevel || '--'}%
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{row.systolicBP || '--'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{row.diastolicBP || '--'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(row.alertType)}`}>
                          {row.alertType || 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <p className="text-sm text-slate-400">
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, history.length)} of {history.length} records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                      page === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
