const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { type, isRead, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const alerts = await Alert.find(query)
      .populate('patient', 'name room')
      .populate('recordedBy', 'name')
      .populate('acknowledgedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(query);

    const stats = {
      critical: await Alert.countDocuments({ type: 'critical', isRead: false }),
      warning: await Alert.countDocuments({ type: 'warning', isRead: false }),
      emergency: await Alert.countDocuments({ type: 'emergency', isRead: false })
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
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).populate('patient', 'name room');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating alert' });
  }
});

router.put('/:id/acknowledge', protect, async (req, res) => {
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
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({ message: 'Error acknowledging alert' });
  }
});

router.post('/emergency', protect, async (req, res) => {
  try {
    const { patientId, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const emergencyId = `EMG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const alert = await Alert.create({
      patient: patientId,
      type: 'emergency',
      message: `EMERGENCY: Immediate response requested for ${patient.name} (Room ${patient.room})`,
      emergencySent: true,
      emergencyId
    });

    await alert.populate('patient', 'name room');

    res.status(201).json({
      success: true,
      data: {
        alert,
        emergencyId,
        eta: '4-6 minutes'
      }
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ message: 'Error sending emergency alert' });
  }
});

router.put('/mark-all-read', protect, async (req, res) => {
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
    res.status(500).json({ message: 'Error marking alerts as read' });
  }
});

module.exports = router;
