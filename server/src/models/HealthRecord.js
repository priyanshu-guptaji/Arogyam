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
  status: {
    type: String,
    enum: ['normal', 'warning', 'critical'],
    default: 'normal'
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

  if (hr > 100 || o2 < 93 || sbp > 155) {
    this.status = 'critical';
  } else if (hr > 90 || o2 < 96 || sbp > 140) {
    this.status = 'warning';
  } else {
    this.status = 'normal';
  }
  next();
});

healthRecordSchema.index({ patient: 1, readingTime: -1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
