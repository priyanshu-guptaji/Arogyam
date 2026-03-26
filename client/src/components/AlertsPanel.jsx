import { Card, Badge } from './UI';
import { C, statusBg, statusColor } from '../utils/theme';

export function AlertsPanel({ alerts }) {
  return (
    <Card>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.gray800, marginBottom: 14 }}>
        Recent Alerts
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.slice(0, 5).map(a => (
          <div key={a._id || a.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 14px", borderRadius: 10, background: statusBg(a.type),
            border: `1px solid ${statusColor(a.type)}22`,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray800 }}>{a.patient?.name || a.patient}</div>
              <div style={{ fontSize: 11, color: C.gray500 }}>HR {a.hr} O2 {a.o2}% BP {a.sbp}/{a.dbp}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Badge status={a.type} />
              <div style={{ fontSize: 10, color: C.gray400, marginTop: 4 }}>{a.ts || new Date(a.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
