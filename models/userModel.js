const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    houseNumber: { type: String, trim: true },
    street: { type: String, trim: true },
    area: { type: String, trim: true },
    landmark: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
    postalCode: { type: String, trim: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      required: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    address: {
      type: addressSchema,
      default: () => ({}),
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'blocked'],
      default: 'active',
    },

    lastLoginAt: {
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

userSchema.index({ accountStatus: 1, isDeleted: 1 });

module.exports = mongoose.model('User', userSchema);
