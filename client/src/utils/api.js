import { C } from './theme';

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = { method, headers: this.getHeaders() };
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data);
    }
    try {
      const response = await fetch(url, options);
      const json = await response.json();
      if (!response.ok) throw { status: response.status, message: json.message || 'Request failed' };
      return { data: json, status: response.status };
    } catch (error) {
      throw error.status ? error : { status: 0, message: error.message || 'Network error' };
    }
  }

  get(endpoint) { return this.request('GET', endpoint); }
  post(endpoint, data) { return this.request('POST', endpoint, data); }
  put(endpoint, data) { return this.request('PUT', endpoint, data); }
  delete(endpoint) { return this.request('DELETE', endpoint); }
}

export const api = new ApiClient();

export const MOCK_PATIENTS = [
  { _id: '1', name: "Margaret Thompson", age: 78, room: "A-102" },
  { _id: '2', name: "Robert Johnson", age: 83, room: "B-205" },
  { _id: '3', name: "Eleanor Davis", age: 71, room: "C-308" },
  { _id: '4', name: "William Chen", age: 89, room: "A-115" },
];

export const genHistory = (patientId) => {
  const base = [
    { hr: 72, o2: 98, sbp: 120, dbp: 78 },
    { hr: 88, o2: 94, sbp: 145, dbp: 92 },
    { hr: 65, o2: 97, sbp: 118, dbp: 75 },
    { hr: 102, o2: 91, sbp: 160, dbp: 98 },
    { hr: 76, o2: 96, sbp: 128, dbp: 82 },
    { hr: 95, o2: 93, sbp: 150, dbp: 95 },
    { hr: 70, o2: 98, sbp: 122, dbp: 79 },
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return base.map((d, i) => ({
    ...d,
    date: days[i],
    time: `${8 + i * 2}:00`,
    status: d.hr > 100 || d.o2 < 93 || d.sbp > 155 ? "critical" : d.hr > 90 || d.o2 < 96 || d.sbp > 140 ? "warning" : "normal",
    patientId,
    _id: `${patientId}-${i}`,
  }));
};

export const MOCK_ALERTS = [
  { _id: '1', patient: "Margaret Thompson", hr: 102, o2: 91, sbp: 160, dbp: 98, type: "critical", ts: "Today 09:14" },
  { _id: '2', patient: "Robert Johnson", hr: 88, o2: 94, sbp: 145, dbp: 92, type: "warning", ts: "Today 08:30" },
  { _id: '3', patient: "Eleanor Davis", hr: 76, o2: 96, sbp: 128, dbp: 82, type: "normal", ts: "Yesterday 22:15" },
  { _id: '4', patient: "William Chen", hr: 95, o2: 93, sbp: 150, dbp: 95, type: "warning", ts: "Yesterday 18:42" },
  { _id: '5', patient: "Margaret Thompson", hr: 68, o2: 98, sbp: 118, dbp: 75, type: "normal", ts: "Yesterday 14:00" },
];

export const healthApi = {
  async getPatients() {
    try {
      return await api.get('/patients');
    } catch {
      return { data: { data: MOCK_PATIENTS } };
    }
  },
  async getPatientRecords(patientId, days = 7) {
    try {
      return await api.get(`/health-records/patient/${patientId}?days=${days}`);
    } catch {
      return { data: { data: genHistory(patientId) } };
    }
  },
  async getHealthRecords(params = {}) {
    try {
      return await api.get('/health-records');
    } catch {
      return { data: { data: MOCK_PATIENTS.flatMap(p => genHistory(p._id)) } };
    }
  },
  async getAlerts(params = {}) {
    try {
      return await api.get('/alerts');
    } catch {
      return { data: { data: MOCK_ALERTS } };
    }
  },
  async sendEmergency(patientId) {
    try {
      return await api.post('/alerts/emergency', { patientId });
    } catch {
      return { data: { data: { emergencyId: `EMG-${Date.now()}` } } };
    }
  },
};
