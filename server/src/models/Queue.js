const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, 'Clinic ID is required']
    },
    tokenNumber: {
      type: Number,
      required: [true, 'Token number is required']
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      maxlength: [100, 'Patient name cannot exceed 100 characters']
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'],
      default: 'WAITING'
    },
    checkInTime: {
      type: Date,
      default: Date.now
    },
    calledAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    consultationDurationMinutes: {
      type: Number
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Add single-field and compound indexes for fast querying
queueSchema.index({ status: 1 });
queueSchema.index({ tokenNumber: 1 });
queueSchema.index({ clinicId: 1, createdAt: 1 });

module.exports = mongoose.model('Queue', queueSchema);
