const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  healthRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord'
  },
  type: {
    type: String,
    enum: ['critical', 'warning', 'normal', 'emergency'],
    default: 'warning'
  },
  message: {
    type: String,
    required: true
  },
  heartRate: Number,
  oxygenLevel: Number,
  systolicBP: Number,
  diastolicBP: Number,
  isRead: {
    type: Boolean,
    default: false
  },
  isAcknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: Date,
  emergencySent: {
    type: Boolean,
    default: false
  },
  emergencyId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

alertSchema.index({ isRead: 1, createdAt: -1 });
alertSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
