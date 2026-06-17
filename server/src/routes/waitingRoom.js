const express = require('express');
const queueController = require('../controllers/queueController');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public route to fetch patient waiting room data (no protect middleware)
router.get('/', apiLimiter, queueController.getWaitingRoomData);

module.exports = router;
