const clinicRepository = require('../repositories/clinicRepository');

class ClinicService {
  async getClinicById(id) {
    return await clinicRepository.findById(id);
  }

  async updateConsultationTime(id, minutes) {
    return await clinicRepository.update(id, { consultationAverageMinutes: minutes });
  }
}

module.exports = new ClinicService();
