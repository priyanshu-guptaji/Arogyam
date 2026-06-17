const queueRepository = require('../repositories/queueRepository');
const clinicRepository = require('../repositories/clinicRepository');
const socketManager = require('../socket/socketManager');
const Queue = require('../models/Queue');

class QueueService {
  async addPatient(clinicId, patientData) {
    const { patientName, phoneNumber, notes } = patientData;

    // 1. Atomically increment the clinic's token counter to get a unique, sequential token
    const clinic = await clinicRepository.incrementTokenCounter(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    const tokenNumber = clinic.tokenCounter;

    // 2. Create the queue entry
    const newQueueItem = await queueRepository.create({
      clinicId,
      tokenNumber,
      patientName,
      phoneNumber: phoneNumber || '',
      notes: notes || '',
      status: 'WAITING',
      checkInTime: new Date(),
      estimatedWaitMinutes: 0
    });

    // 3. Recalculate wait times for all waiting patients
    const { averageDuration } = await this.recalculateWaitTimes(clinicId);

    // Fetch the updated queue item from the database to get its computed estimatedWaitMinutes
    const updatedQueueItem = await queueRepository.findById(newQueueItem._id);

    // 4. Fetch the entire updated active queue
    const activeQueue = await queueRepository.findActiveQueueForClinic(clinicId);

    // 5. Broadcast real-time events
    socketManager.broadcastToClinic(clinicId, 'PATIENT_ADDED', {
      addedPatient: updatedQueueItem,
      activeQueue
    });

    socketManager.broadcastToClinic(clinicId, 'WAIT_TIME_UPDATED', {
      averageDuration,
      activeQueue
    });

    return updatedQueueItem;
  }

  async callNext(clinicId) {
    // 1. Atomically transition the next WAITING patient to IN_PROGRESS
    const nextPatient = await queueRepository.findNextWaitingPatient(clinicId);
    if (!nextPatient) {
      return null;
    }

    // 2. Recalculate wait times
    const { averageDuration } = await this.recalculateWaitTimes(clinicId);

    // 3. Fetch the updated active queue
    const activeQueue = await queueRepository.findActiveQueueForClinic(clinicId);

    // 4. Broadcast real-time events
    socketManager.broadcastToClinic(clinicId, 'TOKEN_CALLED', {
      calledPatient: nextPatient,
      activeQueue
    });

    socketManager.broadcastToClinic(clinicId, 'WAIT_TIME_UPDATED', {
      averageDuration,
      activeQueue
    });

    return nextPatient;
  }

  async skipPatient(clinicId, queueId) {
    // 1. Mark status as SKIPPED and completedAt as now
    const updatedPatient = await queueRepository.updateStatus(queueId, 'SKIPPED', {
      completedAt: new Date()
    });

    if (!updatedPatient) {
      throw new Error('Queue item not found');
    }

    // 2. Recalculate wait times
    const { averageDuration } = await this.recalculateWaitTimes(clinicId);

    // 3. Fetch the updated active queue
    const activeQueue = await queueRepository.findActiveQueueForClinic(clinicId);

    // 4. Broadcast real-time events
    socketManager.broadcastToClinic(clinicId, 'TOKEN_SKIPPED', {
      skippedPatient: updatedPatient,
      activeQueue
    });

    socketManager.broadcastToClinic(clinicId, 'WAIT_TIME_UPDATED', {
      averageDuration,
      activeQueue
    });

    return updatedPatient;
  }

  async completePatient(clinicId, queueId) {
    const queueItem = await queueRepository.findById(queueId);
    if (!queueItem) {
      throw new Error('Queue item not found');
    }

    const completedAt = new Date();
    // Calculate actual consultation duration in minutes (round up to nearest minute)
    let duration = 0;
    if (queueItem.calledAt) {
      const diffMs = completedAt - queueItem.calledAt;
      duration = Math.max(1, Math.round(diffMs / (1000 * 60)));
    } else {
      // Fallback if it was never called but somehow completed
      const clinic = await clinicRepository.findById(clinicId);
      duration = clinic ? clinic.consultationAverageMinutes : 10;
    }

    // 1. Mark status as COMPLETED, set completedAt and duration
    const updatedPatient = await queueRepository.updateStatus(queueId, 'COMPLETED', {
      completedAt,
      consultationDurationMinutes: duration
    });

    // 2. Recalculate wait times (which computes new average consultation duration from past completions)
    const { averageDuration } = await this.recalculateWaitTimes(clinicId);

    // 3. Fetch the updated active queue
    const activeQueue = await queueRepository.findActiveQueueForClinic(clinicId);

    // 4. Broadcast real-time events
    socketManager.broadcastToClinic(clinicId, 'CONSULTATION_COMPLETED', {
      completedPatient: updatedPatient,
      activeQueue
    });

    socketManager.broadcastToClinic(clinicId, 'WAIT_TIME_UPDATED', {
      averageDuration,
      activeQueue
    });

    return updatedPatient;
  }

  async resetQueue(clinicId) {
    // 1. Move remaining WAITING/IN_PROGRESS patients to SKIPPED
    await queueRepository.resetQueueForClinic(clinicId);

    // 2. Reset token counter in Clinic document back to 0
    await clinicRepository.update(clinicId, { tokenCounter: 0 });

    // 3. Broadcast event
    socketManager.broadcastToClinic(clinicId, 'QUEUE_RESET', {
      message: 'Queue has been reset for the day.',
      activeQueue: []
    });

    return { success: true, message: 'Queue reset successfully' };
  }

  async getActiveQueue(clinicId) {
    return await queueRepository.findActiveQueueForClinic(clinicId);
  }

  async getWaitingRoomData(clinicId) {
    const clinic = await clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    const activeQueue = await queueRepository.findActiveQueueForClinic(clinicId);
    
    const currentToken = activeQueue.find(item => item.status === 'IN_PROGRESS') || null;
    const upcomingTokens = activeQueue.filter(item => item.status === 'WAITING');

    return {
      clinicName: clinic.name,
      clinicId: clinic._id,
      currentTokenServed: currentToken,
      upcomingTokens,
      lastUpdated: new Date()
    };
  }

  async recalculateWaitTimes(clinicId) {
    const clinic = await clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new Error('Clinic not found');
    }

    // 1. Get last 50 completed consultations to compute the moving average
    const completedList = await queueRepository.findCompletedForClinic(clinicId, 50);

    let averageDuration = clinic.consultationAverageMinutes;
    if (completedList.length >= 5) {
      const sum = completedList.reduce((acc, curr) => acc + (curr.consultationDurationMinutes || 0), 0);
      averageDuration = Math.round(sum / completedList.length);
      
      // Update clinic's consultation duration average in DB
      if (clinic.consultationAverageMinutes !== averageDuration) {
        await clinicRepository.update(clinicId, { consultationAverageMinutes: averageDuration });
      }
    }

    // 2. Find all WAITING patients and the current IN_PROGRESS patient status
    const waitingPatients = await queueRepository.findAllActiveWaiting(clinicId);
    const inProgressCount = await Queue.countDocuments({ clinicId, status: 'IN_PROGRESS' });

    const bulkOps = [];
    const updatedWaiting = [];

    // 3. Estimate wait times: (index + inProgressCount) * averageDuration
    waitingPatients.forEach((patient, index) => {
      const patientsAhead = index + inProgressCount;
      const estimatedWait = patientsAhead * averageDuration;

      bulkOps.push({
        updateOne: {
          filter: { _id: patient._id },
          update: { estimatedWaitMinutes: estimatedWait }
        }
      });

      // Update in-memory copy
      patient.estimatedWaitMinutes = estimatedWait;
      updatedWaiting.push(patient);
    });

    if (bulkOps.length > 0) {
      await queueRepository.bulkUpdateWaitTimes(bulkOps);
    }

    return {
      averageDuration,
      waitingPatients: updatedWaiting
    };
  }

