const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getHealthRecords, 
  createHealthRecord, 
  getHealthRecord,
  getLatestRecord 
} = require('../controllers/healthController');

router.use(protect);

router.route('/')
  .get(getHealthRecords)
  .post(authorize('Care Manager'), createHealthRecord);

router.get('/patient/:patientId', getLatestRecord);
router.get('/:id', getHealthRecord);

module.exports = router;
