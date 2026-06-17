import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/useAuthStore';

// Page Imports
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import PatientWaitingRoom from './pages/PatientWaitingRoom';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

// Create a React Query client for caching API requests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Guard route for staff members only
function PrivateRoute({ children }: { children: React.JSX.Element }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Lookups */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/waiting-room/:clinicId" element={<PatientWaitingRoom />} />

          {/* Auth Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage register />} />

          {/* Protected Staff Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <ReceptionistDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <AnalyticsDashboard />
              </PrivateRoute>
            }
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
