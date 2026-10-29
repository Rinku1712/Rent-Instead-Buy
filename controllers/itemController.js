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
const getAllItems = async (req, res) => {
  try {
    const result = await itemService.getAllItems();

    return res.status(200).json({ message: 'Here Is Your All Items', result });
  } catch (error) {
    return res.status(500).json({ message: 'Error Founded in GetAllItem' });
  }
};

const searchItems = async (req, res) => {
  try {
    const result = await itemService.searchItems(req.query);
    return res.status(200).json({
      success: result.message,
      items: result.items,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error founded in Searching Items' });
  }
};
module.exports = { createItem, getAllItems, searchItems };
