const userService = require('../services/userService');

async function getProfile(req, res) {
  try {
    const user = await userService.getProfile(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    const statusCode = error.message === 'User not found' ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message === 'User not found' ? error.message : 'Failed to fetch profile',
    });
  }
}

module.exports = { getProfile };
