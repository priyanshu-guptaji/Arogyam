const mongoose = require('mongoose');
const authService = require('../services/authService');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
require('dotenv').config();

describe('Auth Service Integration Tests', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    // Redirect connection to a sandboxed test database
    const testURI = (process.env.MONGODB_URI || 'mongodb://localhost:27017/clinicflow_test')
      .replace('/eldercare', '/clinicflow_test')
      .replace('/arogyam', '/clinicflow_test');
    await mongoose.connect(testURI);
  });

  afterAll(async () => {
    // Clean up and close connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Clinic.deleteMany({});
  });

  test('should register a new receptionist and automatically create a clinic', async () => {
    const registerData = {
      name: 'Test Receptionist',
      email: 'test_receptionist@clinicflow.test',
      password: 'password123',
      role: 'Receptionist',
      clinicName: 'Test General Clinic'
    };

    const result = await authService.register(registerData);

    expect(result).toHaveProperty('token');
    expect(result.user).toHaveProperty('id');
    expect(result.user.name).toBe(registerData.name);
    expect(result.user.email).toBe(registerData.email);
    expect(result.user.role).toBe('Receptionist');
    expect(result.user.clinicId).toBeDefined();

    // Verify clinic was created
    const clinic = await Clinic.findById(result.user.clinicId);
    expect(clinic).toBeDefined();
    expect(clinic.name).toBe(registerData.clinicName);
    expect(clinic.consultationAverageMinutes).toBe(10);
  });

  test('should login successfully with correct credentials', async () => {
    const registerData = {
      name: 'Test Admin',
      email: 'test_admin@clinicflow.test',
      password: 'password123',
      role: 'Admin',
      clinicName: 'Test Dental Clinic'
    };

    // First register
    const registered = await authService.register(registerData);
    expect(registered).toBeDefined();

    // Now attempt login
    const loginResult = await authService.login(registerData.email, registerData.password);
    expect(loginResult).toHaveProperty('token');
    expect(loginResult.user.email).toBe(registerData.email);
    expect(loginResult.user.role).toBe('Admin');
  });

  test('should throw error for non-existent email', async () => {
    await expect(
      authService.login('non_existent@clinicflow.test', 'password123')
    ).rejects.toThrow('Invalid email or password');
  });

  test('should throw error for incorrect password', async () => {
    const registerData = {
      name: 'Test staff',
      email: 'staff@clinicflow.test',
      password: 'password123',
      clinicName: 'Staff Clinic'
    };

    await authService.register(registerData);

    await expect(
      authService.login(registerData.email, 'wrongpassword')
    ).rejects.toThrow('Invalid email or password');
  });
});
