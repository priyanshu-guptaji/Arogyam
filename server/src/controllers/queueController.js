const queueService = require('../services/queueService');
const Logger = require('../utils/logger');

class QueueController {
  async addPatient(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      Logger.info(`Adding patient to clinic ${clinicId}: ${req.body.patientName}`);
      const patient = await queueService.addPatient(clinicId, req.body);
      return res.status(201).json({
        success: true,
        data: patient
      });
    } catch (error) {
      Logger.error(`Error adding patient: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getActiveQueue(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      const queue = await queueService.getActiveQueue(clinicId);
      return res.status(200).json({
        success: true,
        data: queue
      });
    } catch (error) {
      Logger.error(`Error fetching queue: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async callNext(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      Logger.info(`Calling next patient for clinic ${clinicId}`);
      const patient = await queueService.callNext(clinicId);
      if (!patient) {
        return res.status(200).json({
          success: true,
          message: 'No patients waiting in queue',
          data: null
        });
      }

      return res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error) {
      Logger.error(`Error calling next patient: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async skipPatient(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      const queueId = req.params.id;

      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      Logger.info(`Skipping patient token ${queueId} in clinic ${clinicId}`);
      const patient = await queueService.skipPatient(clinicId, queueId);
      return res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error) {
      Logger.error(`Error skipping patient: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async completePatient(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      const queueId = req.params.id;

      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      Logger.info(`Completing consultation for token ${queueId} in clinic ${clinicId}`);
      const patient = await queueService.completePatient(clinicId, queueId);
      return res.status(200).json({
        success: true,
        data: patient
      });
    } catch (error) {
      Logger.error(`Error completing consultation: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async resetQueue(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      Logger.info(`Resetting queue for clinic ${clinicId}`);
      const result = await queueService.resetQueue(clinicId);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      Logger.error(`Error resetting queue: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getWaitingRoomData(req, res, next) {
    try {
      const clinicId = req.query.clinicId;
      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'Clinic ID is required as a query parameter' });
      }

      const waitingRoomData = await queueService.getWaitingRoomData(clinicId);
      return res.status(200).json({
        success: true,
        data: waitingRoomData
      });
    } catch (error) {
      Logger.error(`Error fetching waiting room data: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      const analytics = await queueService.getAnalytics(clinicId);
      return res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      Logger.error(`Error fetching analytics: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new QueueController();
