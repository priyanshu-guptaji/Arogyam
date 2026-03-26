import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../utils/theme';
import { MOCK_ALERTS } from '../utils/api';

const C_STYLES = {
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray800: "#1E293B",
  blue: "#1E6FD9",
  red: "#DC2626",
  white: "#FFFFFF",
};

export function Navbar({ user, onLogout, onMenuToggle }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    import('../utils/api').then(m => setAlerts(m.MOCK_ALERTS.slice(0, 3)));
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header style={{
      height: 64, background: C_STYLES.white, borderBottom: `1px solid ${C_STYLES.gray100}`,
      display: "flex", alignItems: "center", padding: "0 24px", gap: 12,
      position: "sticky", top: 0, zIndex: 90,
      boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
    }}>
      <button onClick={onMenuToggle} style={{
        display: "none", border: "none", background: "none", cursor: "pointer",
        fontSize: 20, color: C_STYLES.gray500, padding: 4,
      }} className="menu-btn">☰</button>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: C_STYLES.gray400 }}>Good {getTimeOfDay()},</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C_STYLES.gray800 }}>{user?.name || 'User'}</div>
      </div>

      <div style={{ position: "relative" }}>
        <button onClick={() => setShowNotif(!showNotif)} style={{
          width: 40, height: 40, borderRadius: 10, border: `1px solid ${C_STYLES.gray200}`,
          background: "none", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, position: "relative",
        }}>
          🔔
          <span style={{
            position: "absolute", top: 6, right: 6, width: 8, height: 8,
            borderRadius: "50%", background: C_STYLES.red, border: `2px solid ${C_STYLES.white}`,
          }} />
        </button>
        {showNotif && (
          <div style={{
            position: "absolute", top: 48, right: 0, width: 300,
            background: C_STYLES.white, borderRadius: 14, border: `1px solid ${C_STYLES.gray200}`,
            boxShadow: "0 8px 32px rgba(15,23,42,0.12)", zIndex: 200, overflow: "hidden",
          }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C_STYLES.gray100}`, fontSize: 13, fontWeight: 700, color: C_STYLES.gray800 }}>
              Notifications
            </div>
            {alerts.map(a => (
              <div key={a._id} style={{ padding: "10px 16px", borderBottom: `1px solid ${C_STYLES.gray100}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16 }}>{a.type === "critical" ? "🔴" : a.type === "warning" ? "🟡" : "🟢"}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C_STYLES.gray800 }}>{a.patient}</div>
                  <div style={{ fontSize: 11, color: C_STYLES.gray400 }}>{a.ts}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <button onClick={() => setShowProfile(!showProfile)} style={{
          display: "flex", alignItems: "center", gap: 10, border: `1px solid ${C_STYLES.gray200}`,
          borderRadius: 10, padding: "6px 12px 6px 8px", background: "none", cursor: "pointer",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: C_STYLES.blue,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: C_STYLES.white, fontSize: 13, fontWeight: 700,
          }}>{user?.name?.[0] || 'U'}</div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C_STYLES.gray800 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 10, color: C_STYLES.gray400 }}>{user?.role || 'User'}</div>
          </div>
        </button>
        {showProfile && (
          <div style={{
            position: "absolute", top: 48, right: 0, width: 180,
            background: C_STYLES.white, borderRadius: 12, border: `1px solid ${C_STYLES.gray200}`,
            boxShadow: "0 8px 32px rgba(15,23,42,0.12)", zIndex: 200, overflow: "hidden",
          }}>
            <button onClick={handleLogout} style={{
              width: "100%", padding: "12px 16px", border: "none", background: "none",
              cursor: "pointer", textAlign: "left", fontSize: 13, color: C_STYLES.red, fontWeight: 500,
              fontFamily: "inherit",
            }}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
