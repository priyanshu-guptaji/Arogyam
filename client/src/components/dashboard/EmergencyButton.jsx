import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function EmergencyButton({ patients = [], onEmergency, loading }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?._id || '');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    
    await onEmergency?.(selectedPatient, notes);
    setSent(true);
    
    setTimeout(() => {
      setShowModal(false);
      setSent(false);
      setNotes('');
      navigate('/emergency');
    }, 2000);
  };

  if (showModal) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Emergency Alert Sent</h2>
              <p className="text-slate-600">Medical staff has been notified. Help is on the way.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirm Emergency</h2>
                <p className="text-slate-600">This will alert all medical staff immediately.</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Select Patient
                  </label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  >
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} - Room {p.room}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe the emergency situation..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold rounded-xl hover:from-rose-700 hover:to-red-700 transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Alert'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowModal(true)}
      className="w-full py-6 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-2xl hover:from-rose-700 hover:to-red-700 transition-all shadow-xl shadow-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/40 active:scale-[0.98] flex items-center justify-center gap-3"
    >
      <svg className="w-7 h-7 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      EMERGENCY
    </button>
  );
}
