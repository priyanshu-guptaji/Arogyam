import { useState, useEffect } from 'react';
import { patientAPI, healthAPI, alertAPI } from '../utils/api';
import { HealthCard, HealthCardSkeleton, AlertPanel, TrendChart, PatientTable, AddHealthForm } from '../components/dashboard';

export function CareManagerDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsRes, alertsRes] = await Promise.all([
        patientAPI.getAll(),
        alertAPI.getAll()
      ]);
      
      if (patientsRes.data.success) {
        setPatients(patientsRes.data.data);
        if (patientsRes.data.data.length > 0) {
          setSelectedPatient(patientsRes.data.data[0]);
        }
      }
      
      if (alertsRes.data.success) {
        setAlerts(alertsRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      loadHistory();
    }
  }, [selectedPatient]);

  const loadHistory = async () => {
    try {
      const res = await patientAPI.getPatientHealthHistory(selectedPatient._id, 7);
      if (res.data.success && res.data.data.length > 0) {
        setHistory(res.data.data.reverse());
      } else {
        setHistory([]);
      }
    } catch (err) {
      setHistory([]);
    }
  };

  const handleAddHealth = async (data) => {
    setSubmitting(true);
    try {
      await healthAPI.create(data);
      loadHistory();
      loadData();
    } catch (err) {
      console.error('Error adding health data:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const latest = history[history.length - 1] || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <>
            <HealthCardSkeleton />
            <HealthCardSkeleton />
            <HealthCardSkeleton />
            <HealthCardSkeleton />
          </>
        ) : (
          <>
            <HealthCard
              label="Heart Rate"
              value={latest.heartRate}
              unit="bpm"
              alertType={latest.alertType}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            />
            <HealthCard
              label="Oxygen Level"
              value={latest.oxygenLevel}
              unit="%"
              alertType={latest.alertType}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              }
            />
            <HealthCard
              label="Systolic BP"
              value={latest.systolicBP}
              unit="mmHg"
              alertType={latest.alertType}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <HealthCard
              label="Diastolic BP"
              value={latest.diastolicBP}
              unit="mmHg"
              alertType={latest.alertType}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TrendChart
            data={history}
            loading={loading}
            title="Health Trends"
            patientName={selectedPatient?.name}
          />
        </div>
        <div>
          <AddHealthForm
            patients={patients}
            onSubmit={handleAddHealth}
            loading={submitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PatientTable
            patients={patients}
            loading={loading}
            showActions={true}
          />
        </div>
        <div>
          <AlertPanel alerts={alerts} loading={loading} showActions={true} />
        </div>
      </div>
    </div>
  );
}
