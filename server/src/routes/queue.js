const express = require('express');
const queueController = require('../controllers/queueController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

router.get('/', queueController.getActiveQueue);
router.post('/call-next', queueController.callNext);
router.post('/reset', queueController.resetQueue);
router.post('/:id/skip', queueController.skipPatient);
router.post('/:id/complete', queueController.completePatient);

module.exports = router;
