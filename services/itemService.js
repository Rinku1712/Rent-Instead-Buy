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
  const { search, item, categoryId, category, brand, city, condition, minPrice, maxPrice } =
    filters;

  // CHANGE 1: Support both "item" and "search" query parameters.
  // "item" is specifically for searching by product name.
  const itemName = typeof item === 'string' ? item.trim() : '';
  const searchText = typeof search === 'string' ? search.trim() : '';

  const query = {
    availabilityStatus: 'available',
    isDeleted: false,
  };

  // CHANGE 2: Allow city-only and category-only searches.
  // Return an error only when no useful filter is supplied.
  if (
    !itemName &&
    !searchText &&
    !category &&
    !categoryId &&
    !brand &&
    !city &&
    !condition &&
    minPrice === undefined &&
    maxPrice === undefined
  ) {
    return {
      success: false,
      statusCode: 400,
      message: 'Please provide a product name or at least one search filter.',
      items: [],
    };
  }

  // STEP 1: Find the category if the user supplied its name.
  if (category) {
    const foundCategory = await Category.findOne({
      name: { $regex: `^${category.trim()}$`, $options: 'i' },
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

  if (categoryId) {
    query.categoryId = categoryId;
  }

  // CHANGE 3: If "item" is provided, match the product name.
  // This prevents a different product in the same category
  // from matching just because its description contains "Plain".
  if (itemName) {
    query.name = { $regex: itemName, $options: 'i' };
  } else if (searchText) {
    // General search can match name, brand or description.
    query.$or = [
      { name: { $regex: searchText, $options: 'i' } },
      { brand: { $regex: searchText, $options: 'i' } },
      { description: { $regex: searchText, $options: 'i' } },
    ];
  }

  if (brand) {
    query.brand = { $regex: brand.trim(), $options: 'i' };
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

  // STEP 2: Search in the requested city, if one was provided.
  if (city) {
    query['location.city'] = {
      $regex: `^${city.trim()}$`,
      $options: 'i',
    };
  }

  console.log('Product name received:', itemName);
  console.log('General search received:', searchText);
  console.log('City received:', city);
  console.log('MongoDB query:', JSON.stringify(query, null, 2));

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
      requestedCity: city || null,
      alternativeItemsAvailable: false,
      alternativeCities: [],
      items,
    };
  }

  // STEP 4: If no results were found in this city,
  // search other cities using the same product/category/price filters.
  if (city) {
    const alternativeQuery = { ...query };

    // CHANGE 4: Remove ONLY the city condition.
    // Keep the product name, category, brand and other filters.
    delete alternativeQuery['location.city'];

    const alternativeItems = await Item.find(alternativeQuery)
      .populate('categoryId', 'name slug')
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });

    if (alternativeItems.length > 0) {
      // Collect unique city names without repeating them.
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
        message: `This item is not available in ${city}, but matching items are available in other cities.`,
        requestedCity: city,
        alternativeItemsAvailable: true,
        alternativeCities,
        items: alternativeItems,
      };
    }
  }

  // STEP 5: No matching item was found in the requested city
  // or any other city.
  return {
    success: false,
    statusCode: 404,
    message: 'Item is not available.',
    requestedCity: city || null,
    alternativeItemsAvailable: false,
    alternativeCities: [],
    items: [],
  };
};

module.exports = { createItem, getAllItems, searchItems };
