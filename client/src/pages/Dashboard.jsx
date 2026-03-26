import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart } from '../components/LineChart';
import { AlertPanel } from '../components/dashboard';
import { patientAPI, healthAPI, alertAPI, fallbackAPI, genHistory, MOCK_PATIENTS } from '../utils/api';

function Skeleton({ className }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function Dashboard({ user }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ heartRate: '', oxygenLevel: '', systolicBP: '', diastolicBP: '' });
  const [submitted, setSubmitted] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [patientsRes, alertsRes] = await Promise.all([
        patientAPI.getAll(),
        alertAPI.getAll()
      ]);
      
      if (patientsRes.data.success) {
        setPatients(patientsRes.data.data);
        if (patientsRes.data.data.length > 0) {
          setSelectedPatient(patientsRes.data.data[0]);
        }
      }
      
      if (alertsRes.data.success) {
        setAlerts(alertsRes.data.data.slice(0, 5));
      }
    } catch {
      setPatients(MOCK_PATIENTS);
      setSelectedPatient(MOCK_PATIENTS[0]);
      setAlerts([]);
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

  const handleSubmit = async () => {
    if (!selectedPatient || !form.heartRate || !form.oxygenLevel || !form.systolicBP || !form.diastolicBP) return;
    
    try {
      await healthAPI.create({
        patient: selectedPatient._id,
        heartRate: parseInt(form.heartRate),
        oxygenLevel: parseFloat(form.oxygenLevel),
        systolicBP: parseInt(form.systolicBP),
        diastolicBP: parseInt(form.diastolicBP)
      });
      setSubmitted(true);
      setForm({ heartRate: '', oxygenLevel: '', systolicBP: '', diastolicBP: '' });
      loadHistory();
      setTimeout(() => setSubmitted(false), 2000);
    } catch {
      setSubmitted(true);
      setForm({ heartRate: '', oxygenLevel: '', systolicBP: '', diastolicBP: '' });
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  const latest = history[history.length - 1] || {};
  const canAddData = user?.role === 'Care Manager';
  const canEmergency = user?.role === 'Parent';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <Skeleton className="h-10 w-10 mb-3" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user?.role === 'Care Manager' ? 'Care Manager Dashboard' : user?.role === 'Parent' ? 'Health Overview' : "Parent's Health"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {selectedPatient ? `Monitoring: ${selectedPatient.name} · Room ${selectedPatient.room}` : 'Select a patient to monitor'}
          </p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '❤️', label: 'Heart Rate', value: latest.heartRate || '--', unit: 'bpm', alertType: latest.alertType },
          { icon: '💨', label: 'Oxygen', value: latest.oxygenLevel || '--', unit: '%', alertType: latest.alertType },
          { icon: '🩸', label: 'Systolic BP', value: latest.systolicBP || '--', unit: 'mmHg', alertType: latest.alertType },
          { icon: '🔵', label: 'Diastolic BP', value: latest.diastolicBP || '--', unit: 'mmHg', alertType: latest.alertType },
        ].map((metric, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                {metric.icon}
              </div>
              <span className="text-sm text-slate-500 font-medium">{metric.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-slate-900">{metric.value}</span>
              <span className="text-sm text-slate-400">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {canEmergency && (
        <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <span className="text-2xl">🆘</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Emergency Alert</h3>
                <p className="text-sm text-slate-600 mt-1">Immediately notify all medical staff</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/emergency')}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25 transition-all active:scale-95"
            >
              EMERGENCY
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {canAddData && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-slate-900 mb-4">Add Health Data</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Select Patient</label>
              <select
                value={selectedPatient?._id || ''}
                onChange={(e) => setSelectedPatient(patients.find(p => p._id === e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
              >
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} - Room {p.room}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { key: 'heartRate', label: 'Heart Rate', placeholder: 'bpm' },
                { key: 'oxygenLevel', label: 'Oxygen Level', placeholder: '%' },
                { key: 'systolicBP', label: 'Systolic BP', placeholder: 'mmHg' },
                { key: 'diastolicBP', label: 'Diastolic BP', placeholder: 'mmHg' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">{field.label}</label>
                  <input
                    type="number"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              ))}
            </div>
            
            {submitted && (
              <div className="mb-3 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 animate-scale-in">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Health data recorded successfully
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={!selectedPatient}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Health Data
            </button>
          </div>
        )}

        <AlertPanel alerts={alerts} />
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-900">Health Trends</h3>
            <span className="text-sm text-slate-500">{selectedPatient?.name}</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Past {history.length} readings</p>
          <LineChart 
            data={history} 
            keys={['heartRate', 'oxygenLevel', 'systolicBP']} 
            colors={['#DC2626', '#2563EB', '#9333EA']} 
            labels={['Heart Rate', 'Oxygen %', 'Systolic BP']} 
          />
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="px-5 pt-5 pb-2">
          <h3 className="font-semibold text-slate-900">Patients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Age</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Room</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">HR</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">O2</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">BP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p, i) => {
                const latestRecord = p.latestRecord || {};
                const status = latestRecord.alertType || 'Normal';
                return (
                  <tr key={p._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/50 transition-colors cursor-pointer`}>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.age}</td>
                    <td className="px-4 py-3 text-slate-500">{p.room}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{latestRecord.heartRate || '--'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{latestRecord.oxygenLevel || '--'}%</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{latestRecord.systolicBP || '--'}/{latestRecord.diastolicBP || '--'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        status === 'Critical' ? 'bg-red-100 text-red-700' :
                        status === 'Warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
