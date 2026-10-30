// Handle booking requests and responses.
const rentalService = require('../services/rentalService');

const createRental = async (req, res) => {
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
      message: error.message,
    });
  }
};

module.exports = {
  createRental,
};
