// Handle authentication requests and responses.
const authServices = require('../services/authService');

const signup = async (req, res) => {
  try {
    const user = await authServices.signup(req.body);
    res.status(201).json({ message: 'User Created Successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error Are Found in SignUp', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const user = await authServices.login(req.body);
    res.status(200).json({ message: 'User Login Successfully', user });
  } catch (error) {
    // Keep validation and authentication failures from being reported as server errors.
    res.status(error.statusCode || 500).json({
      error: error.message,
      message: 'Error Found in Login',
    });
  }
};
module.exports = { signup, login };
