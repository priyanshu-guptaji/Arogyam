const mongoose = require('mongoose');
const queueService = require('../services/queueService');
const clinicRepository = require('../repositories/clinicRepository');
const Queue = require('../models/Queue');
const Clinic = require('../models/Clinic');
require('dotenv').config();

// Mock socket manager to avoid running a live socket server in tests
jest.mock('../socket/socketManager', () => ({
  broadcastToClinic: jest.fn()
}));

describe('Queue Service Integration Tests', () => {
  let clinicId;
  jest.setTimeout(30000);

  beforeAll(async () => {
    const testURI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/clinicflow_test')
      .replace('/eldercare', '/clinicflow_test')
      .replace('/arogyam', '/clinicflow_test');
    await mongoose.connect(testURI);
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Clinic.deleteMany({});
    await Queue.deleteMany({});

    // Create a fresh test clinic before each test
    const clinic = await Clinic.create({
      name: 'Test Med Clinic',
      consultationAverageMinutes: 10
    });
    clinicId = clinic._id;
  });

  test('should add a patient, assign token 1, and estimate wait time', async () => {
    const patientData = {
      patientName: 'John Doe',
      phoneNumber: '9876543210',
      notes: 'First time checkup'
    };

    const patient = await queueService.addPatient(clinicId, patientData);

    expect(patient).toBeDefined();
    expect(patient.tokenNumber).toBe(1);
    expect(patient.patientName).toBe(patientData.patientName);
    expect(patient.status).toBe('WAITING');
    // First patient in queue has 0 patients ahead, so estimated wait should be 0
    expect(patient.estimatedWaitMinutes).toBe(0);

    // Add second patient
    const patient2 = await queueService.addPatient(clinicId, {
      patientName: 'Jane Smith'
    });
    expect(patient2.tokenNumber).toBe(2);
    // Since John Doe is waiting ahead of Jane Smith, estimated wait should be 1 * 10 = 10 mins
    expect(patient2.estimatedWaitMinutes).toBe(10);
  });

  test('should atomically call next waiting patient and shift wait times', async () => {
    // Add three patients
    await queueService.addPatient(clinicId, { patientName: 'Patient 1' });
    await queueService.addPatient(clinicId, { patientName: 'Patient 2' });
    await queueService.addPatient(clinicId, { patientName: 'Patient 3' });

    // Call next patient (should be Patient 1)
    const calledPatient = await queueService.callNext(clinicId);
    expect(calledPatient.patientName).toBe('Patient 1');
    expect(calledPatient.status).toBe('IN_PROGRESS');
    expect(calledPatient.calledAt).toBeDefined();

    // Verify Patient 2 and Patient 3 wait times.
    // Patient 1 is in progress (counts as 1 patient ahead).
    // Patient 2 is WAITING (has 1 patient ahead: Patient 1 in progress). Wait is 10 mins.
    // Patient 3 is WAITING (has 2 patients ahead: Patient 1 in progress + Patient 2 waiting). Wait is 20 mins.
    const activeQueue = await queueService.getActiveQueue(clinicId);
    
    const p2 = activeQueue.find(p => p.patientName === 'Patient 2');
    const p3 = activeQueue.find(p => p.patientName === 'Patient 3');

    expect(p2.estimatedWaitMinutes).toBe(10);
    expect(p3.estimatedWaitMinutes).toBe(20);
  });

  test('should calculate average consultation duration dynamically after 5 completed sessions', async () => {
    // Add & Complete 5 patients with durations: 12, 8, 15, 10, 15 minutes (Average = 12 mins)
    const durations = [12, 8, 15, 10, 15];
    
    for (let i = 0; i < durations.length; i++) {
      const p = await queueService.addPatient(clinicId, { patientName: `Patient ${i}` });
      // Call
      await Queue.findByIdAndUpdate(p._id, { status: 'IN_PROGRESS', calledAt: new Date(Date.now() - durations[i] * 60 * 1000) });
      // Complete
      await queueService.completePatient(clinicId, p._id);
    }

    // Now verify the clinic's average consultation duration is updated to 12
    const clinic = await clinicRepository.findById(clinicId);
    expect(clinic.consultationAverageMinutes).toBe(12);

    // Add a new patient and verify wait time uses the new 12 minute average
    const newPatient = await queueService.addPatient(clinicId, { patientName: 'Future Patient' });
    // Since there are no active patients, wait time is 0.
    expect(newPatient.estimatedWaitMinutes).toBe(0);

    // Add another, wait time should be 12 mins
    const newPatient2 = await queueService.addPatient(clinicId, { patientName: 'Future Patient 2' });
    expect(newPatient2.estimatedWaitMinutes).toBe(12);
  });

  test('should handle callNext concurrency safely', async () => {
    // Seed 10 patients
    for (let i = 0; i < 5; i++) {
      await queueService.addPatient(clinicId, { patientName: `Patient ${i}` });
    }

    // Simulate two receptionists clicking "Call Next" simultaneously using Promise.all
    const [call1, call2] = await Promise.all([
      queueService.callNext(clinicId),
      queueService.callNext(clinicId)
    ]);

    // Ensure they called different patients
    expect(call1).not.toBeNull();
    expect(call2).not.toBeNull();
    expect(call1._id.toString()).not.toBe(call2._id.toString());
    
    // One should be Patient 0, the other Patient 1
    const names = [call1.patientName, call2.patientName];
    expect(names).toContain('Patient 0');
    expect(names).toContain('Patient 1');
  });
});
