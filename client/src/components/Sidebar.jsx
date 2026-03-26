import { C } from '../utils/theme';

export function Sidebar({ active, onNav, role, mobile, onClose }) {
  const items = {
    "Care Manager": [
      { id: "dashboard", icon: "⊞", label: "Dashboard" },
      { id: "patients", icon: "👥", label: "Patients" },
      { id: "alerts", icon: "🔔", label: "Alerts" },
      { id: "history", icon: "📋", label: "History" },
    ],
    "Parent": [
      { id: "dashboard", icon: "⊞", label: "Dashboard" },
      { id: "alerts", icon: "🔔", label: "Alerts" },
      { id: "history", icon: "📋", label: "History" },
      { id: "emergency", icon: "🚨", label: "Emergency" },
    ],
    "Child": [
      { id: "dashboard", icon: "⊞", label: "Dashboard" },
      { id: "history", icon: "📋", label: "History" },
    ],
  }[role] || [];

  return (
    <>
      {mobile && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 98,
        }} onClick={onClose} />
      )}
      <aside style={{
        width: 220, background: C.gray900, height: "100vh", position: "fixed", left: 0, top: 0,
        display: "flex", flexDirection: "column", zIndex: 99,
        boxShadow: mobile ? "4px 0 24px rgba(0,0,0,0.25)" : "none",
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: C.blue,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>E</div>
            <div>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 700, lineHeight: 1 }}>ElderCare</div>
              <div style={{ color: C.gray400, fontSize: 10, marginTop: 2 }}>Health Monitor</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 20px" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: C.blue, background: `${C.blue}22`,
            padding: "3px 10px", borderRadius: 99, letterSpacing: "0.08em", textTransform: "uppercase",
          }}>{role}</span>
        </div>

        <nav style={{ flex: 1, padding: "4px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => { onNav(item.id); if (mobile) onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                background: active === item.id ? `${C.blue}22` : "transparent",
                color: active === item.id ? C.blue : C.gray400,
                fontSize: 14, fontWeight: active === item.id ? 600 : 400,
                transition: "all 0.15s", fontFamily: "inherit",
              }}
              onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
              onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = "transparent" }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
              {item.id === "alerts" && (
                <span style={{
                  marginLeft: "auto", background: C.red, color: C.white,
                  borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 7px",
                }}>3</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: `1px solid rgba(255,255,255,0.07)` }}>
          <div style={{ fontSize: 10, color: C.gray500 }}>v2.4.1 Secure Connection</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
            <span style={{ fontSize: 10, color: C.gray400 }}>All systems operational</span>
          </div>
        </div>
      </aside>
    </>
  );
}
