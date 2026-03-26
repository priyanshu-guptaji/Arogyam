const Patient = require('../models/Patient');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');

exports.getPatients = async (req, res) => {
  try {
    let patients;
    
    if (req.user.role === 'Care Manager') {
      patients = await Patient.find({ isActive: true })
        .populate('assignedCareManager', 'name email')
        .sort({ name: 1 });
    } else if (req.user.role === 'Parent') {
      patients = await Patient.find({ 
        isActive: true,
        familyMembers: req.user._id
      }).sort({ name: 1 });
    } else if (req.user.role === 'Child') {
      patients = await Patient.find({ 
        isActive: true,
        familyMembers: req.user._id
      }).sort({ name: 1 });
    }

    const patientsWithLatestRecord = await Promise.all(
      patients.map(async (patient) => {
        const latestRecord = await HealthRecord.findOne({ patient: patient._id })
          .sort({ readingTime: -1 })
          .select('heartRate oxygenLevel systolicBP diastolicBP readingTime alertType');
        
        return {
          ...patient.toObject(),
          latestRecord: latestRecord ? {
            heartRate: latestRecord.heartRate,
            oxygenLevel: latestRecord.oxygenLevel,
            systolicBP: latestRecord.systolicBP,
            diastolicBP: latestRecord.diastolicBP,
            readingTime: latestRecord.readingTime,
            alertType: latestRecord.alertType
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
    res.status(500).json({
      success: false,
      message: 'Error fetching patients'
    });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedCareManager', 'name email phone')
      .populate('familyMembers', 'name email phone');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient'
    });
  }
};

exports.createPatient = async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Error creating patient'
    });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
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
    res.status(500).json({
      success: false,
      message: 'Error updating patient'
    });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    patient.isActive = false;
    await patient.save();

    res.json({
      success: true,
      message: 'Patient deactivated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating patient'
    });
  }
};

exports.getPatientHealthHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const records = await HealthRecord.find({
      patient: req.params.id,
      readingTime: { $gte: startDate }
    })
      .sort({ readingTime: -1 })
      .limit(100);

    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patient health history'
    });
  }
};
