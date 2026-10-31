const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    // Item which the renter wants to rent
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },

    // User who is renting the item
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // User who owns the listed item
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Rental starting date
    startDate: {
      type: Date,
      required: true,
    },

    // Rental ending date
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },

    // Total number of rental days
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },

    // Store the item's daily price at booking time
    pricePerDay: {
      type: Number,
      required: true,
      min: 1,
    },

    // Total rental amount
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Store security deposit at booking time
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Rental request status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },

    // Reason if owner rejects the request
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },

    // Reason if rental is cancelled
    cancellationReason: {
      type: String,
      default: '',
      trim: true,
    },

    // Actual item return date
    returnedAt: {
      type: Date,
      default: null,
    },

    // Changes made here
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Changes made here
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Find bookings for a particular item
rentalSchema.index({
  itemId: 1,
  status: 1,
  startDate: 1,
  endDate: 1,
});

// Find rental requests made by a user
rentalSchema.index({
  renterId: 1,
  createdAt: -1,
});

// Find rental requests received by an item owner
rentalSchema.index({
  ownerId: 1,
  createdAt: -1,
});

module.exports = mongoose.model('Rental', rentalSchema);
