import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, Building, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AuthPageProps {
  register?: boolean;
}

export function AuthPage({ register: isRegisterMode = false }: AuthPageProps) {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [isRegister, setIsRegister] = useState(isRegisterMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Receptionist'>('Receptionist');
  const [clinicName, setClinicName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Sync state if prop changes
  useEffect(() => {
    setIsRegister(isRegisterMode);
  }, [isRegisterMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister 
      ? { name, email, password, role, clinicName: clinicName || undefined, phone }
      : { email, password };

    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Save auth state
      setAuth(data.data.token, data.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative font-sans">
      {/* Background blur effects */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] -z-10" />

      {/* Main card wrapper */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Top-left Back CTA */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Branding header */}
        <div className="text-center mt-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            ClinicFlow Staff Portal
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            {isRegister ? 'Set up your clinic queue manager' : 'Manage your live clinic queue'}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed animate-shake">
            {error}
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold pl-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    required
                    placeholder="Dr. Rajesh Sharma or Priya Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold pl-1">Mobile Number (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Clinic Name */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold pl-1">Clinic Name (Optional)</label>
                <div className="relative">
                  <Building className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    placeholder="Arogya Dental Clinic"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Portal Role Selection */}
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold pl-1">Role *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('Receptionist')}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      role === 'Receptionist'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Receptionist
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Admin')}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      role === 'Admin'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Doctor (Admin)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold pl-1">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
              <input
                type="email"
                required
                placeholder="staff@clinicflow.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-semibold pl-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isRegister ? 'Registering...' : 'Signing In...'}
              </>
            ) : isRegister ? (
              'Create Staff Account'
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Registration toggle */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            {isRegister ? 'Already have a staff account?' : 'Setting up a new clinic?'}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 hover:underline transition-colors duration-150"
            >
              {isRegister ? 'Sign In' : 'Register Clinic'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
export default AuthPage;
