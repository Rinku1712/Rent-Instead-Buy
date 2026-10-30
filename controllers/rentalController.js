// Handle booking requests and responses.
const rentalService = require('../services/rentalService');

const createRental = async (req, res) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be a JSON object',
      data: null,
    });
  }

  try {
    const result = await rentalService.createRental(req.body, req.user.id);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'error came here',
    });
  }
};

module.exports = {
  createRental,
};
