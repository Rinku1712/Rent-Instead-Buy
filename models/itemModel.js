const mongoose = require('mongoose');

const itemLocationSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, default: 'India', trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false },
);

const itemSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    brand: {
      type: String,
      trim: true,
      default: '',
    },

    images: {
      type: [String],
      validate: {
        validator: (images) => images.length <= 10,
        message: 'Maximum 10 images are allowed',
      },
      default: [],
    },

    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair'],
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerWeek: {
      type: Number,
      min: 1,
      default: null,
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    location: {
      type: itemLocationSchema,
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'paused'],
      default: 'available',
    },

    rejectionReason: {
      type: String,
      default: null,
      trim: true,
    },

    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    totalReviews: {
      type: Number,
      min: 0,
      default: 0,
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

itemSchema.index({
  categoryId: 1,
  approvalStatus: 1,
  availabilityStatus: 1,
  isDeleted: 1,
});

itemSchema.index({ name: 'text', description: 'text' });

itemSchema.index({
  ownerId: 1,
  createdAt: -1,
});

module.exports = mongoose.model('Item', itemSchema);
