const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },

    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

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

    rentalDays: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 1,
    },

    rentalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },

    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    damageFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
      enum: ['INR'],
    },

    bookingStatus: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'confirmed',
        'active',
        'returned',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    pickupStatus: {
      type: String,
      enum: ['pending', 'handed_over'],
      default: 'pending',
    },

    pickupAt: {
      type: Date,
      default: null,
    },

    returnStatus: {
      type: String,
      enum: ['not_returned', 'returned', 'under_inspection'],
      default: 'not_returned',
    },

    actualReturnDate: {
      type: Date,
      default: null,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: null,
      trim: true,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ renterId: 1, createdAt: -1 });
bookingSchema.index({ ownerId: 1, createdAt: -1 });
bookingSchema.index({ itemId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ bookingStatus: 1, endDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
