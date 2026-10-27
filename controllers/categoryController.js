const categoryService = require('../services/categoryService');

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    return res.status(200).json({
      success: true,
      message: 'Categories fetched successfully',
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const result = await categoryService.createCategory(req.body);

    return res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      ...(result.data && { data: result.data }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Category name or slug already exists',
      });
    }

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category data',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
};