  async getAnalytics(clinicId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const data = await queueRepository.getAnalyticsData(clinicId, startOfDay, endOfDay);

    // 1. Patients served today
    const servedToday = data.dailyCompleted.length;

    // 2. Average consultation duration (from completed today or fallback to all-time completed)
    let avgConsultationTime = 0;
    const completedSource = data.dailyCompleted.length > 0 ? data.dailyCompleted : data.allCompletedAllTime;
    if (completedSource.length > 0) {
      const sum = completedSource.reduce((acc, curr) => acc + (curr.consultationDurationMinutes || 0), 0);
      avgConsultationTime = parseFloat((sum / completedSource.length).toFixed(1));
    }

    // 3. Longest wait time today
    let longestWaitTime = 0;
    data.dailyCompleted.forEach(item => {
      if (item.calledAt && item.checkInTime) {
        const waitMs = item.calledAt - item.checkInTime;
        const waitMin = Math.ceil(waitMs / (1000 * 60));
        if (waitMin > longestWaitTime) {
          longestWaitTime = waitMin;
        }
      }
    });

    // 4. Current queue size
    const currentQueueSize = await Queue.countDocuments({
      clinicId,
      status: { $in: ['WAITING', 'IN_PROGRESS'] }
    });

    // 5. Skipped patients count today
    const skippedTodayCount = data.dailySkipped;

    // 6. Hourly throughput graph (group dailyCompleted by hour)
    const hourlyThroughputMap = {};
    for (let h = 8; h <= 20; h++) {
      hourlyThroughputMap[h] = 0; // Initialize standard Indian clinic hours 8 AM to 8 PM
    }

    data.dailyCompleted.forEach(item => {
      const completedHour = new Date(item.completedAt).getHours();
      if (completedHour >= 8 && completedHour <= 20) {
        hourlyThroughputMap[completedHour] = (hourlyThroughputMap[completedHour] || 0) + 1;
      }
    });

    const hourlyThroughput = Object.keys(hourlyThroughputMap).map(hour => ({
      hour: `${hour}:00`,
      patients: hourlyThroughputMap[hour]
    }));

    return {
      servedToday,
      avgConsultationTime,
      longestWaitTime,
      currentQueueSize,
      skippedTodayCount,
      hourlyThroughput
    };
  }
}

module.exports = new QueueService();
