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

  // CHANGE: Trim search text so empty spaces are not treated as a valid search.
  const searchText = typeof search === 'string' ? search.trim() : '';

  // CHANGE: Do not search all items accidentally when no product/category
  // filter has been provided.
  if (
    !searchText &&
    !category &&
    !categoryId &&
    !brand &&
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

  const query = {
    availabilityStatus: 'available',
    isDeleted: false,
  };

  // STEP 1: Find the selected category first.
  // If the category does not exist, stop the search.
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

    // Only search items belonging to this category.
    query.categoryId = foundCategory._id;
  }

  if (categoryId) {
    query.categoryId = categoryId;
  }

  // STEP 2: Search for the product by name, brand or description.
  // CHANGE: The search filter remains in the query during alternative search,
  // so an unrelated item like RCAR cannot match a search for Laptop.
  if (searchText) {
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

  // STEP 3: Search in the requested city first.
  if (city) {
    query['location.city'] = {
      $regex: `^${city.trim()}$`,
      $options: 'i',
    };
  }

  console.log('Search received:', searchText);
  console.log('City received:', city);
  console.log('MongoDB query:', JSON.stringify(query, null, 2));

  const items = await Item.find(query)
    .populate('categoryId', 'name slug')
    .populate('ownerId', 'name')
    .sort({ createdAt: -1 });

  // STEP 4: If matching items are found in the requested city,
  // return them immediately.
  if (items.length > 0) {
    return {
      success: true,
      statusCode: 200,
      message: 'Search completed successfully.',
      requestedCity: city || null,
      alternativeItemsAvailable: false,
      alternativeCities: [],
      items,
    };
  }

  // STEP 5: If the requested city has no matching items,
  // search other cities using the SAME product/category/price filters.
  if (city) {
    const alternativeQuery = { ...query };

    // IMPORTANT: Remove only the city filter.
    // Do not remove query.$or or the other filters.
    // This is what prevents an unknown product from returning RCAR.
    delete alternativeQuery['location.city'];

    const alternativeItems = await Item.find(alternativeQuery)
      .populate('categoryId', 'name slug')
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });

    // STEP 6: If matching items exist in other cities, return them.
    if (alternativeItems.length > 0) {
      // CHANGE: Collect unique alternative city names for better UX.
      const alternativeCities = [
        ...new Map(
          alternativeItems.map((item) => [item.location.city.toLowerCase(), item.location.city]),
        ).values(),
      ];

      return {
        success: true,
        statusCode: 200,
        message: `No matching items found in ${city}. Items are available in other cities.`,
        requestedCity: city,
        alternativeItemsAvailable: true,
        alternativeCities,
        items: alternativeItems,
      };
    }
  }

  // CHANGE: This final return runs only when neither the requested-city
  // search nor the alternative-city search finds a matching item.
  // This fixes the "unknown product returns RCAR" problem,
  // provided the product search parameter reaches this service correctly.
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
