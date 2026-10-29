const Item = require('../models/itemModel');
const Category = require('../models/categoryModel');

const createItem = async (userId, itemData) => {
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

    if (!category) {
      return {
        success: false,
        statusCode: 400,
        message: 'Category not found or is inactive',
      };
    }

    const item = await Item.create({
      // The controller supplies the authenticated owner ID separately from request data.
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
    // if (itemData) {
    //   return {
    //     success: false,
    //     statusCode: 409,
    //     message: 'Item Already Exist',
    //   };
    // }`
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
};
const getAllItems = async () => {
  const item = await Item.find({
    availabilityStatus: 'available',
    isDeleted: false,
  })
    .populate('categoryId', 'name slug')
    .populate('ownerId', 'name')
    .sort({ createdAt: -1 });
  return {
    success: true,
    statusCode: 200,
    message: 'Items fetched successfully',
    item,
  };
};
const searchItems = async (filters) => {
  const { search, categoryId, category, brand, city, condition, minPrice, maxPrice } = filters;
  const query = {
    availabilityStatus: 'available',
    isDeleted: false,
  };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) {
    const foundCategory = await Category.findOne({
      name: { $regex: `^${category}$`, $options: 'i' },
      isActive: true,
      isDeleted: false,
    });
    if (!foundCategory) {
      return {
        success: true,
        statusCode: 200,
        message: 'Search completed successfully',
        items: [],
      };
    }

    query.categoryId = foundCategory._id;
  }
  if (categoryId) {
    query.categoryId = categoryId;
  }

  if (brand) {
    query.brand = { $regex: brand, $options: 'i' };
  }

  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' };
  }
  if (condition) {
    query.condition = condition;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.pricePerDay = {};

    if (minPrice !== undefined) {
      query.pricePerDay.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      query.pricePerDay.$lte = Number(maxPrice);
    }
  }

  const items = await Item.find(query)
    .populate('categoryId', 'name slug')
    .populate('ownerId', 'name')
    .sort({ createdAt: -1 });

  // if (items.city != filters.city) {
  //   return {
  //     success: false, this very bad approach
  //     statusCode: 404,
  //     message: 'Items not found',
  //     items: [],
  //   };
  // }

  return {
    success: true,
    statusCode: 200,
    message: 'Search completed successfully',
    items,
  };
};
module.exports = { createItem, getAllItems, searchItems };
