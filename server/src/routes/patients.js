const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const HealthRecord = require('../models/HealthRecord');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    let patients;
    
    if (req.user.role === 'Care Manager') {
      patients = await Patient.find({ isActive: true })
        .populate('assignedCareManager', 'name email')
        .sort({ name: 1 });
    } else {
      patients = await Patient.find({ 
        isActive: true,
        $or: [
          { familyMembers: req.user._id },
          { assignedCareManager: req.user._id }
        ]
      }).sort({ name: 1 });
    }

    const patientsWithLatestRecord = await Promise.all(
      patients.map(async (patient) => {
        const latestRecord = await HealthRecord.findOne({ patient: patient._id })
          .sort({ readingTime: -1 })
          .select('heartRate oxygenLevel systolicBP diastolicBP readingTime status');
        
        return {
          ...patient.toObject(),
          latestRecord: latestRecord ? {
            heartRate: latestRecord.heartRate,
            oxygenLevel: latestRecord.oxygenLevel,
            systolicBP: latestRecord.systolicBP,
            diastolicBP: latestRecord.diastolicBP,
            readingTime: latestRecord.readingTime,
            status: latestRecord.status
          } : null
        };
      })
    );

    res.json({
      success: true,
      count: patientsWithLatestRecord.length,
      data: patientsWithLatestRecord
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedCareManager', 'name email phone')
      .populate('familyMembers', 'name email phone');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient' });
  }
});

router.post('/', protect, authorize('Care Manager'), async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      assignedCareManager: req.user._id
    };

    const patient = await Patient.create(patientData);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ message: 'Error creating patient' });
  }
});

router.put('/:id', protect, authorize('Care Manager'), async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient' });
  }
});

router.delete('/:id', protect, authorize('Care Manager'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    patient.isActive = false;
    await patient.save();

    res.json({
      success: true,
      message: 'Patient deactivated'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating patient' });
  }
});

module.exports = router;
