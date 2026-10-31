const Item = require('../models/itemModel');
const Category = require('../models/categoryModel');

// Common Dashboard
const getCommonDashboard = async () => {
  // Get dashboard data together
  const [totalAvailableItems, totalCategories, recentItems] = await Promise.all([
    // Count available items
    Item.countDocuments({
      isDeleted: false,
      availabilityStatus: 'available',
    }),

    // Count active categories
    Category.countDocuments({
      isDeleted: false,
      isActive: true,
    }),

    // Get recently added items
    Item.find({
      isDeleted: false,
      availabilityStatus: 'available',
    })
      .populate('categoryId', 'name slug')
      .populate('ownerId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(8),
  ]);

  return {
    totalAvailableItems,
    totalCategories,
    recentItems,
  };
};

module.exports = {
  getCommonDashboard,
};
