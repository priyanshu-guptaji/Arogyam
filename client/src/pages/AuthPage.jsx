import { useState, useEffect } from 'react';
import { Card, Input, Select, Button } from '../components/UI';
import { LineChart } from '../components/LineChart';
import { AlertsPanel } from '../components/AlertsPanel';
import { C, getStatus } from '../utils/theme';
import { MOCK_PATIENTS, MOCK_ALERTS, genHistory, healthApi } from '../utils/api';

export function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Care Manager" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (mode === "register" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ 
        name: mode === "register" ? form.name : "Sarah Mitchell", 
        email: form.email, 
        role: form.role 
      });
    }, 900);
  };

  const Field = ({ k, label, type = "text", placeholder }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: C.gray600 }}>
        {label}<span style={{ color: C.red }}> *</span>
      </label>
      <input
        type={type} value={form[k]} placeholder={placeholder}
        onChange={e => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: "" }); }}
        style={{
          border: `1.5px solid ${errors[k] ? C.red : C.gray200}`, borderRadius: 10, padding: "11px 14px",
          fontSize: 14, color: C.gray800, outline: "none", background: C.gray50, fontFamily: "inherit",
          transition: "border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = errors[k] ? C.red : C.blue}
        onBlur={e => e.target.style.borderColor = errors[k] ? C.red : C.gray200}
      />
      {errors[k] && <span style={{ fontSize: 12, color: C.red }}>{errors[k]}</span>}
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(135deg, ${C.gray900} 0%, #0D2340 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: `${C.blue}18`, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: `${C.blue}0D`, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: C.blue,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 12px",
          }}>E</div>
          <div style={{ color: C.white, fontSize: 22, fontWeight: 800 }}>ElderCare Monitor</div>
          <div style={{ color: C.gray400, fontSize: 13, marginTop: 4 }}>Compassionate Healthcare Technology</div>
        </div>

        <div style={{ background: C.white, borderRadius: 20, padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", background: C.gray100, borderRadius: 10, padding: 3, marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                style={{
                  flex: 1, padding: "9px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: mode === m ? C.white : "transparent",
                  color: mode === m ? C.gray800 : C.gray400, fontWeight: mode === m ? 600 : 400,
                  fontSize: 14, fontFamily: "inherit",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}>{m === "login" ? "Sign In" : "Register"}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && <Field k="name" label="Full Name" placeholder="Dr. Jane Smith" />}
            <Field k="email" label="Email Address" type="email" placeholder="you@hospital.org" />
            <Field k="password" label="Password" type="password" placeholder="Enter password" />

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.gray600 }}>Role<span style={{ color: C.red }}> *</span></label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                style={{ border: `1.5px solid ${C.gray200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, color: C.gray800, outline: "none", background: C.gray50, fontFamily: "inherit" }}>
                {["Care Manager", "Parent", "Child"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <Button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "13px", marginTop: 4, fontSize: 15 }}>
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.gray400 }}>
            Secured with 256-bit encryption
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ user, onNav }) {
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [form, setForm] = useState({ hr: "", o2: "", sbp: "", dbp: "" });
  const [submitted, setSubmitted] = useState(false);
  const history = genHistory(selectedPatient._id);
  const latest = history[history.length - 1];
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    healthApi.getAlerts().then(res => setAlerts(res.data.data.slice(0, 5)));
  }, []);

  const submit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setForm({ hr: "", o2: "", sbp: "", dbp: "" });
  };

  const patients = user.role === "Care Manager" ? MOCK_PATIENTS : [MOCK_PATIENTS[0]];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray900, margin: 0 }}>
            {user.role === "Care Manager" ? "Care Manager Dashboard" : user.role === "Parent" ? "Health Overview" : "Parent's Health"}
          </h1>
          <p style={{ fontSize: 13, color: C.gray500, margin: "2px 0 0" }}>
            Monitoring: {selectedPatient.name} Room {selectedPatient.room}
          </p>
        </div>
        <div style={{ fontSize: 12, color: C.gray400 }}>Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 22 }}>💓</div>
          <div style={{ color: C.gray500, fontSize: 13, fontWeight: 500 }}>Heart Rate</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: C.gray800 }}>{latest.hr}</span>
            <span style={{ fontSize: 14, color: C.gray400 }}>bpm</span>
          </div>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 22 }}>💨</div>
          <div style={{ color: C.gray500, fontSize: 13, fontWeight: 500 }}>Oxygen</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: C.gray800 }}>{latest.o2}</span>
            <span style={{ fontSize: 14, color: C.gray400 }}>%</span>
          </div>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 22 }}>🩸</div>
          <div style={{ color: C.gray500, fontSize: 13, fontWeight: 500 }}>Sys. BP</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: C.gray800 }}>{latest.sbp}</span>
            <span style={{ fontSize: 14, color: C.gray400 }}>mmHg</span>
          </div>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 22 }}>🔵</div>
          <div style={{ color: C.gray500, fontSize: 13, fontWeight: 500 }}>Dia. BP</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: C.gray800 }}>{latest.dbp}</span>
            <span style={{ fontSize: 14, color: C.gray400 }}>mmHg</span>
          </div>
        </Card>
      </div>

      {user.role === "Parent" && (
        <Card style={{ background: `linear-gradient(135deg, ${C.redLight}, #FFF0F0)`, border: `1px solid ${C.red}33` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.gray800 }}>Emergency Alert</div>
              <div style={{ fontSize: 13, color: C.gray500, marginTop: 2 }}>Immediately notify all medical staff</div>
            </div>
            <Button variant="danger" onClick={() => onNav("emergency")}
              style={{ padding: "14px 32px", fontSize: 16, fontWeight: 700 }}>
              EMERGENCY
            </Button>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {user.role === "Care Manager" && (
          <Card>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gray800, marginBottom: 16 }}>Add Health Data</div>
            <div style={{ marginBottom: 14 }}>
              <Select label="Select Patient" value={selectedPatient._id}
                onChange={e => setSelectedPatient(MOCK_PATIENTS.find(p => p._id === e.target.value))}
                options={MOCK_PATIENTS.map(p => ({ value: p._id, label: p.name }))} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <Input label="Heart Rate" placeholder="bpm" value={form.hr} onChange={e => setForm({ ...form, hr: e.target.value })} required />
              <Input label="Oxygen Level" placeholder="%" value={form.o2} onChange={e => setForm({ ...form, o2: e.target.value })} required />
              <Input label="Systolic BP" placeholder="mmHg" value={form.sbp} onChange={e => setForm({ ...form, sbp: e.target.value })} required />
              <Input label="Diastolic BP" placeholder="mmHg" value={form.dbp} onChange={e => setForm({ ...form, dbp: e.target.value })} required />
            </div>
            {submitted && (
              <div style={{ background: C.greenLight, color: C.green, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
                Health data recorded successfully
              </div>
            )}
            <Button onClick={submit} style={{ width: "100%" }}>Submit Health Data</Button>
          </Card>
        )}

        <AlertsPanel alerts={alerts} />
      </div>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.gray800, marginBottom: 4 }}>
          Weekly Health Trends — {selectedPatient.name}
        </div>
        <div style={{ fontSize: 12, color: C.gray400, marginBottom: 16 }}>Past 7 days</div>
        <LineChart data={history} keys={["hr", "o2", "sbp"]} colors={[C.red, C.blue, C.green]} labels={["Heart Rate", "Oxygen %", "Systolic BP"]} />
      </Card>

      <Card>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.gray800, marginBottom: 14 }}>Recent Patients</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.gray50 }}>
                {["Patient", "Age", "Room", "HR", "O2", "BP", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: C.gray500, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => {
                const h = genHistory(p._id);
                const l = h[h.length - 1];
                const s = getStatus(l.hr, l.o2, l.sbp);
                return (
                  <tr key={p._id} style={{ borderTop: `1px solid ${C.gray100}`, background: i % 2 === 0 ? C.white : C.gray50 }}>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ fontWeight: 600, color: C.gray800 }}>{p.name}</div>
                    </td>
                    <td style={{ padding: "12px 12px", color: C.gray500 }}>{p.age}</td>
                    <td style={{ padding: "12px 12px", color: C.gray500 }}>{p.room}</td>
                    <td style={{ padding: "12px 12px", fontWeight: 600, color: C.gray700 }}>{l.hr}</td>
                    <td style={{ padding: "12px 12px", fontWeight: 600, color: C.gray700 }}>{l.o2}%</td>
                    <td style={{ padding: "12px 12px", fontWeight: 600, color: C.gray700 }}>{l.sbp}/{l.dbp}</td>
                    <td style={{ padding: "12px 12px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                        background: s === "critical" ? C.redLight : s === "warning" ? C.yellowLight : C.greenLight,
                        color: s === "critical" ? C.red : s === "warning" ? C.yellow : C.green,
                        textTransform: "uppercase",
                      }}>{s}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
