import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AuthPage, AlertsPage, HistoryPage, EmergencyPage, PatientsPage } from './pages';
import { Dashboard } from './pages/AuthPage';

const C = {
  gray50: "#F8FAFC",
  gray900: "#0F172A",
  blue: "#1E6FD9",
};

function MainApp() {
  const { user, login, logout } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    document.body.style.fontFamily = "'DM Sans', sans-serif";
    document.body.style.margin = "0";
    document.body.style.background = C.gray50;
  }, []);

  const handleLogin = async (userData) => {
    localStorage.setItem('token', 'demo-token');
    return userData;
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard user={user} onNav={setPage} />;
      case "alerts": return <AlertsPage />;
      case "history": return <HistoryPage />;
      case "emergency": return <EmergencyPage />;
      case "patients": return <PatientsPage user={user} />;
      default: return <Dashboard user={user} onNav={setPage} />;
    }
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      {(!isMobile || sidebarOpen) && (
        <Sidebar
          active={page} onNav={setPage} role={user.role}
          mobile={isMobile} onClose={() => setSidebarOpen(false)}
        />
      )}

      <div style={{
        flex: 1, marginLeft: isMobile ? 0 : 220,
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        <Navbar
          user={user}
          onLogout={() => { logout(); setPage("dashboard"); }}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main style={{ flex: 1, padding: isMobile ? "20px 16px" : "28px 32px", maxWidth: 1200 }}>
          {renderPage()}
        </main>
      </div>

      {isMobile && !sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{
          position: "fixed", bottom: 24, right: 24, width: 52, height: 52,
          borderRadius: "50%", background: C.blue, color: C.white,
          border: "none", cursor: "pointer", fontSize: 22, zIndex: 97,
          boxShadow: "0 4px 16px rgba(30,111,217,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>☰</button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
