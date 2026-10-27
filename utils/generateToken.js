const jwt = require('jsonwebtoken');

function generateToken(userId, isSuperAdmin = false) {
  const payload = {
    id: userId,
  };

  if (isSuperAdmin) {
    payload.isSuperAdmin = true;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return token;
}

module.exports = generateToken;
