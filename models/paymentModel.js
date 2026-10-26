const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    paymentType: {
      type: String,
      enum: ['rental', 'deposit', 'late_fee', 'damage_fee', 'refund'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      default: 'INR',
      enum: ['INR'],
    },

    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'cash', 'other'],
      default: 'other',
    },

    providerOrderId: {
      type: String,
      default: null,
    },

    transactionId: {
      type: String,
      default: null,
    },

    idempotencyKey: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'successful',
        'failed',
        'refund_pending',
        'partially_refunded',
        'refunded',
      ],
      default: 'pending',
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundedAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundReason: {
      type: String,
      default: null,
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

paymentSchema.index(
  { transactionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      transactionId: { $type: 'string' },
    },
  },
);

paymentSchema.index(
  { idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: 'string' },
    },
  },
);

paymentSchema.index({ bookingId: 1, paymentStatus: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
