import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Clock, Users, ArrowRight, Sparkles, Volume2, Shield } from 'lucide-react';
import { setupSocketListeners } from '../utils/socket';

interface Patient {
  _id: string;
  tokenNumber: number;
  patientName: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  checkInTime: string;
  estimatedWaitMinutes: number;
}

interface WaitingRoomData {
  clinicName: string;
  clinicId: string;
  currentTokenServed: Patient | null;
  upcomingTokens: Patient[];
  lastUpdated: string;
}

export function PatientWaitingRoom() {
  const { clinicId } = useParams<{ clinicId: string }>();
  const queryClient = useQueryClient();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Personal token tracking
  const [myTokenInput, setMyTokenInput] = useState('');
  const [myToken, setMyToken] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Setup live socket listener for instant UI updates without refresh
  useEffect(() => {
    if (clinicId) {
      const cleanup = setupSocketListeners(clinicId, queryClient);
      return cleanup;
    }
  }, [clinicId, queryClient]);

  // Fetch waiting room details
  const { data, isLoading, error } = useQuery<WaitingRoomData>({
    queryKey: ['waiting-room', clinicId],
    queryFn: async () => {
      const res = await fetch(`${backendUrl}/api/waiting-room?clinicId=${clinicId}`);
      const json = await res.json();
      if (json.success) {
        return json.data;
      }
      throw new Error(json.message || 'Failed to fetch waiting room data');
    },
    enabled: !!clinicId,
    refetchInterval: 30000 // Fallback poll every 30s in case WebSockets fail
  });

  const handleTrackToken = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenNum = parseInt(myTokenInput.trim());
    if (!isNaN(tokenNum) && tokenNum > 0) {
      setMyToken(tokenNum);
    }
  };

  const clearTrackedToken = () => {
    setMyToken(null);
    setMyTokenInput('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center animate-pulse">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-400">Connecting to ClinicFlow Live Queue...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 mb-6">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Clinic Queue Unavailable</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
          {error instanceof Error ? error.message : 'Please check your Clinic ID and network connection.'}
        </p>
        <a
          href="/"
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-sm font-semibold rounded-xl transition-all duration-200"
        >
          Return Home
        </a>
      </div>
    );
  }

  // Calculate stats for the personal token if tracked
  let myTokenStatus: 'WAITING' | 'SERVING' | 'COMPLETED' | 'SKIPPED' | 'NOT_FOUND' = 'NOT_FOUND';
  let myPatientsAhead = 0;
  let myWaitTime = 0;
  let matchedPatient: Patient | null = null;

  if (myToken !== null) {
    // Check if currently serving
    if (data.currentTokenServed?.tokenNumber === myToken) {
      myTokenStatus = 'SERVING';
      matchedPatient = data.currentTokenServed;
    } else {
      // Check in upcoming queue
      const upcomingIndex = data.upcomingTokens.findIndex((t) => t.tokenNumber === myToken);
      if (upcomingIndex !== -1) {
        myTokenStatus = 'WAITING';
        matchedPatient = data.upcomingTokens[upcomingIndex];
        // Patients ahead = index in waiting list + 1 (if there is someone currently in consultation)
        const inProgressOffset = data.currentTokenServed ? 1 : 0;
        myPatientsAhead = upcomingIndex;
        // The estimatedWaitMinutes is already computed by our backend wait time algorithm
        myWaitTime = matchedPatient.estimatedWaitMinutes;
      } else {
        // Fallback: check if they are completed/skipped (not in active queue)
        myTokenStatus = 'NOT_FOUND';
      }
    }
  }

  const waitingCount = data.upcomingTokens.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                {data.clinicName}
              </h1>
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Live Queue Board</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Connection Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Sockets
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
        
        {/* LEFT & CENTER COLUMNS: Big TV Dashboard */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Main Counter Display */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center py-12">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Now Serving
            </div>

            {data.currentTokenServed ? (
              <div>
                <div className="text-[120px] md:text-[150px] font-black leading-none tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                  {data.currentTokenServed.tokenNumber}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mt-4">
                  {data.currentTokenServed.patientName}
                </h2>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
                  Please proceed to the doctor's cabin
                </p>
              </div>
            ) : (
              <div className="py-12">
                <div className="text-slate-600 text-lg font-semibold">Doctor is currently free</div>
                <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">
                  No active consultation
                </p>
              </div>
            )}
          </div>

          {/* Upcoming Queue Timeline */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              Upcoming Tokens ({waitingCount})
            </h3>

            {data.upcomingTokens.length === 0 ? (
              <div className="py-8 text-center text-slate-600 text-sm">
                No upcoming patients in line.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {data.upcomingTokens.slice(0, 8).map((item, index) => (
                  <div 
                    key={item._id}
                    className="bg-slate-950/80 border border-slate-850 p-4 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all duration-200"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Position {index + 1}</span>
                      <div className="text-2xl font-black text-slate-200 mt-1">Token {item.tokenNumber}</div>
                    </div>
                    <div className="mt-4 border-t border-slate-900 pt-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400/90">{item.estimatedWaitMinutes} min wait</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Personal Token Tracker Card */}
        <div className="md:col-span-1 space-y-8">
          
          {/* Tracking Widget */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Personal Token Tracker</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Enter your assigned token number below to track your real-time position and custom wait estimate.
              </p>

              {myToken === null ? (
                // Track Token Input
                <form onSubmit={handleTrackToken} className="space-y-3">
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="Enter Token Number (e.g. 14)"
                    value={myTokenInput}
                    onChange={(e) => setMyTokenInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:bg-emerald-400"
                  >
                    Track My Position <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                // Tracked Token Details Display
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">My Token Number</span>
                    <span className="text-5xl font-black text-slate-100 block mt-1">{myToken}</span>
                    
                    <button 
                      onClick={clearTrackedToken}
                      className="text-[10px] text-slate-500 hover:text-red-400 font-bold uppercase tracking-widest mt-4 block mx-auto transition-colors"
                    >
                      Clear Tracker
                    </button>
                  </div>

                  {myTokenStatus === 'SERVING' ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center animate-pulse">
                      <h4 className="text-sm font-bold">It's Your Turn!</h4>
                      <p className="text-xs mt-1">Please enter the doctor's consultation room now.</p>
                    </div>
                  ) : myTokenStatus === 'WAITING' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Patients Ahead</span>
                          <span className="text-2xl font-black text-slate-200 block mt-1">{myPatientsAhead}</span>
                        </div>
                        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Est. Wait Time</span>
                          <span className="text-2xl font-black text-emerald-400 block mt-1">{myWaitTime} min</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-xs leading-relaxed text-slate-400 text-center">
                        {myPatientsAhead === 0 ? (
                          <span>You are next in line! Stay ready outside the doctor's room.</span>
                        ) : (
                          <span>Approx. <strong className="text-slate-200">{myWaitTime} minutes</strong> remaining. Take a seat in the waiting hall.</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-center">
                      <span className="text-xs text-slate-500 leading-relaxed block">
                        Token #{myToken} is not active in the waiting list. It may have already been completed or skipped.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Helper Tips */}
            <div className="mt-8 border-t border-slate-800/80 pt-6 text-[10px] text-slate-500 leading-relaxed space-y-2">
              <p>• Estimated wait times are dynamic, computed using actual average consultation times.</p>
              <p>• Keep this page open; it updates instantly when staff advance the queue.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/20 py-6 text-center text-[10px] text-slate-600">
        <p>Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'Syncing...'} • ClinicFlow Digital Queue Gateway</p>
      </footer>
    </div>
  );
}
export default PatientWaitingRoom;
