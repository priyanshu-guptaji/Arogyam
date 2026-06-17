const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
      maxlength: [100, 'Clinic name cannot exceed 100 characters']
    },
    consultationAverageMinutes: {
      type: Number,
      default: 10,
      min: [1, 'Average consultation duration must be at least 1 minute']
    },
    tokenCounter: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Clinic', clinicSchema);
