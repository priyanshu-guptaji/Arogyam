const express = require('express');
const clinicController = require('../controllers/clinicController');
const { validateUpdateSettings } = require('../validators/queueValidator');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);
router.use(apiLimiter);

router.get('/clinic', clinicController.getClinic);
router.patch('/consultation-time', validateUpdateSettings, clinicController.updateConsultationTime);

module.exports = router;
