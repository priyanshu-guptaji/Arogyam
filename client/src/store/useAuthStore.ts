import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Receptionist';
  clinicId: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial auth state from localStorage
  const savedToken = localStorage.getItem('clinicflow_token');
  const savedUser = localStorage.getItem('clinicflow_user');

  let initialUser: User | null = null;
  try {
    if (savedUser) {
      initialUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.error('Failed to parse saved user:', e);
  }

  return {
    token: savedToken,
    user: initialUser,
    isAuthenticated: !!savedToken && !!initialUser,
    setAuth: (token, user) => {
      localStorage.setItem('clinicflow_token', token);
      localStorage.setItem('clinicflow_user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    clearAuth: () => {
      localStorage.removeItem('clinicflow_token');
      localStorage.removeItem('clinicflow_user');
      set({ token: null, user: null, isAuthenticated: false });
    }
  };
});
