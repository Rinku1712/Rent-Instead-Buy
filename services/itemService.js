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
  const { search, item, categoryId, category, brand, city, state, condition, minPrice, maxPrice } =
    filters;

  // STEP 1: Create an empty query with default conditions
  const query = {
    availabilityStatus: 'available',
    isDeleted: false,
  };

  // STEP 2: Clean search values
  const itemName = item?.trim() || '';
  const searchText = search?.trim() || '';
  const categoryName = category?.trim() || '';
  const brandName = brand?.trim() || '';
  const cityName = city?.trim() || '';
  const stateName = state?.trim() || '';
  const itemCondition = condition?.trim() || '';

  // STEP 3: Check if user provided any search filter
  if (
    !itemName &&
    !searchText &&
    !categoryName &&
    !categoryId &&
    !brandName &&
    !cityName &&
    !stateName &&
    !itemCondition &&
    minPrice === undefined &&
    maxPrice === undefined
  ) {
    return {
      success: false,
      statusCode: 400,
      message: 'Please provide at least one search filter.',
      items: [],
    };
  }

  // STEP 4: Search category by its name
  if (categoryName) {
    const foundCategory = await Category.findOne({
      name: {
        $regex: `^${escapeRegex(categoryName)}$`,
        $options: 'i',
      },
      isActive: true,
      isDeleted: false,
    });

    if (!foundCategory) {
      return {
        success: false,
        statusCode: 404,
        message: 'Category not found.',
        items: [],
      };
    }

    query.categoryId = foundCategory._id;
  }

  // STEP 5: Search category using its ID
  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid category ID.',
        items: [],
      };
    }

    query.categoryId = categoryId;
  }

  // STEP 6: Search item by its name
  if (itemName) {
    query.name = {
      $regex: escapeRegex(itemName),
      $options: 'i',
    };
  }

  // STEP 7: Search using a general keyword
  if (!itemName && searchText) {
    query.$or = [
      {
        name: {
          $regex: escapeRegex(searchText),
          $options: 'i',
        },
      },
      {
        brand: {
          $regex: escapeRegex(searchText),
          $options: 'i',
        },
      },
      {
        description: {
          $regex: escapeRegex(searchText),
          $options: 'i',
        },
      },
    ];
  }

  // STEP 8: Filter by brand
  if (brandName) {
    query.brand = {
      $regex: escapeRegex(brandName),
      $options: 'i',
    };
  }

  // STEP 9: Filter by condition
  if (itemCondition) {
    const allowedConditions = ['new', 'like_new', 'good', 'fair'];

    if (!allowedConditions.includes(itemCondition)) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid item condition.',
        items: [],
      };
    }

    query.condition = itemCondition;
  }

  // STEP 10: Filter by minimum and maximum price
  if (minPrice !== undefined || maxPrice !== undefined) {
    const minimum = Number(minPrice);
    const maximum = Number(maxPrice);

    if (
      (minPrice !== undefined && (minPrice === '' || !Number.isFinite(minimum) || minimum < 0)) ||
      (maxPrice !== undefined && (maxPrice === '' || !Number.isFinite(maximum) || maximum < 0)) ||
      (minPrice !== undefined && maxPrice !== undefined && minimum > maximum)
    ) {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid price range.',
        items: [],
      };
    }

    query.pricePerDay = {};

    if (minPrice !== undefined) {
      query.pricePerDay.$gte = minimum;
    }

    if (maxPrice !== undefined) {
      query.pricePerDay.$lte = maximum;
    }
  }

  // STEP 11: Filter by city
  if (cityName) {
    query['location.city'] = {
      $regex: `^${escapeRegex(cityName)}$`,
      $options: 'i',
    };
  }

  // STEP 12: Filter by state
  if (stateName) {
    query['location.state'] = {
      $regex: `^${escapeRegex(stateName)}$`,
      $options: 'i',
    };
  }

  // STEP 13: Find matching items
  let items = await Item.find(query)
    .populate('categoryId', 'name slug')
    .populate('ownerId', 'name')
    .sort({ createdAt: -1 });

  // STEP 14: If items are found, return them
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

  // STEP 15: If no items are found in the requested city,
  // search in other cities
  if (cityName) {
    const alternativeQuery = { ...query };

    delete alternativeQuery['location.city'];

    items = await Item.find(alternativeQuery)
      .populate('categoryId', 'name slug')
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });

    if (items.length > 0) {
      // Get the names of available alternative cities
      const alternativeCities = [
        ...new Set(items.filter((item) => item.location?.city).map((item) => item.location.city)),
      ];

      return {
        success: true,
        statusCode: 200,
        message: `Item is not available in ${cityName}, but matching items are available in other cities.`,
        requestedCity: cityName,
        alternativeItemsAvailable: true,
        alternativeCities,
        items,
      };
    }
  }

  // STEP 16: If nothing is found
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
