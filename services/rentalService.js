const mongoose = require('mongoose');
const Item = require('../models/itemModel');
const Rental = require('../models/rentalModel');

// Create rental request

const createRental = async (rentalData, renterId) => {
  const { itemId, startDate, endDate } = rentalData;

  // 1. Check required fields
  if (!itemId || !startDate || !endDate) {
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

  // 6. Convert dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 7. Check valid dates

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
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
  today.setUTCHours(0, 0, 0, 0);

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
    // Changes made here
    isDeleted: { $ne: true },
  });

  if (existingRental) {
    return {
      success: false,
      statusCode: 400,
      message: 'Item is already booked for these dates',
    };
  }

  // CHANGED: Aggregate the existing item document so the pipeline has a source document.
  const priceDetails = await Item.aggregate([
    {
      $match: {
        _id: item._id,
      },
    },
    {
      $project: {
        totalDays: {
          $ceil: {
            $divide: [
              {
                $subtract: [{ $literal: end }, { $literal: start }],
              },
              86400000,
            ],
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
  // CHANGED: Return an explicit calculation error instead of dereferencing a missing result.
  if (!priceDetails.length || !priceDetails[0]) {
    return {
      success: false,
      statusCode: 500,
      message: 'Unable to calculate rental price for this item',
    };
  }

  const { totalDays, pricePerDay, totalAmount } = priceDetails[0];

  // 11. Create rental request
  const rental = await Rental.create({
    itemId: item._id,
    renterId: renterId,
    ownerId: item.ownerId,
    startDate: start,
    endDate: end,
    totalDays: totalDays,
    pricePerDay: pricePerDay,
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

// Changes made here
const getOwnerRentalRequests = async (ownerId) => {
  const rentals = await Rental.find({
    ownerId,
    isDeleted: { $ne: true },
  })
    .populate({
      path: 'itemId',
      match: { isDeleted: { $ne: true } },
      select: 'name description brand images condition pricePerDay location',
    })
    .populate('renterId', 'name email phone profileImage')
    .sort({ createdAt: -1 });

  return {
    success: true,
    statusCode: 200,
    message: 'Rental requests fetched successfully',
    data: rentals.filter((rental) => rental.itemId),
  };
};

// Changes made here
const findPendingRentalForOwner = async (rentalId, ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(rentalId)) {
    return {
      success: false,
      statusCode: 400,
      message: 'Invalid rental ID',
    };
  }

  const rental = await Rental.findOne({
    _id: rentalId,
    isDeleted: { $ne: true },
  });

  if (!rental) {
    return {
      success: false,
      statusCode: 404,
      message: 'Rental request not found',
    };
  }

  const item = await Item.findOne({
    _id: rental.itemId,
    isDeleted: { $ne: true },
  });

  if (!item) {
    return {
      success: false,
      statusCode: 404,
      message: 'Item not found',
    };
  }

  if (String(item.ownerId) !== String(ownerId)) {
    return {
      success: false,
      statusCode: 403,
      message: 'You are not the owner of this item',
    };
  }

  if (rental.status !== 'pending') {
    return {
      success: false,
      statusCode: 400,
      message: 'Only pending rental requests can be updated',
    };
  }

  return {
    success: true,
    statusCode: 200,
    message: 'Rental request found',
    data: rental,
  };
};

// Changes made here
const approveRentalRequest = async (rentalId, ownerId) => {
  const result = await findPendingRentalForOwner(rentalId, ownerId);
  if (!result.success) {
    return result;
  }

  const rental = result.data;
  const overlappingRental = await Rental.findOne({
    _id: { $ne: rental._id },
    itemId: rental.itemId,
    status: 'approved',
    startDate: { $lt: rental.endDate },
    endDate: { $gt: rental.startDate },
    isDeleted: { $ne: true },
  });

  if (overlappingRental) {
    return {
      success: false,
      statusCode: 409,
      message: 'Another approved rental overlaps with these dates',
    };
  }

  rental.status = 'approved';
  await rental.save();

  return {
    success: true,
    statusCode: 200,
    message: 'Rental request approved successfully',
    data: rental,
  };
};

// Changes made here
const rejectRentalRequest = async (rentalId, ownerId) => {
  const result = await findPendingRentalForOwner(rentalId, ownerId);
  if (!result.success) {
    return result;
  }

  const rental = result.data;
  rental.status = 'rejected';
  await rental.save();

  return {
    success: true,
    statusCode: 200,
    message: 'Rental request rejected successfully',
    data: rental,
  };
};

module.exports = {
  createRental,
  getOwnerRentalRequests,
  approveRentalRequest,
  rejectRentalRequest,
};
