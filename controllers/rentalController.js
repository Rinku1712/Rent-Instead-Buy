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

// Changes made here
const getOwnerRentalRequests = async (req, res) => {
  try {
    const result = await rentalService.getOwnerRentalRequests(req.user.id);
    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rental requests',
    });
  }
};

// Changes made here
const approveRentalRequest = async (req, res) => {
  try {
    const result = await rentalService.approveRentalRequest(req.params.rentalId, req.user.id);
    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to approve rental request',
    });
  }
};

// Changes made here
const rejectRentalRequest = async (req, res) => {
  try {
    const result = await rentalService.rejectRentalRequest(req.params.rentalId, req.user.id);
    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject rental request',
    });
  }
};

module.exports = {
  createRental,
  getOwnerRentalRequests,
  approveRentalRequest,
  rejectRentalRequest,
};
