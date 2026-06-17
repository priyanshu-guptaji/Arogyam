import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [clinicId, setClinicId] = useState('');
  const [error, setError] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicId.trim()) {
      setError('Please enter a valid Clinic ID');
      return;
    }
    // Navigate to the public waiting room
    navigate(`/waiting-room/${clinicId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-900 overflow-x-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] -z-10" />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              ClinicFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200"
            >
              Staff Portal
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Register Clinic
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Revolutionizing Indian Healthcare Workflows
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6">
          Say Goodbye to{' '}
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Crowded Waiting Rooms
          </span>{' '}
          and Shouted Names.
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-12">
          Replace paper tokens with a live digital queue manager. Allow neighborhood clinics in India to manage queues with confidence and keep patients updated in real time.
        </p>

        {/* Action Panel */}
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 mb-20">
          {/* Patient Lookup Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-left flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Patient Waiting Room</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Waiting for your turn? Enter your Clinic ID below to view the live dashboard and estimated wait times.
              </p>
            </div>

            <form onSubmit={handleLookup} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Enter Clinic ID (e.g. 6a3228...)"
                  value={clinicId}
                  onChange={(e) => {
                    setClinicId(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/80 transition-all duration-200"
                />
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200"
              >
                Track Live Queue <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Staff Portal Card */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-left flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-300" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Clinic Staff Portal</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Designed for Receptionists and Doctors. Generate patient tokens in under 10 seconds, call patients, and analyze flow metrics.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:scale-[1.01]"
              >
                Sign In as Staff
              </button>
              <button
                onClick={() => navigate('/register')}
                className="w-full py-3 px-4 bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 font-semibold rounded-xl text-sm transition-all duration-200"
              >
                Create New Clinic Account
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="w-full border-t border-slate-900 pt-16 grid sm:grid-cols-3 gap-8 text-left">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-200">10s Receptionist Onboarding</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Add patients and generate auto-incrementing paperless tokens in just three clicks. Simple interface minimizes human errors.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-200">Real-Time Sync without Polls</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Using persistent WebSocket channels, connected patient TVs and mobile waiting rooms sync instantly as soon as a receptionist acts.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-200">Smart Wait Time Estimator</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Wait times are calculated dynamically using the arithmetic mean of the last 50 completed checkups, ensuring high transparency.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600">
        <p>© 2026 ClinicFlow. Supporting healthcare transparency across neighborhood clinics in India.</p>
      </footer>
    </div>
  );
}
export default LandingPage;
