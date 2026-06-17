const Joi = require('joi');

const addPatientSchema = Joi.object({
  patientName: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Patient name cannot be empty',
    'any.required': 'Patient name is required'
  }),
  phoneNumber: Joi.string().trim().allow('').optional().messages({
    'string.max': 'Phone number is too long'
  }),
  notes: Joi.string().trim().allow('').max(500).optional()
});

const updateSettingsSchema = Joi.object({
  consultationAverageMinutes: Joi.number().integer().min(1).max(120).required().messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 1 minute',
    'any.required': 'Duration is required'
  })
});

const validateAddPatient = (req, res, next) => {
  const { error } = addPatientSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateSettings = (req, res, next) => {
  const { error } = updateSettingsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateAddPatient,
  validateUpdateSettings
};
