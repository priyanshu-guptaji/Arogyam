const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { patientId, startDate, endDate, status, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    if (patientId) {
      query.patient = patientId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.readingTime = {};
      if (startDate) query.readingTime.$gte = new Date(startDate);
      if (endDate) query.readingTime.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const records = await HealthRecord.find(query)
      .populate('patient', 'name room')
      .populate('recordedBy', 'name')
      .sort({ readingTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await HealthRecord.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ message: 'Error fetching health records' });
  }
});

router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const records = await HealthRecord.find({
      patient: req.params.patientId,
      readingTime: { $gte: startDate }
    })
      .sort({ readingTime: 1 })
      .limit(100);

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient health records' });
  }
});

router.post('/', protect, authorize('Care Manager'), async (req, res) => {
  try {
    const { patient, heartRate, oxygenLevel, systolicBP, diastolicBP, temperature, respiratoryRate, notes } = req.body;

    if (!patient || !heartRate || !oxygenLevel || !systolicBP || !diastolicBP) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const record = await HealthRecord.create({
      patient,
      heartRate,
      oxygenLevel,
      systolicBP,
      diastolicBP,
      temperature,
      respiratoryRate,
      notes,
      recordedBy: req.user._id
    });

    await record.populate('patient', 'name room');
    await record.populate('recordedBy', 'name');

    if (record.status === 'critical' || record.status === 'warning') {
      let alertMessage = `Abnormal reading detected for ${patientExists.name}`;
      const abnormalParams = [];
      
      if (heartRate > 100) abnormalParams.push(`HR: ${heartRate} bpm (high)`);
      if (heartRate < 60) abnormalParams.push(`HR: ${heartRate} bpm (low)`);
      if (oxygenLevel < 93) abnormalParams.push(`O₂: ${oxygenLevel}% (low)`);
      if (systolicBP > 155) abnormalParams.push(`SBP: ${systolicBP} mmHg (high)`);
      if (systolicBP > 140) abnormalParams.push(`SBP: ${systolicBP} mmHg (elevated)`);

      if (abnormalParams.length > 0) {
        alertMessage += `: ${abnormalParams.join(', ')}`;
      }

      await Alert.create({
        patient: patient,
        healthRecord: record._id,
        type: record.status,
        message: alertMessage,
        heartRate,
        oxygenLevel,
        systolicBP,
        diastolicBP
      });
    }

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ message: 'Error creating health record' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('patient', 'name room age')
      .populate('recordedBy', 'name');

    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health record' });
  }
});

module.exports = router;
