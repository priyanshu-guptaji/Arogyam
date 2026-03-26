import { useState } from 'react';

export function AddHealthForm({ patients = [], onSubmit, loading }) {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?._id || '');
  const [form, setForm] = useState({
    heartRate: '',
    oxygenLevel: '',
    systolicBP: '',
    diastolicBP: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedPatient || !form.heartRate || !form.oxygenLevel || !form.systolicBP || !form.diastolicBP) {
      return;
    }

    onSubmit({
      patient: selectedPatient,
      heartRate: parseInt(form.heartRate),
      oxygenLevel: parseFloat(form.oxygenLevel),
      systolicBP: parseInt(form.systolicBP),
      diastolicBP: parseInt(form.diastolicBP)
    });

    setSubmitted(true);
    setForm({ heartRate: '', oxygenLevel: '', systolicBP: '', diastolicBP: '' });
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Add Health Data</h3>
            <p className="text-xs text-slate-500">Record new vital signs</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Select Patient
          </label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          >
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} - Room {p.room}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Heart Rate
            </label>
            <input
              type="number"
              placeholder="bpm"
              value={form.heartRate}
              onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Oxygen Level
            </label>
            <input
              type="number"
              placeholder="%"
              step="0.1"
              value={form.oxygenLevel}
              onChange={(e) => setForm({ ...form, oxygenLevel: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Systolic BP
            </label>
            <input
              type="number"
              placeholder="mmHg"
              value={form.systolicBP}
              onChange={(e) => setForm({ ...form, systolicBP: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Diastolic BP
            </label>
            <input
              type="number"
              placeholder="mmHg"
              value={form.diastolicBP}
              onChange={(e) => setForm({ ...form, diastolicBP: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {submitted && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Health data recorded successfully
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedPatient}
          className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
        >
          {loading ? 'Recording...' : 'Record Health Data'}
        </button>
      </form>
    </div>
  );
}
