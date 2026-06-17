const express = require('express');
const queueController = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Only Admins or Receptionists can access clinic analytics
router.get('/', protect, authorize('Admin', 'Receptionist'), apiLimiter, queueController.getAnalytics);

module.exports = router;
