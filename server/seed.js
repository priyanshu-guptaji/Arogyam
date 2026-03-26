const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');
const HealthRecord = require('./src/models/HealthRecord');
const Alert = require('./src/models/Alert');

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Patient.deleteMany({});
    await HealthRecord.deleteMany({});
    await Alert.deleteMany({});
    console.log('Cleared existing data');

    const users = await User.create([
      {
        name: 'Sarah Mitchell',
        email: 'sarah@eldercare.com',
        password: 'password123',
        role: 'Care Manager',
        phone: '+1 555-0101'
      },
      {
        name: 'James Wilson',
        email: 'james@eldercare.com',
        password: 'password123',
        role: 'Parent',
        phone: '+1 555-0102'
      },
      {
        name: 'Emily Chen',
        email: 'emily@eldercare.com',
        password: 'password123',
        role: 'Child',
        phone: '+1 555-0103'
      }
    ]);
    console.log('Created users');

    const careManager = users[0];
    const parent = users[1];

    const patients = await Patient.create([
      {
        name: 'Margaret Thompson',
        age: 78,
        room: 'A-102',
        floor: '1st Floor',
        bedNumber: '1',
        diagnosis: 'Post-operative recovery - Hip replacement',
        allergies: ['Penicillin', 'Sulfa'],
        emergencyContact: {
          name: 'James Wilson',
          phone: '+1 555-0102',
          relationship: 'Son'
        },
        assignedCareManager: careManager._id,
        familyMembers: [parent._id],
        notes: 'Requires mobility assistance. Physical therapy scheduled Mon/Wed/Fri.'
      },
      {
        name: 'Robert Johnson',
        age: 83,
        room: 'B-205',
        floor: '2nd Floor',
        bedNumber: '2',
        diagnosis: 'Congestive heart failure - stable',
        allergies: [],
        emergencyContact: {
          name: 'Linda Johnson',
          phone: '+1 555-0201',
          relationship: 'Daughter'
        },
        assignedCareManager: careManager._id,
        notes: 'Daily weight monitoring required. Low sodium diet.'
      },
      {
        name: 'Eleanor Davis',
        age: 71,
        room: 'C-308',
        floor: '3rd Floor',
        bedNumber: '1',
        diagnosis: 'Type 2 Diabetes - managed',
        allergies: ['Latex'],
        emergencyContact: {
          name: 'Michael Davis',
          phone: '+1 555-0301',
          relationship: 'Husband'
        },
        assignedCareManager: careManager._id,
        notes: 'Insulin dependent. Regular blood glucose checks.'
      },
      {
        name: 'William Chen',
        age: 89,
        room: 'A-115',
        floor: '1st Floor',
        bedNumber: '3',
        diagnosis: 'Alzheimer\'s disease - early stage',
        allergies: [],
        emergencyContact: {
          name: 'Susan Chen',
          phone: '+1 555-0115',
          relationship: 'Daughter'
        },
        assignedCareManager: careManager._id,
        notes: 'Orientation assistance needed. Fall risk - bed alarm activated.'
      }
    ]);
    console.log('Created patients');

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const healthRecords = [];

    for (const patient of patients) {
      for (let i = 0; i < 7; i++) {
        const baseHR = 70 + Math.random() * 20;
        const baseO2 = 95 + Math.random() * 3;
        const baseSBP = 120 + Math.random() * 20;
        const baseDBP = 75 + Math.random() * 15;

        const record = await HealthRecord.create({
          patient: patient._id,
          heartRate: Math.round(baseHR + (Math.random() > 0.7 ? 15 : 0)),
          oxygenLevel: Math.round((baseO2 - (Math.random() > 0.8 ? 4 : 0)) * 10) / 10,
          systolicBP: Math.round(baseSBP + (Math.random() > 0.8 ? 25 : 0)),
          diastolicBP: Math.round(baseDBP + (Math.random() > 0.8 ? 15 : 0)),
          recordedBy: careManager._id,
          readingTime: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000 - Math.random() * 4 * 60 * 60 * 1000)
        });
        healthRecords.push(record);
      }
    }
    console.log('Created health records');

    const alerts = [];
    for (let i = 0; i < 5; i++) {
      const patient = patients[i % patients.length];
      const criticalRecords = healthRecords.filter(r => 
        r.patient.toString() === patient._id.toString() && 
        (r.heartRate > 100 || r.oxygenLevel < 93 || r.systolicBP > 155)
      );

      if (criticalRecords.length > 0) {
        const record = criticalRecords[0];
        const alert = await Alert.create({
          patient: patient._id,
          healthRecord: record._id,
          type: record.heartRate > 100 || record.systolicBP > 155 ? 'critical' : 'warning',
          message: `Abnormal reading detected for ${patient.name}: HR ${record.heartRate} bpm, O₂ ${record.oxygenLevel}%, BP ${record.systolicBP}/${record.diastolicBP} mmHg`,
          heartRate: record.heartRate,
          oxygenLevel: record.oxygenLevel,
          systolicBP: record.systolicBP,
          diastolicBP: record.diastolicBP,
          createdAt: new Date(Date.now() - i * 3 * 60 * 60 * 1000)
        });
        alerts.push(alert);
      }
    }
    console.log('Created alerts');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test Credentials:');
    console.log('─────────────────');
    console.log('Care Manager: sarah@eldercare.com / password123');
    console.log('Parent: james@eldercare.com / password123');
    console.log('Child: emily@eldercare.com / password123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
