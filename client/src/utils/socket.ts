import { io, Socket } from 'socket.io-client';
import { QueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Resolve URL from window.location or fallback to localhost
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(backendUrl, {
      autoConnect: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
  }
  return socket;
};

interface SocketPayload {
  activeQueue?: any[];
  addedPatient?: any;
  calledPatient?: any;
  completedPatient?: any;
  skippedPatient?: any;
  averageDuration?: number;
}

export const setupSocketListeners = (clinicId: string, queryClient: QueryClient) => {
  const s = getSocket();

  if (!s.connected) {
    s.connect();
  }

  // Join the clinic room
  s.emit('join-clinic', clinicId);

  // Listen to queue status updates
  s.on('PATIENT_ADDED', (payload: SocketPayload) => {
    console.log('PATIENT_ADDED received:', payload);
    if (payload.activeQueue) {
      queryClient.setQueryData(['queue', clinicId], payload.activeQueue);
    }
    queryClient.invalidateQueries({ queryKey: ['waiting-room', clinicId] });
  });

  s.on('TOKEN_CALLED', (payload: SocketPayload) => {
    console.log('TOKEN_CALLED received:', payload);
    if (payload.activeQueue) {
      queryClient.setQueryData(['queue', clinicId], payload.activeQueue);
    }
    queryClient.invalidateQueries({ queryKey: ['waiting-room', clinicId] });
    // Sound notice for patient room
    playChirpSound();
  });

  s.on('TOKEN_SKIPPED', (payload: SocketPayload) => {
    console.log('TOKEN_SKIPPED received:', payload);
    if (payload.activeQueue) {
      queryClient.setQueryData(['queue', clinicId], payload.activeQueue);
    }
    queryClient.invalidateQueries({ queryKey: ['waiting-room', clinicId] });
  });

  s.on('CONSULTATION_COMPLETED', (payload: SocketPayload) => {
    console.log('CONSULTATION_COMPLETED received:', payload);
    if (payload.activeQueue) {
      queryClient.setQueryData(['queue', clinicId], payload.activeQueue);
    }
    queryClient.invalidateQueries({ queryKey: ['waiting-room', clinicId] });
    queryClient.invalidateQueries({ queryKey: ['analytics', clinicId] });
  });

  s.on('WAIT_TIME_UPDATED', (payload: SocketPayload) => {
    console.log('WAIT_TIME_UPDATED received:', payload);
    if (payload.activeQueue) {
      queryClient.setQueryData(['queue', clinicId], payload.activeQueue);
    }
    queryClient.invalidateQueries({ queryKey: ['waiting-room', clinicId] });
  });

  s.on('QUEUE_RESET', () => {
    console.log('QUEUE_RESET received');
    queryClient.setQueryData(['queue', clinicId], []);
    queryClient.invalidateQueries({ queryKey: ['waiting-room', clinicId] });
    queryClient.invalidateQueries({ queryKey: ['analytics', clinicId] });
  });

  return () => {
    s.off('PATIENT_ADDED');
    s.off('TOKEN_CALLED');
    s.off('TOKEN_SKIPPED');
    s.off('CONSULTATION_COMPLETED');
    s.off('WAIT_TIME_UPDATED');
    s.off('QUEUE_RESET');
  };
};

const playChirpSound = () => {
  try {
    // Generate a gentle digital notification sound using the Web Audio API
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Low frequency tone
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
    
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.3);
  } catch (error) {
    console.log('Audio playback failed or blocked by browser policy:', error);
  }
};
