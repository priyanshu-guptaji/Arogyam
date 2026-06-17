const Clinic = require('../models/Clinic');

class ClinicRepository {
  async findById(id) {
    return await Clinic.findById(id);
  }

  async findByName(name) {
    return await Clinic.findOne({ name });
  }

  async create(clinicData) {
    return await Clinic.create(clinicData);
  }

  async update(id, clinicData) {
    return await Clinic.findByIdAndUpdate(id, clinicData, { new: true, runValidators: true });
  }

  async incrementTokenCounter(id) {
    return await Clinic.findByIdAndUpdate(
      id,
      { $inc: { tokenCounter: 1 } },
      { new: true }
    );
  }
}

module.exports = new ClinicRepository();
