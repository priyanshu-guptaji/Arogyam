import { C, statusBg, statusColor } from '../utils/theme';

export function Badge({ status }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: statusBg(status), color: statusColor(status), letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(status), display: "inline-block" }} />
      {status}
    </span>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.white, borderRadius: 16, padding: "20px 24px",
      boxShadow: "0 1px 4px rgba(15,23,42,0.07), 0 4px 16px rgba(15,23,42,0.05)",
      border: `1px solid ${C.gray100}`, ...style,
    }}>{children}</div>
  );
}

export function MetricCard({ icon, label, value, unit, status }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 22 }}>{icon}</div>
        <Badge status={status} />
      </div>
      <div style={{ color: C.gray500, fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: C.gray800, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 14, color: C.gray400 }}>{unit}</span>
      </div>
    </Card>
  );
}

export function Input({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.gray600 }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          border: `1.5px solid ${C.gray200}`, borderRadius: 10, padding: "10px 14px",
          fontSize: 14, color: C.gray800, outline: "none", background: C.gray50,
          transition: "border-color 0.15s", fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = C.blue}
        onBlur={e => e.target.style.borderColor = C.gray200}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options, required }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.gray600 }}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>}
      <select
        value={value} onChange={onChange}
        style={{
          border: `1.5px solid ${C.gray200}`, borderRadius: 10, padding: "10px 14px",
          fontSize: 14, color: C.gray800, outline: "none", background: C.gray50,
          fontFamily: "inherit", cursor: "pointer",
        }}
        onFocus={e => e.target.style.borderColor = C.blue}
        onBlur={e => e.target.style.borderColor = C.gray200}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Button({ children, onClick, variant = "primary", style = {}, disabled }) {
  const base = {
    padding: "11px 22px", borderRadius: 10, border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14, fontWeight: 600, transition: "all 0.15s", fontFamily: "inherit",
    opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary: { background: C.blue, color: C.white },
    danger: { background: C.red, color: C.white },
    ghost: { background: C.gray100, color: C.gray700 },
    outline: { background: "transparent", color: C.blue, border: `1.5px solid ${C.blue}` },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.target.style.opacity = "0.88" }}
      onMouseLeave={e => e.target.style.opacity = "1"}
    >{children}</button>
  );
}

export function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      backdropFilter: "blur(2px)",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          background: C.white, borderRadius: 20, padding: 32, maxWidth: 440, width: "90%",
          boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
        }}>
        {children}
      </div>
    </div>
  );
}
