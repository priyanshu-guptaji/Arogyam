const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Clinic = require('./src/models/Clinic');
const Queue = require('./src/models/Queue');
require('dotenv').config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clean existing data
    await User.deleteMany({});
    await Clinic.deleteMany({});
    await Queue.deleteMany({});
    console.log('Cleared existing data');

    // 1. Create a Clinic
    const clinic = await Clinic.create({
      name: 'Arogya Clinic',
      consultationAverageMinutes: 10,
      tokenCounter: 15
    });
    console.log(`Created Clinic: ${clinic.name} (${clinic._id})`);

    // 2. Create staff users
    const adminUser = await User.create({
      name: 'Dr. Ramesh Sharma',
      email: 'admin@arogya.in',
      password: 'password123',
      role: 'Admin',
      phone: '9876543210',
      clinicId: clinic._id
    });

    const receptionistUser = await User.create({
      name: 'Priya Patel',
      email: 'receptionist@arogya.in',
      password: 'password123',
      role: 'Receptionist',
      phone: '9876543211',
      clinicId: clinic._id
    });

    console.log('Created Staff Users:');
    console.log(`- Admin: ${adminUser.email}`);
    console.log(`- Receptionist: ${receptionistUser.email}`);

    // 3. Create historical completed consultations from earlier today
    const now = new Date();
    const completedDurations = [8, 12, 10, 9, 11, 7, 13, 10, 9, 11]; // Average = 10 mins
    const completedPatients = [
      'Rajesh Kumar', 'Sita Devi', 'Amit Singh', 'Meena Sharma', 'Vijay Patel',
      'Anjali Gupta', 'Vikram Rathore', 'Komal Malhotra', 'Rohan Das', 'Sunita Rao'
    ];

    const completedOps = completedDurations.map((duration, index) => {
      const checkIn = new Date(now.getTime() - (3 * 60 * 60 * 1000) + (index * 15 * 60 * 1000));
      const called = new Date(checkIn.getTime() + 10 * 60 * 1000); // Waited 10 mins
      const completed = new Date(called.getTime() + duration * 60 * 1000);

      return {
        clinicId: clinic._id,
        tokenNumber: index + 1,
        patientName: completedPatients[index],
        phoneNumber: `987654320${index}`,
        notes: `Routine consultation checkup #${index + 1}`,
        status: 'COMPLETED',
        checkInTime: checkIn,
        calledAt: called,
        completedAt: completed,
        consultationDurationMinutes: duration,
        estimatedWaitMinutes: 0
      };
    });

    await Queue.insertMany(completedOps);
    console.log(`Seeded ${completedOps.length} completed consultations.`);

    // 4. Create some active waiting and in-progress patients
    const waitingPatients = [
      { name: 'Sanjay Dutt', phone: '9999999901', notes: 'Mild fever and cold' },
      { name: 'Rekha Sen', phone: '9999999902', notes: 'Blood pressure check' },
      { name: 'Deepak Chopra', phone: '9999999903', notes: 'Suture removal' },
      { name: 'Kiran Mazumdar', phone: '9999999904', notes: 'Thyroid prescription review' }
    ];

    // Seed 1 active patient in consultation
    const inProgressPatient = await Queue.create({
      clinicId: clinic._id,
      tokenNumber: 11,
      patientName: 'Dev Anand',
      phoneNumber: '9999999900',
      notes: 'Consultation about shoulder pain',
      status: 'IN_PROGRESS',
      checkInTime: new Date(now.getTime() - 15 * 60 * 1000),
      calledAt: new Date(now.getTime() - 5 * 60 * 1000),
      estimatedWaitMinutes: 0
    });
    console.log(`Seeded 1 active consultation: ${inProgressPatient.patientName}`);

    // Seed 4 waiting patients
    for (let i = 0; i < waitingPatients.length; i++) {
      const patient = waitingPatients[i];
      const checkIn = new Date(now.getTime() - (waitingPatients.length - i) * 5 * 60 * 1000);
      const index = i;
      const patientsAhead = index + 1; // Dev Anand is in progress, so +1
      const averageDuration = 10;
      const estimatedWait = patientsAhead * averageDuration;

      await Queue.create({
        clinicId: clinic._id,
        tokenNumber: 12 + i,
        patientName: patient.name,
        phoneNumber: patient.phone,
        notes: patient.notes,
        status: 'WAITING',
        checkInTime: checkIn,
        estimatedWaitMinutes: estimatedWait
      });
    }
    console.log(`Seeded ${waitingPatients.length} waiting patients.`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test Credentials:');
    console.log('─────────────────');
    console.log('Admin (Doctor): admin@arogya.in / password123');
    console.log('Receptionist: receptionist@arogya.in / password123');
    console.log(`Clinic ID: ${clinic._id}`);
    console.log(`Public Waiting Room URL: http://localhost:5173/waiting-room/${clinic._id}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
