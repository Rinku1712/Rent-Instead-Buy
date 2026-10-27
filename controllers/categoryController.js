// Handle category requests and responses.
const categoryServices = require('../services/categoryService');

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryServices.getAllCategories();
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category is not found' });
    }
    return res.status(200).json({ message: 'All Categories is Here', categories });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
    });
  }
};

module.exports = { getAllCategories };
