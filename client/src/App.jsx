import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardSidebar, DashboardHeader } from './components/dashboard';
import { LandingPage } from './pages/LandingPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { PatientsPage } from './pages/PatientsPage';
import AuthPage from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { useState } from 'react';

function PageTransition({ children }) {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl">E</span>
        </div>
        <div className="flex justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <PageTransition><LandingPage /></PageTransition>} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <PageTransition><AuthPage /></PageTransition>} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <PageTransition><AuthPage register /></PageTransition>} 
      />
      
      <Route path="/dashboard" element={
        <PrivateRoute>
          <PageTransition>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </PageTransition>
        </PrivateRoute>
      } />
      <Route path="/patients" element={
        <PrivateRoute>
          <PageTransition>
            <DashboardLayout><PatientsPage /></DashboardLayout>
          </PageTransition>
        </PrivateRoute>
      } />
      <Route path="/alerts" element={
        <PrivateRoute>
          <PageTransition>
            <DashboardLayout><AlertsPage /></DashboardLayout>
          </PageTransition>
        </PrivateRoute>
      } />
      <Route path="/history" element={
        <PrivateRoute>
          <PageTransition>
            <DashboardLayout><HistoryPage /></DashboardLayout>
          </PageTransition>
        </PrivateRoute>
      } />
      <Route path="/emergency" element={
        <PrivateRoute>
          <PageTransition>
            <DashboardLayout><EmergencyPage /></DashboardLayout>
          </PageTransition>
        </PrivateRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DashboardLayout({ children }) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar 
        role={user?.role} 
        mobile={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      
      <div className="lg:pl-56">
        <DashboardHeader 
          user={user}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {mobileMenuOpen && (
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden animate-fade-in"
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
