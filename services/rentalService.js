const mongoose = require('mongoose');
const Item = require('../models/itemModel');
const Rental = require('../models/rentalModel');

// Create rental request
const createRental = async (rentalData, renterId) => {
  const { itemId, startDate, endDate } = rentalData;

  // 1. Check required fields
  if (!itemId || !startDate || !endDate) {
    //This checks whether the user has provided all three required fields.
    return {
      success: false,
      statusCode: 400,
      message: 'Item ID, start date and end date are required',
    };
  }

  // 2. Check valid Item ID
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return {
      success: false,
      statusCode: 400,
      message: 'Invalid item ID',
    };
  }

  // 3. Find item
  const item = await Item.findOne({
    _id: itemId,
    isDeleted: false,
  });

  if (!item) {
    return {
      success: false,
      statusCode: 404,
      message: 'Item not found',
    };
  }

  // 4. Check item availability
  if (item.availabilityStatus !== 'available') {
    return {
      success: false,
      statusCode: 400,
      message: 'Item is not available for rent',
    };
  }

  // 5. Check item owner
  if (String(item.ownerId) === String(renterId)) {
    return {
      success: false,
      statusCode: 400,
      message: 'You cannot rent your own item',
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    //This checks whether the dates are valid // IsNAN is built in function who checks the date is valid or not
    //getTime() it converts dates into milliseconds
    return {
      success: false,
      statusCode: 400,
      message: 'Invalid rental dates',
    };
  }

  if (end <= start) {
    return {
      success: false,
      statusCode: 400,
      message: 'End date must be after start date',
    };
  }

  // 8. Check past date
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Date Normalization

  if (start < today) {
    return {
      success: false,
      statusCode: 400,
      message: 'Start date cannot be in the past',
    };
  }

  // 9. Check existing approved rental
  const existingRental = await Rental.findOne({
    itemId: itemId,
    status: 'approved',
    startDate: { $lt: end },
    endDate: { $gt: start },
  });

  if (existingRental) {
    return {
      success: false,
      statusCode: 400,
      message: 'Item is already booked for these dates',
    };
  }

  // 10. Calculate rental days and price using aggregation
  const priceDetails = await Rental.aggregate([
    {
      $documents: [
        {
          startDate: start,
          endDate: end,
          pricePerDay: item.pricePerDay,
        },
      ],
    },
    {
      $project: {
        totalDays: {
          $ceil: {
            $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000],
          },
        },
        pricePerDay: 1,
      },
    },
    {
      $project: {
        totalDays: 1,
        pricePerDay: 1,
        totalAmount: {
          $multiply: ['$totalDays', '$pricePerDay'],
        },
      },
    },
  ]);

  const { totalDays, totalAmount } = priceDetails[0];

  // 11. Create rental request
  const rental = await Rental.create({
    itemId: item._id,
    renterId: renterId,
    ownerId: item.ownerId,
    startDate: start,
    endDate: end,
    totalDays: totalDays,
    pricePerDay: item.pricePerDay,
    totalAmount: totalAmount,
    securityDeposit: item.securityDeposit,
    status: 'pending',
  });

  // 12. Return response
  return {
    success: true,
    statusCode: 201,
    message: 'Rental request created successfully. Waiting for owner approval.',
    data: rental,
  };
};

module.exports = {
  createRental,
};
