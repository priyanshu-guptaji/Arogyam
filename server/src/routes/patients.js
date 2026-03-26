const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getPatients, 
  getPatient, 
  createPatient, 
  updatePatient, 
  deletePatient,
  getPatientHealthHistory 
} = require('../controllers/patientController');

router.use(protect);

router.route('/')
  .get(getPatients)
  .post(authorize('Care Manager'), createPatient);

router.get('/:id', getPatient);
router.put('/:id', authorize('Care Manager'), updatePatient);
router.delete('/:id', authorize('Care Manager'), deletePatient);
router.get('/:id/health', getPatientHealthHistory);

module.exports = router;
