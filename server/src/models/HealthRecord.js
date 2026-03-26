const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  heartRate: {
    type: Number,
    required: [true, 'Heart rate is required'],
    min: [20, 'Heart rate seems too low'],
    max: [300, 'Heart rate seems too high']
  },
  oxygenLevel: {
    type: Number,
    required: [true, 'Oxygen level is required'],
    min: [50, 'Oxygen level seems too low'],
    max: [100, 'Oxygen level cannot exceed 100']
  },
  systolicBP: {
    type: Number,
    required: [true, 'Systolic BP is required'],
    min: [60, 'Systolic BP seems too low'],
    max: [300, 'Systolic BP seems too high']
  },
  diastolicBP: {
    type: Number,
    required: [true, 'Diastolic BP is required'],
    min: [30, 'Diastolic BP seems too low'],
    max: [200, 'Diastolic BP seems too high']
  },
  temperature: {
    type: Number,
    default: null
  },
  respiratoryRate: {
    type: Number,
    default: null
  },
  alertType: {
    type: String,
    enum: ['Normal', 'Warning', 'Critical'],
    default: 'Normal'
  },
  alertReason: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  readingTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

healthRecordSchema.pre('save', function(next) {
  const hr = this.heartRate;
  const o2 = this.oxygenLevel;
  const sbp = this.systolicBP;
  const dbp = this.diastolicBP;
  
  const reasons = [];
  
  if (o2 < 92) {
    this.alertType = 'Critical';
    reasons.push(`Oxygen (${o2}%) below critical level`);
  } else if (hr < 50 || hr > 110) {
    this.alertType = 'Warning';
    reasons.push(`Heart rate (${hr} bpm) outside normal range`);
  } else if (sbp > 140 || dbp > 90) {
    this.alertType = 'Warning';
    reasons.push(`Blood pressure (${sbp}/${dbp}) elevated`);
  } else {
    this.alertType = 'Normal';
  }
  
  this.alertReason = reasons.join(', ');
  next();
});

healthRecordSchema.index({ patient: 1, readingTime: -1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
