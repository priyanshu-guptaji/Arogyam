import { useState } from 'react';
import { Card, Button, Modal } from '../components/UI';
import { C } from '../utils/theme';

export function EmergencyPage() {
  const [state, setState] = useState("idle");
  const [emergencyId, setEmergencyId] = useState("");

  const confirmEmergency = () => {
    setEmergencyId(`EMG-${Math.floor(Math.random() * 9000) + 1000}`);
    setState("sent");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray900, margin: 0 }}>🚨 Emergency Alert</h1>
        <p style={{ fontSize: 13, color: C.gray500, margin: "2px 0 0" }}>Immediately dispatch emergency response</p>
      </div>

      <Card style={{ textAlign: "center", padding: "48px 32px" }}>
        {state === "idle" && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🆘</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.gray800, marginBottom: 8 }}>Emergency Response</div>
            <div style={{ fontSize: 14, color: C.gray500, maxWidth: 360, margin: "0 auto 32px" }}>
              Press the button below to immediately notify all medical staff and emergency services.
            </div>
            <button onClick={() => setState("confirm")} style={{
              width: 160, height: 160, borderRadius: "50%",
              background: `linear-gradient(145deg, #FF3B30, ${C.red})`,
              border: "6px solid #FF8A80", color: C.white, fontSize: 16, fontWeight: 800,
              cursor: "pointer", boxShadow: "0 0 0 8px #FEE2E2, 0 8px 32px rgba(220,38,38,0.4)",
              letterSpacing: "0.05em", fontFamily: "inherit",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              EMERGENCY
            </button>
          </>
        )}
        {state === "sent" && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.green, marginBottom: 8 }}>Emergency Alert Sent!</div>
            <div style={{ fontSize: 14, color: C.gray500, marginBottom: 24 }}>
              Medical staff and emergency services have been notified. Stay calm and wait for assistance.
            </div>
            <div style={{
              background: C.greenLight, borderRadius: 12, padding: "16px 24px",
              display: "inline-block", marginBottom: 24,
            }}>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>Response ETA: ~4 minutes</div>
              <div style={{ fontSize: 12, color: C.gray500 }}>Alert ID: #{emergencyId}</div>
            </div>
            <br />
            <Button variant="ghost" onClick={() => setState("idle")}>← Back</Button>
          </>
        )}
      </Card>

      <Modal open={state === "confirm"} onClose={() => setState("idle")}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.gray800, marginBottom: 8 }}>Confirm Emergency Alert</div>
          <div style={{ fontSize: 14, color: C.gray500, marginBottom: 24 }}>
            This will immediately alert all medical staff and emergency services. This action cannot be undone.
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="ghost" onClick={() => setState("idle")} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="danger" onClick={confirmEmergency} style={{ flex: 1 }}>🚨 Confirm Emergency</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
