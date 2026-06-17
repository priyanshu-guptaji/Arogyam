const authService = require('../services/authService');
const Logger = require('../utils/logger');

class AuthController {
  async register(req, res, next) {
    try {
      Logger.info(`Registering new staff user: ${req.body.email}`);
      const result = await authService.register(req.body);
      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      Logger.error(`Registration error: ${error.message}`);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async login(req, res, next) {
    try {
      Logger.info(`Staff login attempt: ${req.body.email}`);
      const result = await authService.login(req.body.email, req.body.password);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      Logger.error(`Login error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMe(req, res, next) {
    try {
      // The user is already attached by auth middleware
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            clinicId: req.user.clinicId
          }
        }
      });
    } catch (error) {
      Logger.error(`Get profile error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
