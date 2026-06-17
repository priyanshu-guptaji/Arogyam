const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return await User.findById(id).populate('clinicId');
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }
}

module.exports = new UserRepository();
