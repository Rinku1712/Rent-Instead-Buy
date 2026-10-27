const generateToken = require('../utils/generateToken');

async function loginAdmin(email, password) {
  if (!process.env.SUPER_ADMIN_EMAIL || !process.env.SUPER_ADMIN_PASSWORD) {
    return {
      success: false,
      statusCode: 500,
      message: 'Super Admin credentials are not configured',
    };
  }

  if (email !== process.env.SUPER_ADMIN_EMAIL || password !== process.env.SUPER_ADMIN_PASSWORD) {
    return {
      success: false,
      statusCode: 401,
      message: 'Invalid admin email or password',
    };
  }

  const token = generateToken('super-admin', true);

  return {
    success: true,
    statusCode: 200,
    message: 'Super Admin login successful',
    token,
  };
}

module.exports = {
  loginAdmin,
};
