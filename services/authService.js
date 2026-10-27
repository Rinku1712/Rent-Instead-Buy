const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

const signup = async (value) => {
  const existingUser = await User.findOne({ email: value.email });

  if (existingUser) {
    throw new Error('User already exists');
  }
  const passwordHash = await bcrypt.hash(value.password, 10);

  const newUser = await User.create({
    name: value.name,
    email: value.email,
    passwordHash,
    phone: value.phone,
    address: value.address,
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    address: newUser.address,
  };
};

const login = async () => {
  const user = await User.findOne({
    email: value.email,
  }).select('+passwordHash');

  if (!user || user.isDeleted) {
    throw new Error('Invalid email or password');
  }

  if (user.accountStatus !== 'active') {
    throw new Error('Your account is not active');
  }

  const isMatch = await bcrypt.compare(value.password, user.passwordHash);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
  const token = generateToken(user._id);
  user.lastLoginAt = new Date();
  await user.save();

  return {
    token,
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
};

module.exports = { signup, login };
