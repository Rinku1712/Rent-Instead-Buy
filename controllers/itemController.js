// Handle item requests and responses.
const itemService = require('../services/itemService');

const createItem = async (req, res) => {
  try {
    // Use the authenticated user's ID; this route does not have an :id parameter.
    const result = await itemService.createItem(req.user._id, req.body);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      ...(result.item && { item: result.item }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error Found in Create Item',
    });
  }
};

module.exports = { createItem };
