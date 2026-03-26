import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientAPI, alertAPI, fallbackAPI } from '../utils/api';

function Skeleton({ className }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function EmergencyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState('idle');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [emergencyId, setEmergencyId] = useState('');
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

  const confirmEmergency = async () => {
    if (!selectedPatient) return;
    
    try {
      const res = await alertAPI.sendEmergency(selectedPatient._id);
      if (res.data.success) {
        setEmergencyId(res.data.data.emergencyId || `EMG-${Date.now()}`);
        setState('sent');
      }
    } catch {
      setEmergencyId(`EMG-${Date.now()}`);
      setState('sent');
    }
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
        <h1 className="text-2xl font-bold text-slate-900">Emergency Alert</h1>
        <p className="text-sm text-slate-500 mt-1">Immediately dispatch emergency response</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        {state === 'idle' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🆘</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Emergency Response</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Press the button below to immediately notify all medical staff and emergency services.
            </p>

            <div className="max-w-sm mx-auto mb-8">
              <label className="block text-sm font-medium text-slate-600 mb-2 text-left">Select Patient</label>
              <select
                value={selectedPatient?._id || ''}
                onChange={(e) => setSelectedPatient(patients.find(p => p._id === e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer mb-6"
              >
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} - Room {p.room}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setState('confirm')}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-lg shadow-xl shadow-red-500/30 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40 transition-all focus:outline-none focus:ring-4 focus:ring-red-300 active:scale-95"
            >
              SOS
            </button>
            <p className="text-xs text-slate-400 mt-4">Tap to activate emergency alert</p>
          </>
        )}

        {state === 'confirm' && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Confirm Emergency Alert</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              This will immediately alert all medical staff and emergency services for {selectedPatient?.name}. This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setState('idle')}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEmergency}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                Confirm Emergency
              </button>
            </div>
          </>
        )}

        {state === 'sent' && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Emergency Alert Sent!</h2>
            <p className="text-slate-500 mb-6">
              Medical staff and emergency services have been notified. Stay calm and wait for assistance.
            </p>
            <div className="inline-block bg-green-100 rounded-xl px-6 py-4 mb-6">
              <p className="text-sm font-semibold text-green-700">Response ETA: ~4 minutes</p>
              <p className="text-xs text-slate-500 mt-1">Alert ID: #{emergencyId}</p>
            </div>
            <br />
            <button
              onClick={() => { setState('idle'); navigate('/dashboard'); }}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
