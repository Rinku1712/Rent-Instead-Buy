const Category = require('../models/categoryModel');

async function getAllCategories() {
  const categories = await Category.find({
    isActive: true,
    isDeleted: false,
  }).sort({ name: 1 });

  return categories;
}

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
    parentCategory: parentCategory || null,
  });

  return {
    success: true,
    statusCode: 201,
    message: 'Category created successfully',
    data: category,
  };
};

module.exports = {
  getAllCategories,
  createCategory,
};
