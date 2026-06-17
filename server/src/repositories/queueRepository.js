const Queue = require('../models/Queue');

class QueueRepository {
  async create(queueData) {
    return await Queue.create(queueData);
  }

  async findById(id) {
    return await Queue.findById(id);
  }

  async findActiveQueueForClinic(clinicId) {
    // Return all patients that are waiting or currently in consultation
    return await Queue.find({
      clinicId,
      status: { $in: ['WAITING', 'IN_PROGRESS'] }
    }).sort({ tokenNumber: 1 });
  }

  async findCompletedForClinic(clinicId, limit = 50) {
    // Return completed consultations ordered by completedAt desc
    return await Queue.find({
      clinicId,
      status: 'COMPLETED',
      consultationDurationMinutes: { $exists: true, $ne: null }
    })
      .sort({ completedAt: -1 })
      .limit(limit);
  }

  async findNextWaitingPatient(clinicId) {
    // Atomically find the next WAITING patient (lowest token number)
    // and transition them to IN_PROGRESS. This avoids race conditions
    // where multiple receptionists click "Call Next" simultaneously.
    return await Queue.findOneAndUpdate(
      { clinicId, status: 'WAITING' },
      { status: 'IN_PROGRESS', calledAt: new Date() },
      { sort: { tokenNumber: 1 }, new: true }
    );
  }

  async updateStatus(id, status, additionalFields = {}) {
    return await Queue.findByIdAndUpdate(
      id,
      { status, ...additionalFields },
      { new: true }
    );
  }

  async countPatientsAhead(clinicId, checkInTime) {
    return await Queue.countDocuments({
      clinicId,
      status: 'WAITING',
      checkInTime: { $lt: checkInTime }
    });
  }

  async findAllActiveWaiting(clinicId) {
    return await Queue.find({
      clinicId,
      status: 'WAITING'
    }).sort({ tokenNumber: 1 });
  }

  async bulkUpdateWaitTimes(bulkOps) {
    if (bulkOps.length === 0) return;
    return await Queue.bulkWrite(bulkOps);
  }

  async resetQueueForClinic(clinicId) {
    // Transition any remaining WAITING or IN_PROGRESS patients to SKIPPED
    // indicating they were not seen before the daily reset.
    const now = new Date();
    return await Queue.updateMany(
      {
        clinicId,
        status: { $in: ['WAITING', 'IN_PROGRESS'] }
      },
      {
        status: 'SKIPPED',
        completedAt: now
      }
    );
  }

  async getAnalyticsData(clinicId, startOfDay, endOfDay) {
    const dailyCompleted = await Queue.find({
      clinicId,
      status: 'COMPLETED',
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const dailySkipped = await Queue.countDocuments({
      clinicId,
      status: 'SKIPPED',
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const allCompletedAllTime = await Queue.find({
      clinicId,
      status: 'COMPLETED'
    });

    return {
      dailyCompleted,
      dailySkipped,
      allCompletedAllTime
    };
  }
}

module.exports = new QueueRepository();
