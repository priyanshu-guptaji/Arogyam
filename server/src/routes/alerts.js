const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getAlerts, 
  markAsRead, 
  acknowledgeAlert, 
  sendEmergency,
  markAllAsRead 
} = require('../controllers/alertController');

router.use(protect);

router.route('/')
  .get(getAlerts);

router.put('/read/:id', markAsRead);
router.put('/acknowledge/:id', acknowledgeAlert);
router.post('/emergency', authorize('Parent', 'Care Manager'), sendEmergency);
router.put('/mark-all-read', markAllAsRead);

module.exports = router;
