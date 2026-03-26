import { useState, useEffect } from 'react';
import { Card, Button, Select, Input, Modal } from '../components/UI';
import { C, getStatus } from '../utils/theme';
import { MOCK_PATIENTS, genHistory, healthApi } from '../utils/api';

export function PatientsPage({ user }) {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', room: '' });

  useEffect(() => {
    healthApi.getPatients().then(res => setPatients(res.data.data));
  }, []);

  const handleAddPatient = () => {
    const newPatient = {
      _id: String(patients.length + 1),
      name: form.name,
      age: parseInt(form.age),
      room: form.room,
    };
    setPatients([...patients, newPatient]);
    setShowModal(false);
    setForm({ name: '', age: '', room: '' });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.gray900, margin: 0 }}>Patients</h1>
          <p style={{ fontSize: 13, color: C.gray500, margin: "2px 0 0" }}>Manage and view all registered patients</p>
        </div>
        {user.role === "Care Manager" && (
          <Button onClick={() => setShowModal(true)}>+ Add Patient</Button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {patients.map((p) => {
          const history = genHistory(p._id);
          const latest = history[history.length - 1];
          const status = getStatus(latest.hr, latest.o2, latest.sbp);

          return (
            <Card key={p._id} style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}22, ${C.blue}44)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 700, color: C.blue,
                  }}>
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: C.gray800 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: C.gray500 }}>Room {p.room} Age {p.age}</div>
                  </div>
                </div>
                <span style={{
                  padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: status === "critical" ? C.redLight : status === "warning" ? C.yellowLight : C.greenLight,
                  color: status === "critical" ? C.red : status === "warning" ? C.yellow : C.green,
                  textTransform: "uppercase",
                }}>{status}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                <div style={{ textAlign: "center", padding: 12, background: C.gray50, borderRadius: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.gray800 }}>{latest.hr}</div>
                  <div style={{ fontSize: 11, color: C.gray500 }}>Heart Rate</div>
                </div>
                <div style={{ textAlign: "center", padding: 12, background: C.gray50, borderRadius: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.gray800 }}>{latest.o2}%</div>
                  <div style={{ fontSize: 11, color: C.gray500 }}>Oxygen</div>
                </div>
                <div style={{ textAlign: "center", padding: 12, background: C.gray50, borderRadius: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.gray800 }}>{latest.sbp}</div>
                  <div style={{ fontSize: 11, color: C.gray500 }}>Sys BP</div>
                </div>
              </div>

              <Button variant="ghost" style={{ width: "100%" }}>View Details</Button>
            </Card>
          );
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.gray800 }}>Add New Patient</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Full Name" placeholder="Enter patient name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Age" type="number" placeholder="Enter age" value={form.age}
            onChange={e => setForm({ ...form, age: e.target.value })} required />
          <Input label="Room Number" placeholder="e.g., A-102" value={form.room}
            onChange={e => setForm({ ...form, room: e.target.value })} required />
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button onClick={handleAddPatient} style={{ flex: 1 }}>Add Patient</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
