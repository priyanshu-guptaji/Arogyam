import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Activity, Users, Clock, AlertCircle, CheckCircle, 
  Trash2, UserPlus, Volume2, Settings, BarChart2, LogOut, Loader2 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { setupSocketListeners } from '../utils/socket';

interface Patient {
  _id: string;
  tokenNumber: number;
  patientName: string;
  phoneNumber: string;
  notes: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  checkInTime: string;
  calledAt?: string;
  completedAt?: string;
  estimatedWaitMinutes: number;
}

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, user, clearAuth } = useAuthStore();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // State
  const [patientName, setPatientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [defaultDuration, setDefaultDuration] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WAITING' | 'HISTORY'>('ALL');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for focusing
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Sync state & check auth
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  const clinicId = user?.clinicId || '';

  // Setup live websocket listener
  useEffect(() => {
    if (clinicId) {
      const cleanup = setupSocketListeners(clinicId, queryClient);
      return cleanup;
    }
  }, [clinicId, queryClient]);

  // Queries
  const { data: clinic, refetch: refetchClinic } = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/settings/clinic`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDefaultDuration(data.data.consultationAverageMinutes);
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch clinic');
    },
    enabled: !!clinicId && !!token
  });

  const { data: queue = [], isLoading: isLoadingQueue } = useQuery<Patient[]>({
    queryKey: ['queue', clinicId],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/queue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch queue');
    },
    enabled: !!clinicId && !!token
  });

  // Mutations
  const addPatientMutation = useMutation({
    mutationFn: async (payload: { patientName: string; phoneNumber?: string; notes?: string }) => {
      const res = await fetch(`${backendUrl}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to add patient');
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['queue', clinicId] });
      setSuccessMessage(`Token #${data.tokenNumber} generated for ${data.patientName}!`);
      // Clear inputs
      setPatientName('');
      setPhoneNumber('');
      setNotes('');
      // Auto focus back on name input for < 10 second workflow
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);

      // Auto clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to add patient');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  });

  const callNextMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${backendUrl}/api/queue/call-next`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to call next');
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['queue', clinicId] });
      if (data) {
        setSuccessMessage(`Now calling Token #${data.tokenNumber}: ${data.patientName}`);
      } else {
        setErrorMessage('No patients are waiting in the queue.');
      }
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (queueId: string) => {
      const res = await fetch(`${backendUrl}/api/queue/${queueId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to complete consultation');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue', clinicId] });
      queryClient.invalidateQueries({ queryKey: ['clinic', clinicId] });
      setSuccessMessage('Consultation marked as completed.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  });

  const skipMutation = useMutation({
    mutationFn: async (queueId: string) => {
      const res = await fetch(`${backendUrl}/api/queue/${queueId}/skip`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to skip patient');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue', clinicId] });
      setSuccessMessage('Patient marked as skipped.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  });

  const updateDurationMutation = useMutation({
    mutationFn: async (minutes: number) => {
      const res = await fetch(`${backendUrl}/api/settings/consultation-time`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ consultationAverageMinutes: minutes })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update duration');
      return data.data;
    },
    onSuccess: () => {
      refetchClinic();
      queryClient.invalidateQueries({ queryKey: ['queue', clinicId] });
      setSuccessMessage('Consultation time setting updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  });

  const resetQueueMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${backendUrl}/api/queue/reset`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to reset queue');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue', clinicId] });
      setSuccessMessage('Queue reset successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  });

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    addPatientMutation.mutate({
      patientName: patientName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  // Filter queue items based on selected tab
  const filteredQueue = queue.filter((item) => {
    if (statusFilter === 'WAITING') {
      return item.status === 'WAITING' || item.status === 'IN_PROGRESS';
    }
    if (statusFilter === 'HISTORY') {
      return item.status === 'COMPLETED' || item.status === 'SKIPPED';
    }
    return true; // ALL
  });

  // Calculate quick stats
  const waitingCount = queue.filter(p => p.status === 'WAITING').length;
  const activeConsultation = queue.find(p => p.status === 'IN_PROGRESS');
  const completedCount = queue.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Banner / Header */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-100">{clinic?.name || 'Loading Clinic...'}</span>
              <span className="text-[10px] text-slate-500 block">ClinicFlow Staff Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/analytics')}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <BarChart2 className="w-4 h-4" />
              Analytics
            </button>
            <a
              href={`/waiting-room/${clinicId}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-teal-400 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Volume2 className="w-4 h-4" />
              TV View
            </a>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-300 block">{user?.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Stat Cards & Add Patient Form */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Quick Stats Header */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 relative overflow-hidden">
              <Clock className="absolute right-3 top-3 w-8 h-8 text-emerald-500/10" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Avg Consultation</span>
              <span className="text-2xl font-bold text-slate-100 block mt-1">{clinic?.consultationAverageMinutes || 10} m</span>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 relative overflow-hidden">
              <Users className="absolute right-3 top-3 w-8 h-8 text-teal-500/10" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Waiting</span>
              <span className="text-2xl font-bold text-slate-100 block mt-1">{waitingCount} patients</span>
            </div>
          </div>

          {/* Quick Add Patient Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">Register Patient (Gen Token)</h3>
            </div>

            <form onSubmit={handleAddPatient} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Patient Name *</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  placeholder="Enter patient full name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Notes / Symptoms (Optional)</label>
                <textarea
                  placeholder="e.g. Mild fever, follow-up, BP check"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl text-sm focus:outline-none transition-all duration-200 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={addPatientMutation.isPending}
                className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                {addPatientMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Generate Token'
                )}
              </button>
            </form>
          </div>

          {/* Active Call Next Banner */}
          <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-2xl p-5 flex flex-col gap-3">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Next in Line</span>
              <h4 className="text-xl font-bold mt-1 text-slate-100">
                {activeConsultation 
                  ? `Active: Token #${activeConsultation.tokenNumber}` 
                  : 'No active consultation'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {activeConsultation 
                  ? `Serving: ${activeConsultation.patientName}` 
                  : waitingCount > 0 
                    ? `${waitingCount} patients waiting to be called`
                    : 'Queue is currently empty'}
              </p>
            </div>
            <button
              onClick={() => callNextMutation.mutate()}
              disabled={waitingCount === 0 || callNextMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:scale-[1.01]"
            >
              {callNextMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Call Next Patient'
              )}
            </button>
          </div>
        </div>

        {/* MIDDLE & RIGHT COLUMNS: Queue Table & Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Messages & Alerts */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Queue List Table */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
            {/* Table Filters */}
            <div className="px-6 py-4 border-b border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  All Daily ({queue.length})
                </button>
                <button
                  onClick={() => setStatusFilter('WAITING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'WAITING'
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Active Queue ({waitingCount + (activeConsultation ? 1 : 0)})
                </button>
                <button
                  onClick={() => setStatusFilter('HISTORY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === 'HISTORY'
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Served ({completedCount + queue.filter(p => p.status === 'SKIPPED').length})
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live updating via Sockets
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              {isLoadingQueue ? (
                <div className="py-20 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  Loading daily queue...
                </div>
              ) : filteredQueue.length === 0 ? (
                <div className="py-20 text-center text-slate-500 text-sm">
                  No patients match this filter.
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/20 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Token</th>
                      <th className="px-6 py-3.5">Patient Details</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Est. Wait</th>
                      <th className="px-6 py-3.5">Check-In</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredQueue.map((item) => {
                      const isCurrent = item.status === 'IN_PROGRESS';
                      const isWaiting = item.status === 'WAITING';

                      return (
                        <tr 
                          key={item._id} 
                          className={`hover:bg-slate-900/20 transition-colors ${
                            isCurrent ? 'bg-emerald-950/10' : ''
                          }`}
                        >
                          {/* Token Number */}
                          <td className="px-6 py-4 font-bold text-slate-200">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                              isCurrent 
                                ? 'bg-emerald-500 text-slate-950' 
                                : isWaiting 
                                  ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                                  : 'bg-slate-950 text-slate-600'
                            }`}>
                              {item.tokenNumber}
                            </div>
                          </td>

                          {/* Patient Info */}
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-200 block text-xs md:text-sm">{item.patientName}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {item.phoneNumber || 'No mobile'} {item.notes && `• ${item.notes}`}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'IN_PROGRESS' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : item.status === 'WAITING' 
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                  : item.status === 'COMPLETED'
                                    ? 'bg-slate-500/10 text-slate-400 border border-slate-800'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/25'
                            }`}>
                              {item.status === 'IN_PROGRESS' 
                                ? 'Serving' 
                                : item.status === 'WAITING'
                                  ? 'Waiting'
                                  : item.status === 'COMPLETED'
                                    ? 'Completed'
                                    : 'Skipped'}
                            </span>
                          </td>

                          {/* Est. Wait time */}
                          <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                            {item.status === 'WAITING' 
                              ? `${item.estimatedWaitMinutes} min` 
                              : item.status === 'IN_PROGRESS'
                                ? 'Now Serving'
                                : '—'}
                          </td>

                          {/* Check-In time */}
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          {/* Table Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isCurrent && (
                                <button
                                  onClick={() => completeMutation.mutate(item._id)}
                                  disabled={completeMutation.isPending}
                                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                              {isWaiting && (
                                <button
                                  onClick={() => skipMutation.mutate(item._id)}
                                  disabled={skipMutation.isPending}
                                  className="px-2.5 py-1.5 bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 hover:text-red-400 text-slate-400 rounded-lg text-xs font-semibold transition-colors"
                                >
                                  Skip
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Average Duration Setting */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5 text-teal-400" />
                  <h4 className="text-sm font-bold text-slate-200">Clinic settings</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Adjust default consultation time. This duration will be used as a fallback if the clinic has fewer than 5 completed consults today.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl text-sm focus:outline-none transition-all duration-200"
                />
                <button
                  onClick={() => updateDurationMutation.mutate(defaultDuration)}
                  disabled={updateDurationMutation.isPending}
                  className="px-4 py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 hover:bg-teal-400"
                >
                  Save Time
                </button>
              </div>
            </div>

            {/* Queue Reset Panel */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <h4 className="text-sm font-bold text-red-400">Danger Zone</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  At the end of clinic hours, reset the queue to skip all remaining patient tokens and reset the daily counter back to 0.
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset today\'s queue? This will skip all active waiting patients.')) {
                    resetQueueMutation.mutate();
                  }
                }}
                disabled={resetQueueMutation.isPending}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                Reset Daily Queue
              </button>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
export default ReceptionistDashboard;
