// Handle item requests and responses.
const itemService = require('../services/itemService');

const createItem = async (req, res) => {
  try {
    const result = await itemService.createItem(req.params.id, req.body);
    console.log('Create item result:', result);
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
