import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  Activity, Users, Clock, AlertTriangle, CheckCircle, 
  TrendingUp, ArrowLeft, Loader2, Calendar 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AnalyticsData {
  servedToday: number;
  avgConsultationTime: number;
  longestWaitTime: number;
  currentQueueSize: number;
  skippedTodayCount: number;
  hourlyThroughput: { hour: string; patients: number }[];
}

export function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Check auth
  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  const clinicId = user?.clinicId || '';

  // Fetch analytics data
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics', clinicId],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        return json.data;
      }
      throw new Error(json.message || 'Failed to fetch analytics');
    },
    enabled: !!clinicId && !!token
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-sm font-semibold text-slate-400">Loading clinic flow metrics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold mb-2">Analytics Load Failed</h2>
        <p className="text-xs text-slate-400 mb-6">{error instanceof Error ? error.message : 'Error fetching analytics'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {/* Background lights */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-5 w-[1px] bg-slate-800" />
            <div>
              <span className="text-sm font-bold text-slate-200">Clinic Analytics</span>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Performance metrics</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/40 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today's Log</span>
          </div>
        </div>
      </header>

      {/* Main Stats Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Core Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {/* Served Today */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <CheckCircle className="absolute right-3.5 top-3.5 w-6 h-6 text-emerald-500/10" />
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Served Today</span>
            <span className="text-3xl font-extrabold text-slate-100 block mt-2">{data.servedToday}</span>
            <span className="text-[9px] text-emerald-400 block mt-2 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Completed
            </span>
          </div>

          {/* Average Consultation Duration */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <Clock className="absolute right-3.5 top-3.5 w-6 h-6 text-teal-500/10" />
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Avg Duration</span>
            <span className="text-3xl font-extrabold text-slate-100 block mt-2">{data.avgConsultationTime} m</span>
            <span className="text-[9px] text-slate-500 block mt-2 font-semibold">
              Per consultation
            </span>
          </div>

          {/* Longest Wait Time */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <Clock className="absolute right-3.5 top-3.5 w-6 h-6 text-amber-500/10" />
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Longest Wait</span>
            <span className="text-3xl font-extrabold text-slate-100 block mt-2">{data.longestWaitTime} m</span>
            <span className="text-[9px] text-slate-500 block mt-2 font-semibold">
              Check-in to Room
            </span>
          </div>

          {/* Queue Size */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <Users className="absolute right-3.5 top-3.5 w-6 h-6 text-blue-500/10" />
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Queue Size</span>
            <span className="text-3xl font-extrabold text-slate-100 block mt-2">{data.currentQueueSize}</span>
            <span className="text-[9px] text-slate-500 block mt-2 font-semibold">
              Active patients
            </span>
          </div>

          {/* Skipped Patients */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden col-span-2 md:col-span-1">
            <AlertTriangle className="absolute right-3.5 top-3.5 w-6 h-6 text-red-500/10" />
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Skipped Today</span>
            <span className="text-3xl font-extrabold text-slate-100 block mt-2">{data.skippedTodayCount}</span>
            <span className="text-[9px] text-red-400 block mt-2 font-semibold">
              No shows
            </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Throughput Chart */}
          <div className="md:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-200">Patient Throughput</h3>
              <p className="text-xs text-slate-500">Hourly breakdown of completed consultations today</p>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.hourlyThroughput}
                  margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    allowDecimals={false} 
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    cursor={{ fill: '#1e293b/20' }}
                  />
                  <Bar 
                    dataKey="patients" 
                    fill="url(#colorEmerald)" 
                    radius={[6, 6, 0, 0]} 
                  />
                  <defs>
                    <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Insights Cards */}
          <div className="md:col-span-1 bg-slate-900/40 border border-slate-850 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-200 mb-4">Operations Insights</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Peak Efficiency</span>
                  <span className="text-sm font-semibold text-slate-200">9:00 AM - 11:00 AM</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Most patients were completed during this window. Maintain double-staffing during these hours.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Queue Leakage</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {data.servedToday + data.skippedTodayCount > 0 
                      ? `${((data.skippedTodayCount / (data.servedToday + data.skippedTodayCount)) * 100).toFixed(0)}% No-show rate` 
                      : '0% No-show rate'}
                  </span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Skipped patients represent potential lost throughput. Consider triggering WhatsApp reminders.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 text-[10px] text-slate-500 flex items-center justify-between">
              <span>ClinicFlow Metrics Portal</span>
              <span>v1.0.0</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
export default AnalyticsDashboard;
