const express = require('express');
const authController = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validators/authValidator');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, validateSignup, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
