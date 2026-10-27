// Category business logic and database operations.
const Category = require('../models/categoryModel');

const getAllCategories = async () => {
  const categories = await Category.find({
    isActive: true,
    isDeleted: false,
  }).sort({ name: 1 });
  return categories;
};

module.exports = { getAllCategories };
