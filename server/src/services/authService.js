const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const clinicRepository = require('../repositories/clinicRepository');

class AuthService {
  async register(userData) {
    const { name, email, password, role, clinicName } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    let clinicId = userData.clinicId;

    // If no clinic ID is provided but clinicName is provided, create a new clinic
    if (!clinicId && clinicName) {
      const clinic = await clinicRepository.create({ name: clinicName });
      clinicId = clinic._id;
    } else if (!clinicId) {
      // Create a default clinic based on user's name
      const clinic = await clinicRepository.create({ name: `${name}'s Clinic` });
      clinicId = clinic._id;
    }

    const user = await userRepository.create({
      name,
      email,
      password,
      role: role || 'Receptionist',
      clinicId
    });

    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId
      }
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId
      }
    };
  }

  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'clinicflow-secret-key', {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    });
  }
}

module.exports = new AuthService();
