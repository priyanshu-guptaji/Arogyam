const clinicService = require('../services/clinicService');
const queueService = require('../services/queueService');
const socketManager = require('../socket/socketManager');
const Logger = require('../utils/logger');

class ClinicController {
  async getClinic(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      const clinic = await clinicService.getClinicById(clinicId);
      return res.status(200).json({
        success: true,
        data: clinic
      });
    } catch (error) {
      Logger.error(`Error fetching clinic: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateConsultationTime(req, res, next) {
    try {
      const clinicId = req.user.clinicId;
      const { consultationAverageMinutes } = req.body;

      if (!clinicId) {
        return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
      }

      Logger.info(`Updating default consultation duration for clinic ${clinicId} to ${consultationAverageMinutes} mins`);
      const clinic = await clinicService.updateConsultationTime(clinicId, consultationAverageMinutes);

      // Trigger recalculation of wait times for all waiting patients based on new default
      const { averageDuration } = await queueService.recalculateWaitTimes(clinicId);
      const activeQueue = await queueService.getActiveQueue(clinicId);

      // Broadcast wait time updates
      socketManager.broadcastToClinic(clinicId, 'WAIT_TIME_UPDATED', {
        averageDuration,
        activeQueue
      });

      return res.status(200).json({
        success: true,
        data: clinic
      });
    } catch (error) {
      Logger.error(`Error updating consultation duration: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ClinicController();
