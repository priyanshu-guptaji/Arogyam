const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age seems invalid']
  },
  room: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  floor: {
    type: String,
    default: ''
  },
  bedNumber: {
    type: String,
    default: ''
  },
  admissionDate: {
    type: Date,
    default: Date.now
  },
  diagnosis: {
    type: String,
    default: ''
  },
  allergies: [{
    type: String
  }],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  assignedCareManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  familyMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', patientSchema);
