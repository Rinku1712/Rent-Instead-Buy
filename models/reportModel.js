const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },

    reportType: {
      type: String,
      enum: [
        'item_issue',
        'user_behavior',
        'damage',
        'late_return',
        'payment_issue',
        'fraud',
        'other',
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 3000,
    },

    evidenceImages: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 10,
        message: 'Maximum 10 evidence images are allowed',
      },
    },

    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'rejected'],
      default: 'open',
    },

    adminNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },

    resolution: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Report', reportSchema);
