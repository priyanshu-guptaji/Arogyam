const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
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

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const patientAPI = {
  getAll: () => api.get('/patients'),
  getOne: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  getHealthHistory: (id, days = 30) => api.get(`/patients/${id}/health?days=${days}`)
};

export const healthAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/health${query ? '?' + query : ''}`);
  },
  create: (data) => api.post('/health', data),
  getOne: (id) => api.get(`/health/${id}`),
  getLatest: (patientId) => api.get(`/health/patient/${patientId}`)
};

export const alertAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/alerts${query ? '?' + query : ''}`);
  },
  markAsRead: (id) => api.put(`/alerts/read/${id}`),
  acknowledge: (id) => api.put(`/alerts/acknowledge/${id}`),
  sendEmergency: (patientId, notes) => api.post('/alerts/emergency', { patientId, notes }),
  markAllAsRead: () => api.put('/alerts/mark-all-read')
};

export const MOCK_PATIENTS = [
  { _id: '1', name: 'Margaret Thompson', age: 78, room: 'A-102', latestRecord: { heartRate: 78, oxygenLevel: 97, systolicBP: 120, diastolicBP: 80, alertType: 'Normal' } },
  { _id: '2', name: 'Robert Johnson', age: 83, room: 'B-205', latestRecord: { heartRate: 88, oxygenLevel: 94, systolicBP: 145, diastolicBP: 92, alertType: 'Warning' } },
  { _id: '3', name: 'Eleanor Davis', age: 71, room: 'C-308', latestRecord: { heartRate: 76, oxygenLevel: 96, systolicBP: 128, diastolicBP: 82, alertType: 'Normal' } },
  { _id: '4', name: 'William Chen', age: 89, room: 'A-115', latestRecord: { heartRate: 95, oxygenLevel: 93, systolicBP: 150, diastolicBP: 95, alertType: 'Warning' } },
];

export const genHistory = (patientId) => {
  const base = [
    { heartRate: 72, oxygenLevel: 98, systolicBP: 120, diastolicBP: 78 },
    { heartRate: 88, oxygenLevel: 94, systolicBP: 145, diastolicBP: 92 },
    { heartRate: 65, oxygenLevel: 97, systolicBP: 118, diastolicBP: 75 },
    { heartRate: 102, oxygenLevel: 91, systolicBP: 160, diastolicBP: 98 },
    { heartRate: 76, oxygenLevel: 96, systolicBP: 128, diastolicBP: 82 },
    { heartRate: 95, oxygenLevel: 93, systolicBP: 150, diastolicBP: 95 },
    { heartRate: 70, oxygenLevel: 98, systolicBP: 122, diastolicBP: 79 },
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return base.map((d, i) => ({
    ...d,
    date: days[i],
    time: `${8 + i * 2}:00`,
    alertType: d.heartRate > 100 || d.oxygenLevel < 93 || d.systolicBP > 155 ? 'Critical' : d.heartRate > 90 || d.oxygenLevel < 96 || d.systolicBP > 140 ? 'Warning' : 'Normal',
    patientId,
    _id: `${patientId}-${i}`,
  }));
};

export const MOCK_ALERTS = [
  { _id: '1', patient: { name: 'Margaret Thompson', room: 'A-102' }, heartRate: 102, oxygenLevel: 91, systolicBP: 160, diastolicBP: 98, type: 'Critical', createdAt: new Date(Date.now() - 300000) },
  { _id: '2', patient: { name: 'Robert Johnson', room: 'B-205' }, heartRate: 88, oxygenLevel: 94, systolicBP: 145, diastolicBP: 92, type: 'Warning', createdAt: new Date(Date.now() - 1800000) },
  { _id: '3', patient: { name: 'Eleanor Davis', room: 'C-308' }, heartRate: 76, oxygenLevel: 96, systolicBP: 128, diastolicBP: 82, type: 'Normal', createdAt: new Date(Date.now() - 86400000) },
  { _id: '4', patient: { name: 'William Chen', room: 'A-115' }, heartRate: 95, oxygenLevel: 93, systolicBP: 150, diastolicBP: 95, type: 'Warning', createdAt: new Date(Date.now() - 172800000) },
];

export const fallbackAPI = {
  async getPatients() {
    return { data: { success: true, data: MOCK_PATIENTS, count: MOCK_PATIENTS.length } };
  },
  async getAlerts() {
    return { data: { success: true, data: MOCK_ALERTS, stats: { Critical: 1, Warning: 2, Normal: 1, Emergency: 0 } } };
  },
  async getPatientRecords(patientId, days = 7) {
    return { data: { success: true, data: genHistory(patientId) } };
  },
  async createHealthRecord(data) {
    return { data: { success: true, data: { ...data, _id: Date.now().toString(), readingTime: new Date() } } };
  },
  async sendEmergency(patientId) {
    return { data: { success: true, data: { emergencyId: `EMG-${Date.now()}` } } };
  }
};
