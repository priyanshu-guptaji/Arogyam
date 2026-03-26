import { useState, useEffect } from 'react';
import { patientAPI, fallbackAPI, healthAPI } from '../utils/api';

const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await patientAPI.getAll();
      setPatients(res.data.data || []);
    } catch (err) {
      console.warn('Using fallback data:', err.message);
      const res = await fallbackAPI.getPatients();
      setPatients(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const getPatientStatus = async (patientId) => {
    try {
      const res = await healthAPI.getLatest(patientId);
      if (res.data.data) {
        const r = res.data.data;
        const hr = r.heartRate || 72;
        const o2 = r.oxygenLevel || 97;
        const sbp = r.systolicBP || 120;
        
        if (hr > 100 || o2 < 93 || sbp > 155) return 'critical';
        if (hr > 90 || o2 < 96 || sbp > 140) return 'warning';
        return 'normal';
      }
    } catch (e) {}
    return 'normal';
  };

  const addPatient = async (data) => {
    try {
      const res = await patientAPI.create(data);
      if (res.data.data) {
        setPatients(prev => [...prev, res.data.data]);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updatePatient = async (id, data) => {
    try {
      const res = await patientAPI.update(id, data);
      if (res.data.data) {
        setPatients(prev => prev.map(p => p._id === id ? res.data.data : p));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deletePatient = async (id) => {
    try {
      await patientAPI.delete(id);
      setPatients(prev => prev.filter(p => p._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { patients, loading, error, fetchPatients, addPatient, updatePatient, deletePatient, getPatientStatus };
};

export function PatientsPage({ user }) {
  const { patients, loading, error, fetchPatients, addPatient, updatePatient, deletePatient, getPatientStatus } = usePatients();
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState({ name: '', age: '', room: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [patientStatuses, setPatientStatuses] = useState({});

  useEffect(() => {
    const loadStatuses = async () => {
      const statuses = {};
      for (const p of patients) {
        statuses[p._id] = await getPatientStatus(p._id);
      }
      setPatientStatuses(statuses);
    };
    if (patients.length > 0) {
      loadStatuses();
    }
  }, [patients]);

  const openAddModal = () => {
    setEditPatient(null);
    setForm({ name: '', age: '', room: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditPatient(patient);
    setForm({ name: patient.name, age: patient.age, room: patient.room });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!form.age || form.age < 1 || form.age > 150) {
      setFormError('Please enter a valid age');
      return;
    }
    if (!form.room.trim()) {
      setFormError('Room number is required');
      return;
    }

    setSubmitting(true);
    const data = { name: form.name.trim(), age: parseInt(form.age), room: form.room.trim() };
    const result = editPatient 
      ? await updatePatient(editPatient._id, data)
      : await addPatient(data);

    setSubmitting(false);

    if (result.success) {
      setShowModal(false);
      if (!editPatient) fetchPatients();
    } else {
      setFormError(result.error || 'Failed to save patient');
    }
  };

  const handleDelete = async (id) => {
    const result = await deletePatient(id);
    if (result.success) {
      setDeleteConfirm(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'critical':
        return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Critical' };
      case 'warning':
        return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Warning' };
      default:
        return { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Normal' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading patients...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Error loading patients</p>
        <p className="text-sm text-red-500 mt-1">{error}</p>
        <button onClick={fetchPatients} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">{patients.length} registered patient{patients.length !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'Care Manager' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Patient
          </button>
        )}
      </div>

      {patients.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-700 mb-1">No patients yet</h3>
          <p className="text-slate-500 mb-4">Add your first patient to start monitoring health</p>
          {user?.role === 'Care Manager' && (
            <button onClick={openAddModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add First Patient
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p) => {
            const status = patientStatuses[p._id] || 'normal';
            const config = getStatusConfig(status);

            return (
              <div key={p._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{p.name}</h3>
                      <p className="text-sm text-slate-500">Room {p.room} · {p.age} yrs</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 mb-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{p.latestRecord?.heartRate || '--'}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">BPM</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{p.latestRecord?.oxygenLevel || '--'}%</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">O₂</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{p.latestRecord?.systolicBP || '--'}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">mmHg</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    View Details
                  </button>
                  {user?.role === 'Care Manager' && (
                    <>
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit patient"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete patient"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-6">{editPatient ? 'Edit Patient' : 'Add New Patient'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Age</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  placeholder="Enter age"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g., A-102"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : editPatient ? 'Update Patient' : 'Add Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Delete Patient?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to delete <span className="font-medium text-slate-700">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
