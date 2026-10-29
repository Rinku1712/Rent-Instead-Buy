const Item = require('../models/itemModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createItem = async (userId, itemData) => {
  try {
    const {
      categoryId,
      name,
      description,
      brand,
      state,
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
      state,
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
  const {
    search,
    item,
    categoryId,
    category,
    brand,
    city,
    state,
    condition,
    minPrice,
    maxPrice,
  } = filters;

  const textFilters = { search, item, category, brand, city, condition, state, categoryId };
  for (const [name, value] of Object.entries(textFilters)) {
    if (value !== undefined && typeof value !== 'string') {
      return {
        success: false,
        statusCode: 400,
        message: `Invalid ${name} filter.`,
        items: [],
      };
    }
  }

  const itemName = item?.trim() || '';
  const searchText = search?.trim() || '';
  const categoryName = category?.trim() || '';
  const brandName = brand?.trim() || '';
  const cityName = city?.trim() || '';
  const stateName = state?.trim() || '';
  const itemCondition = condition?.trim() || '';
  const categoryObjectId = categoryId?.trim() || '';

  const parsePrice = (name, value) => {
    if (value === undefined) {
      return { value: undefined };
    }

    if (typeof value !== 'string') {
      return { error: name };
    }

    const parsed = Number(value);
    if (value.trim() === '' || !Number.isFinite(parsed) || parsed < 0) {
      return { error: name };
    }

    return { value: parsed };
  };

  const parsedMinPrice = parsePrice('minPrice', minPrice);
  const parsedMaxPrice = parsePrice('maxPrice', maxPrice);
  if (parsedMinPrice.error || parsedMaxPrice.error) {
    const invalidFilter = parsedMinPrice.error || parsedMaxPrice.error;
    return {
      success: false,
      statusCode: 400,
      message: `Invalid ${invalidFilter} filter.`,
      items: [],
    };
  }

  if (
    (categoryObjectId && !mongoose.Types.ObjectId.isValid(categoryObjectId)) ||
    (itemCondition && !['new', 'like_new', 'good', 'fair'].includes(itemCondition)) ||
    (parsedMinPrice.value !== undefined &&
      parsedMaxPrice.value !== undefined &&
      parsedMinPrice.value > parsedMaxPrice.value)
  ) {
    return {
      success: false,
      statusCode: 400,
      message: 'One or more search filters are invalid.',
      items: [],
    };
  }

  const query = {
    availabilityStatus: 'available',
    isDeleted: false,
  };

  if (
    !itemName &&
    !searchText &&
    !categoryName &&
    !categoryObjectId &&
    !brandName &&
    !cityName &&
    !stateName &&
    !itemCondition &&
    parsedMinPrice.value === undefined &&
    parsedMaxPrice.value === undefined
  ) {
    return {
      success: false,
      statusCode: 400,
      message: 'Please provide a product name or at least one search filter.',
      items: [],
    };
  }

  if (categoryName) {
    const foundCategory = await Category.findOne({
      name: { $regex: `^${escapeRegex(categoryName)}$`, $options: 'i' },
      isActive: true,
      isDeleted: false,
    });

    if (!foundCategory) {
      return {
        success: false,
        statusCode: 404,
        message: 'Category not found.',
        alternativeItemsAvailable: false,
        items: [],
      };
    }

    query.categoryId = foundCategory._id;
  }

  if (categoryObjectId) {
    query.categoryId = categoryObjectId;
  }

  if (itemName) {
    query.name = { $regex: escapeRegex(itemName), $options: 'i' };
  } else if (searchText) {
    query.$or = [
      { name: { $regex: escapeRegex(searchText), $options: 'i' } },
      { brand: { $regex: escapeRegex(searchText), $options: 'i' } },
      { description: { $regex: escapeRegex(searchText), $options: 'i' } },
    ];
  }

  if (brandName) {
    query.brand = { $regex: escapeRegex(brandName), $options: 'i' };
  }

  if (itemCondition) {
    query.condition = itemCondition;
  }

  if (parsedMinPrice.value !== undefined || parsedMaxPrice.value !== undefined) {
    query.pricePerDay = {};

    if (parsedMinPrice.value !== undefined) {
      query.pricePerDay.$gte = parsedMinPrice.value;
    }

    if (parsedMaxPrice.value !== undefined) {
      query.pricePerDay.$lte = parsedMaxPrice.value;
    }
  }

  if (cityName) {
    query['location.city'] = {
      $regex: `^${escapeRegex(cityName)}$`,
      $options: 'i',
    };
  }

  if (stateName) {
    query['location.state'] = {
      $regex: `^${escapeRegex(stateName)}$`,
      $options: 'i',
    };
  }

  const items = await Item.find(query)
    .populate('categoryId', 'name slug')
    .populate('ownerId', 'name')
    .sort({ createdAt: -1 });

  // STEP 3: If results are found in the requested city, return them.
  if (items.length > 0) {
    return {
      success: true,
      statusCode: 200,
      message: 'Matching items found.',
      requestedCity: cityName || null,
      alternativeItemsAvailable: false,
      alternativeCities: [],
      items,
    };
  }

  // STEP 4: If no results were found in this city,
  // search other cities using the same product/category/price filters.
  if (cityName) {
    const alternativeQuery = { ...query };

    delete alternativeQuery['location.city'];

    const alternativeItems = await Item.find(alternativeQuery)
      .populate('categoryId', 'name slug')
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });

    if (alternativeItems.length > 0) {
      const alternativeCities = [
        ...new Map(
          alternativeItems
            .filter((item) => item.location && item.location.city)
            .map((item) => [item.location.city.toLowerCase(), item.location.city]),
        ).values(),
      ];

      return {
        success: true,
        statusCode: 200,
        message: `This item is not available in ${cityName}, but matching items are available in other cities.`,
        requestedCity: cityName,
        alternativeItemsAvailable: true,
        alternativeCities,
        items: alternativeItems,
      };
    }
  }

  return {
    success: false,
    statusCode: 404,
    message: 'Item is not available.',
    requestedCity: cityName || null,
    alternativeItemsAvailable: false,
    alternativeCities: [],
    items: [],
  };
};

module.exports = { createItem, getAllItems, searchItems };
