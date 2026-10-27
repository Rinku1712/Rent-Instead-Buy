const adminService = require('../services/superAdminService');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await adminService.loginAdmin(email, password);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      ...(result.token && { token: result.token }), //conditional spread operator pattern
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Super Admin login failed',
    });
  }
}

module.exports = {
  login,
};
