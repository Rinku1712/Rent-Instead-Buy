// JWT authentication middleware.
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authmiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization; // in authHeader bearer token

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //This checks whether the header exists and starts with Bearer
    return res.status(401).json({
      success: false,
      message: 'Please log in first',
    });
  }

  let decoded;
  try {
    const token = authHeader.split(' ')[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  try {
    const authenticatedUser = await User.findById(decoded.id);

    // A valid token should not grant access to deleted or inactive accounts.
    if (
      !authenticatedUser ||
      authenticatedUser.isDeleted ||
      authenticatedUser.accountStatus !== 'active'
    ) {
      return res.status(401).json({
        success: false,
        message: 'User account is not available',
      });
    }

    req.user = authenticatedUser;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authmiddleware;
