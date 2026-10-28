const Item = require('../models/itemModel');
const Category = require('../models/categoryModel');

async function createItem(userId, itemData) {
  try {
    const {
      categoryId,
      name,
      description,
      brand,
      images,
      condition,
      pricePerDay,
      pricePerWeek,
      securityDeposit,
      location,
    } = itemData;
    // Check whether the category exists and is active.
    const category = await Category.findOne({
      _id: categoryId,
      isActive: true,
      isDeleted: false,
    });
    console.log('Received categoryId:', categoryId);
    console.log('Found category:', category);
    if (!category) {
      return {
        success: false,
        statusCode: 400,
        message: 'Category not found or is inactive',
      };
    }

    const item = await Item.create({
      ownerId: userId,
      categoryId,
      name,
      description,
      brand,
      images,
      condition,
      pricePerDay,
      pricePerWeek,
      securityDeposit,
      location,
      availabilityStatus: 'available',
    });

    return {
      success: true,
      statusCode: 201,
      message: 'Item created successfully',
      item,
    };
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid item data',
      };
    }

    return {
      success: false,
      statusCode: 500,
      message: 'Failed to create item',
    };
  }
}

module.exports = { createItem };
