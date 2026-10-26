// Authentication business logic and database operations.
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');

const { signupSchema, loginSchema } = require('../validation/authValidation');
const signup = async (userData) => {
  const { error, value } = signupSchema.validate(userData, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const validationError = new Error(error.details.map((item) => item.message).join(', '));
    validationError.statusCode = 400;
    throw validationError;
  }
  const existingUser = await User.findOne({ email: value.email });

  if (existingUser) {
    const duplicatesUser = new Error('User is Already Exist');
    duplicatesUser.statusCode = 400;
    throw duplicatesUser;
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
    isEmailVerified: newUser.isEmailVerified,
    accountStatus: newUser.accountStatus,
    createdAt: newUser.createdAt,
  };
};

const login = async (userData) => {
  const token = generateToken(user._id);
  const { error } = loginSchema.validate(userData);
  if (error) {
    throw new Error(error.details[0].message);
  }
  const user = await User.findOne({
    email: userData.email,
  }).select('+passwordHash');
  if (!user || user.isDeleted) {
    throw new Error('Invalid email or password');
  }
  if (user.accountStatus !== 'active') {
    throw new Error('Your account is not active');
  }
  const isMatch = await bcrypt.compare(userData.password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }
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
