const Category = require('../models/categoryModel');

const getAllCategories = async () => {
  const categories = await Category.find({
    isActive: true,
    isDeleted: false,
  }).sort({ name: 1 });

  return categories;
};

const createCategory = async (categoryData) => {
  const { name, description, image, parentCategory } = categoryData;

  // Automatically generate a slug from the category name.
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Check whether the category name or slug already exists.

  const existingCategory = await Category.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });

  if (existingCategory) {
    return {
      success: false,
      statusCode: 409,
      message: 'Category name already exists',
    };
  }

  // Save the category in MongoDB.
  const category = await Category.create({
    name: name.trim(),
    slug,
    description,
    image,
    parentCategory: parentCategory,
  });

  return {
    success: true,
    statusCode: 201,
    message: 'Category created successfully',
    data: category,
  };
};
const deleteCategory = async (categoryId) => {
  const category = await Category.findOneAndUpdate(
    {
      _id: categoryId,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    },
    {
      new: true,
    },
  );
  if (!category) {
    return {
      success: false,
      statusCode: 404,
      message: 'Category not found',
    };
  }
  return {
    success: true,
    statusCode: 200,
    message: 'Category soft deleted successfully',
  };
};
const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findOneAndUpdate({ _id: categoryId }, updateData, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return {
      success: false,
      status: 404,
      message: 'Category Not Found',
    };
  }
  return {
    success: true,
    statusCode: 200,
  };
};
module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
};
