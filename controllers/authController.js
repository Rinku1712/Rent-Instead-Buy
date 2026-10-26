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
    if (!user) {
      res.status(400).json({ message: 'User Is not Exist' });
    }
    res.status(201).json({ message: 'User Login Successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Error Found in Login' });
  }
};
module.exports = { signup, login };
