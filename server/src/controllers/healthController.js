const HealthRecord = require('../models/HealthRecord');
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');

exports.getHealthRecords = async (req, res) => {
  try {
    const { patientId, startDate, endDate, alertType, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    if (patientId) {
      query.patient = patientId;
    }
    
    if (alertType && alertType !== 'All') {
      query.alertType = alertType;
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
    res.status(500).json({
      success: false,
      message: 'Error fetching health records'
    });
  }
};

exports.createHealthRecord = async (req, res) => {
  try {
    const { patient, heartRate, oxygenLevel, systolicBP, diastolicBP, temperature, respiratoryRate, notes } = req.body;

    if (!patient || !heartRate || !oxygenLevel || !systolicBP || !diastolicBP) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
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

    if (record.alertType !== 'Normal') {
      let alertMessage = `${record.alertType} reading for ${patientExists.name}`;
      if (record.alertReason) {
        alertMessage += `: ${record.alertReason}`;
      }

      await Alert.create({
        patient: patient,
        healthRecord: record._id,
        type: record.alertType,
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
    res.status(500).json({
      success: false,
      message: 'Error creating health record'
    });
  }
};

exports.getHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('patient', 'name room age')
      .populate('recordedBy', 'name');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health record'
    });
  }
};

exports.getLatestRecord = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    const record = await HealthRecord.findOne({ patient: patientId })
      .sort({ readingTime: -1 })
      .populate('patient', 'name room');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'No health records found for this patient'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching latest record'
    });
  }
};
