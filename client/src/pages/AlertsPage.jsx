import { useState, useEffect } from 'react';
import { Card } from '../components/UI';
import { C, getStatus } from '../utils/theme';
import { MOCK_ALERTS, healthApi } from '../utils/api';

export function AlertsPage() {
  const [filter, setFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    healthApi.getAlerts().then(res => setAlerts(res.data.data));
  }, []);

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.type === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray900, margin: 0 }}>🔔 Alerts Center</h1>
        <p style={{ fontSize: 13, color: C.gray500, margin: "2px 0 0" }}>Real-time patient health alerts</p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Critical", count: alerts.filter(a => a.type === "critical").length, color: C.red },
          { label: "Warning", count: alerts.filter(a => a.type === "warning").length, color: C.yellow },
          { label: "Normal", count: alerts.filter(a => a.type === "normal").length, color: C.green },
        ].map(b => (
          <div key={b.label} style={{
            background: C.white, borderRadius: 12, padding: "12px 20px",
            border: `1px solid ${C.gray100}`, boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color }} />
            <span style={{ fontWeight: 700, color: C.gray800, fontSize: 20 }}>{b.count}</span>
            <span style={{ fontSize: 13, color: C.gray500 }}>{b.label}</span>
          </div>
        ))}
      </div>

      <Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {["all", "critical", "warning", "normal"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              background: filter === f ? C.blue : C.gray100,
              color: filter === f ? C.white : C.gray600,
              fontSize: 13, fontWeight: filter === f ? 600 : 400,
              fontFamily: "inherit", transition: "all 0.15s", textTransform: "capitalize",
            }}>{f === "all" ? "All Alerts" : f}</button>
          ))}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.gray50 }}>
                {["Patient", "Heart Rate", "Oxygen", "Blood Pressure", "Alert Type", "Timestamp"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: C.gray500, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a._id} style={{ borderTop: `1px solid ${C.gray100}`, background: i % 2 === 0 ? C.white : C.gray50 }}>
                  <td style={{ padding: "12px 12px", fontWeight: 600, color: C.gray800 }}>{a.patient?.name || a.patient}</td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{ fontWeight: 600, color: a.hr > 100 ? C.red : C.gray700 }}>{a.hr} bpm</span>
                  </td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{ fontWeight: 600, color: a.o2 < 93 ? C.red : C.gray700 }}>{a.o2}%</span>
                  </td>
                  <td style={{ padding: "12px 12px", color: C.gray700, fontWeight: 600 }}>{a.sbp}/{a.dbp} mmHg</td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: a.type === "critical" ? C.redLight : a.type === "warning" ? C.yellowLight : C.greenLight,
                      color: a.type === "critical" ? C.red : a.type === "warning" ? C.yellow : C.green,
                      textTransform: "uppercase",
                    }}>{a.type}</span>
                  </td>
                  <td style={{ padding: "12px 12px", color: C.gray400 }}>{a.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: C.gray400 }}>No alerts for this filter</div>
          )}
        </div>
      </Card>
    </div>
  );
}
