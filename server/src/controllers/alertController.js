const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const Emergency = require('../models/Emergency');

exports.getAlerts = async (req, res) => {
  try {
    const { type, isRead, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    if (type && type !== 'All') {
      query.type = type;
    }
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const alerts = await Alert.find(query)
      .populate('patient', 'name room')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);

    const stats = {
      Critical: await Alert.countDocuments({ type: 'Critical', isRead: false }),
      Warning: await Alert.countDocuments({ type: 'Warning', isRead: false }),
      Normal: await Alert.countDocuments({ type: 'Normal', isRead: false }),
      Emergency: await Alert.countDocuments({ type: 'Emergency', isRead: false })
    };

    res.json({
      success: true,
      data: alerts,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts'
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).populate('patient', 'name room');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating alert'
    });
  }
};

exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { 
        isAcknowledged: true,
        acknowledgedBy: req.user._id,
        acknowledgedAt: new Date()
      },
      { new: true }
    ).populate('patient', 'name room')
     .populate('acknowledgedBy', 'name');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert'
    });
  }
};

exports.sendEmergency = async (req, res) => {
  try {
    const { patientId, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const emergency = await Emergency.create({
      patient: patientId,
      triggeredBy: req.user._id,
      notes: notes || ''
    });

    await Alert.create({
      patient: patientId,
      type: 'Emergency',
      message: `Emergency alert triggered for ${patient.name} (Room ${patient.room})`,
      emergencySent: true,
      emergencyId: emergency.emergencyId
    });

    await emergency.populate('patient', 'name room');
    await emergency.populate('triggeredBy', 'name');

    res.status(201).json({
      success: true,
      data: {
        emergency,
        emergencyId: emergency.emergencyId,
        eta: '4-6 minutes'
      }
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending emergency alert'
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Alert.updateMany(
      { isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All alerts marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking alerts as read'
    });
  }
};
