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
const deleteCategory = async (req, res) => {
  try {
    const category = await categoryService.deleteCategory(req.params.id);
    res.status(201).json({
      success: true,
      message: 'Category Is Soft Deleted',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Error Found in Soft Delete',
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    console.log(category);
    res.status(200).json({ message: 'Category Successfully Updated', category });
  } catch (error) {
    res.status(500).json({ message: 'Error Founded In UpdateCategory', error: error.message });
  }
};
module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
};
