const User = require('../models/userModel');

async function getProfile(userId) {
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    throw new Error('User not found');
  }

  return user;
}

module.exports = {
  getProfile,
};
