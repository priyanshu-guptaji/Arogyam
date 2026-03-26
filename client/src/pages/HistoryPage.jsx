import { useState, useEffect } from 'react';
import { Card, Select, Button } from '../components/UI';
import { LineChart } from '../components/LineChart';
import { C, getStatus } from '../utils/theme';
import { MOCK_PATIENTS, genHistory, healthApi } from '../utils/api';

export function HistoryPage() {
  const [patient, setPatient] = useState(MOCK_PATIENTS[0]);
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    healthApi.getPatientRecords(patient._id).then(res => setHistory(res.data.data));
  }, [patient]);

  const perPage = 5;
  const totalPages = Math.ceil(history.length / perPage);
  const pageData = history.slice((page - 1) * perPage, page * perPage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray900, margin: 0 }}>📋 Patient History</h1>
        <p style={{ fontSize: 13, color: C.gray500, margin: "2px 0 0" }}>Complete health records</p>
      </div>

      <Card>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20, alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Select label="Patient" value={patient._id}
              onChange={e => { setPatient(MOCK_PATIENTS.find(p => p._id === e.target.value)); setPage(1); }}
              options={MOCK_PATIENTS.map(p => ({ value: p._id, label: p.name }))} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["table", "chart"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                background: view === v ? C.blue : C.gray100,
                color: view === v ? C.white : C.gray600,
                fontWeight: view === v ? 600 : 400, fontSize: 13, fontFamily: "inherit",
                transition: "all 0.15s",
              }}>{v === "table" ? "📋 Table" : "📊 Chart"}</button>
            ))}
          </div>
        </div>

        {view === "chart" ? (
          <LineChart data={history} keys={["hr", "o2", "sbp"]} colors={[C.red, C.blue, C.green]} labels={["HR", "O2", "Sys BP"]} />
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.gray50 }}>
                    {["Day", "Time", "HR", "Oxygen", "Sys BP", "Dia BP", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: C.gray500, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((row, i) => (
                    <tr key={row._id || i} style={{ borderTop: `1px solid ${C.gray100}`, background: i % 2 === 0 ? C.white : C.gray50 }}>
                      <td style={{ padding: "11px 12px", color: C.gray700, fontWeight: 600 }}>{row.date}</td>
                      <td style={{ padding: "11px 12px", color: C.gray500 }}>{row.time}</td>
                      <td style={{ padding: "11px 12px", fontWeight: 600, color: row.hr > 100 ? C.red : C.gray700 }}>{row.hr}</td>
                      <td style={{ padding: "11px 12px", fontWeight: 600, color: row.o2 < 93 ? C.red : C.gray700 }}>{row.o2}%</td>
                      <td style={{ padding: "11px 12px", fontWeight: 600 }}>{row.sbp}</td>
                      <td style={{ padding: "11px 12px", fontWeight: 600 }}>{row.dbp}</td>
                      <td style={{ padding: "11px 12px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                          background: row.status === "critical" ? C.redLight : row.status === "warning" ? C.yellowLight : C.greenLight,
                          color: row.status === "critical" ? C.red : row.status === "warning" ? C.yellow : C.green,
                          textTransform: "uppercase",
                        }}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <div style={{ fontSize: 12, color: C.gray400 }}>
                Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, history.length)} of {history.length} records
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Button variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "7px 14px", fontSize: 13 }}>← Prev</Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} style={{
                    width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
                    background: page === i + 1 ? C.blue : C.gray100,
                    color: page === i + 1 ? C.white : C.gray600, fontWeight: 600,
                    fontSize: 13, fontFamily: "inherit",
                  }}>{i + 1}</button>
                ))}
                <Button variant="ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "7px 14px", fontSize: 13 }}>Next →</Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
